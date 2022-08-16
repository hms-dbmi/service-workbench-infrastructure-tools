// 'use strict';
const { v4: uuid } = require('uuid');
const AWS = require('aws-sdk');

const { putUserParams } = require('./db');
const { validateInput } = require('./validation');

AWS.config.update({ region: process.env.REGION || 'us-east-1' });
const DDB = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

module.exports.registration = function(data) {
  // Validate user input
  const validation = validateInput(data)
  if (validation.errors.length > 0) {
    console.error(`User validation errors:\n${validation.errors.join('\n')}`);
    return {
      status: 400,
      body: {
        message: 'Encountered input validation errors.',
        errors: validation.errors
      }
    }
  }

  // Insert into database
  const uid = uuid();
  return DDB.putItem(putUserParams({ uid, ...data }))
    .promise()
    .then(() => {
      const message = `Successfully registered user as ${uid}.`;
      console.log(message);
      return { statusCode: 200, body: message };
    })
    .catch(error => {
      const message = 'An error occured while registering user.';
      console.error(message, error);
      return { statusCode: 500, body: message };
    });
};
