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
  affiliation: 'dynamodb.NewImage.aaAffiliation.S',
  piName: 'dynamodb.NewImage.piName.S',
  aaProjectName: 'dynamodb.NewImage.aaProjectName.S',
  dataSources: 'dynamodb.NewImage.dataSources.L',
  createdAt: 'dynamodb.NewImage.createdAt.S'
};

// Return mapped path values
const mapEventPaths = (paths, defaultValue = 'UNKNOWN') => {
  const pathEntries = Object.entries(paths);
  return record => pathEntries.reduce((acc, [ key, path ]) => {
    let value = get(record, path, defaultValue);
    // Handle dataSources List structure
    if (key === 'dataSources' && Array.isArray(value)) {
      value = value.map(item => item.S);
    }
    return { ...acc, [key]: value };
  }, {});
}

const formatRecord = ({ email, firstName, lastName, affiliation, piName, aaProjectName, dataSources, createdAt }) =>
  `Name: ${firstName} ${lastName} \nCreated: ${createdAt} \nEmail: ${email} \nAffiliation: ${affiliation} \nPI Name: ${piName}\nAA Project Name: ${aaProjectName}\nData Sources: ${dataSources.length ? dataSources.join(', ') : 'None'}`;
 
module.exports.notification = function(dbEvents) {
    console.log('Received event:', JSON.stringify(dbEvents, null, 2));
    const records = dbEvents.Records.map(mapEventPaths(eventPaths));
    const users = records.map(formatRecord).join('\n\n');
    
    console.log('System created new users with uids:', records.map(({ uid }) => uid).join(', '));
    return SNS.publish({
        Subject: process.env.SUBJECT,
        Message: `New user registrations:\n\n${users}`,
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