'use strict';
const AWS = require('aws-sdk');

AWS.config.update({ region: process.env.REGION || 'us-east-1' });

const SNS = new AWS.SNS({ apiVersion: '2010-12-01' });
const CE = new AWS.CostExplorer({ apiVersion: '2017-10-25' });
const Dollar = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const dimensions = {
  byUser: {
    Granularity: 'DAILY',
    Metrics: ['BlendedCost'],
    GroupBy: [
      {
        Type: 'TAG',
        Key: 'CreatedBy',
      }
    ],
    Filter: {
      Tags: {
        Key: 'Proj',
        Values: [process.env.PROJECT],
      }
    },
  },
  byEnv: user => ({
    Granularity: 'DAILY',
    Metrics: ['BlendedCost'],
    GroupBy: [
      {
        Type: 'TAG',
        Key: 'Env',
      }
    ],
    Filter: {
      Tags: {
        Key: 'CreatedBy',
        Values: [user],
      }
    },
  })
}

function sendNotification(subject, message) {
  return SNS.publish({
    Subject: subject,
    Message: message,
    TopicArn: process.env.TOPIC_ARN
  })
    .promise();
}

function getUsersAboveThreshold(start, end) {
  return CE.getCostAndUsage({
    TimePeriod: {
      Start: start.toISOString().split('T')[0],
      End: end.toISOString().split('T')[0],
    },
    ...dimensions.byUser
  })
    .promise()
    .then(result => {
      const byUser = result.ResultsByTime.reduce((users, item) => {
        item.Groups.forEach(group => {
          if (group.Metrics.BlendedCost.Amount > 0) {
            const user = group.Keys[0].replace('CreatedBy$', '');
            const cost = Math.round(group.Metrics.BlendedCost.Amount * 100) / 100;
            const userAcc = users[user] || 0;
            users[user] = userAcc + cost;
          }
        });
        return users;
      }, {});
      return Object.entries(byUser).filter(([_, cost]) => cost > process.env.THRESHOLD);
    });
}

function getEnvsForUser(start, end, user) {
  return CE.getCostAndUsage({
    TimePeriod: {
      Start: start.toISOString().split('T')[0],
      End: end.toISOString().split('T')[0],
    },
    ...dimensions.byEnv(user)
  })
    .promise()
    .then(result => {
      const byEnv = result.ResultsByTime.reduce((envs, item) => {
        item.Groups.forEach(group => {
          if (group.Metrics.BlendedCost.Amount > 0) {
            const user = group.Keys[0].replace('Env$', '');
            const cost = Math.round(group.Metrics.BlendedCost.Amount * 100) / 100;
            const byEnv = envs[user] || 0;
            envs[user] = byEnv + cost;
          }
        });
        return envs;
      }, {});
      return Object.entries(byEnv)
        .filter(([env, cost]) => cost > 0)
        .sort(function costSort([envA, costA], [envB, costB]) {
          if (costA == costB) return 0;
          else return costA > costB ? -1 : 1;
        });
    });
}

module.exports.billingNotification = async function () {
  try {
    const start = new Date();
    start.setDate(start.getDate() - 30);
    const end = new Date();

    const overThreshold = await getUsersAboveThreshold(start, end);
    if (overThreshold.length == 0) {
      const body = `No users were over the $${process.env.THRESHOLD} threshold for '${process.env.PROJECT}' project.`;
      console.log(body);
      return { statusCode: 200, body };
    }

    const messageContent = await Promise.allSettled(
      overThreshold.map(async ([user, cost]) => {
        const userLine = `${user} - ${Dollar.format(cost)}`;
        const envs = await getEnvsForUser(start, end, user);
        const envLine = envs.slice(Math.max(envs.length - 5, 0))
          .map(([env, envCost]) => `  - ${env} - ${Dollar.format(envCost)}`)
          .join('\n');
        return `${userLine}\n${envLine}${envs.length == 5 ? '\n...' : ''}`;
      })
    );

    const subject = `${process.env.ENVIRONMENT} SWB - Billing Notice`;
    const message = `Below user${overThreshold.length > 0 ? 's' : ''} are over the `
      + `${Dollar.format(process.env.THRESHOLD)} threshold for '${process.env.PROJECT}' project:\n\n`
      + `${messageContent.map(({ value }) => value).join('\n\n')}`;
    await sendNotification(subject, message);

    return { status: 200, body: `Successfully sent notification for ${overThreshold.length} users over threshold.` };
  } catch (error) {
    const body = `An error occured while accessing CostExplorer or publishing to '${process.env.TOPIC_ARN}' topic - ${error.name}: ${error.message}`;
    console.error(body);
    return { statusCode: 500, body };
  }
};