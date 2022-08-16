'use strict';
const get = require('lodash.get');
const AWS = require('aws-sdk');

AWS.config.update({ region: process.env.REGION || 'us-east-1' });
const SNS = new AWS.SNS({ apiVersion: '2010-12-01' });

const eventPaths = {
  uid: 'dynamodb.NewImage.uid.S',
  email: 'dynamodb.NewImage.email.S',
  firstName: 'dynamodb.NewImage.firstName.S',
  lastName: 'dynamodb.NewImage.lastName.S',
  createdAt: 'dynamodb.NewImage.createdAt.S',
  applyReason: 'dynamodb.NewImage.applyReason.S'
};

// Return mapped path values
const mapEventPaths = (paths, defaultValue = 'UNKNOWN') => {
  const pathEntries = Object.entries(paths);
  return record => pathEntries.reduce((acc, [ key, path ]) => 
    ({ ...acc, [key]: get(record, path, defaultValue) }),
    {}
  );
}

const formatRecord = ({ email, firstName, lastName, createdAt, applyReason }) =>
  `Name: ${firstName} ${lastName} \nCreated: ${createdAt} \nEmail: ${email} \nReason: ${applyReason}`;
 
module.exports.notification = function(dbEvents) {
    const records = dbEvents.Records.map(mapEventPaths(eventPaths));
    const users = records.map(formatRecord).join('\n\n');
    
    console.log('System created new users with uids:', records.map(({ uid }) => uid).join(', '));
    return SNS.publish({
        Subject: `AIM-AHEAD - SWB User Registrations are Pending`,
        Message:  `New user registrations:\n\n${users}`,
        TopicArn: process.env.TOPIC_ARN
      })
      .promise()
      .then(() => {
        const message = `Successfully published notification to '${process.env.TOPIC_ARN}' topic.`;
        console.log(message);
        return { statusCode: 200, body: message };
      })
      .catch(error => {
        const message = `An error occured while publishing to '${process.env.TOPIC_ARN}' topic - ${`${error.name}: ${error.message}`}`;
        console.error(message);
        return { statusCode: 500, body: message };
      });
};