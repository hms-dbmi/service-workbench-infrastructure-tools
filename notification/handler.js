'use strict';
const get = require('lodash.get');
const AWS = require('aws-sdk');

AWS.config.update({ region: process.env.REGION || 'us-east-1' });
const sesClient = new AWS.SES({apiVersion: '2010-12-01'});

const eventPaths = {
  uid: 'dynamodb.NewImage.uid.S',
  firstName: 'dynamodb.NewImage.firstName.S',
  lastName: 'dynamodb.NewImage.lastName.S',
  email: 'dynamodb.NewImage.email.S',
  updatedAt: 'dynamodb.NewImage.updatedAt.S',
  updatedBy: 'dynamodb.NewImage.updatedBy.S'
}

// Return mapped path values
const mapEventPaths = (paths, defaultValue = 'UNKNOWN') => {
  const pathEntries = Object.entries(paths);
  return record => pathEntries.reduce((acc, [ key, path ]) => 
    ({ ...acc, [key]: get(record, path, defaultValue) }),
    {}
  );
}

const eventData = ({ uid, updatedBy, updatedAt }) => `${uid} activated by ${updatedBy} at ${updatedAt}`;
const sendEmail = async ({ email, firstName, lastName }) => {
  const params = {
    Source: `AIM-AHEAD <${process.env.FROM_EMAIL}>`,
    Template: process.env.TEMPLATE,
    Destination: {
      ToAddresses: [ email ]
    },
    TemplateData: JSON.stringify({ name: `${firstName} ${lastName}` })
  };
  return sesClient.sendTemplatedEmail(params).promise();
}

module.exports.activation = async function(dbEvent) {
  const records = dbEvent.Records.map(mapEventPaths(eventPaths));
  console.log('User activation:', records.map(eventData).join(', '));

  const emailAttempts = await Promise.allSettled(records.map(sendEmail));
  const rejected = emailAttempts.filter(attempt => attempt.status == 'rejected');
  rejected.forEach(error => console.error(error.reason));

  return {
    statusCode: 200,
    body: rejected.length == 0 ? {}
      : `An error occured while sending emails. Success: ${records.length - rejected.length}, Failure: ${rejected.length}`
  };
}