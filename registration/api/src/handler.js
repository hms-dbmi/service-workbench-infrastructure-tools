// 'use strict';
const { v4: uuid } = require('uuid');
const AWS = require('aws-sdk');

const { getUserParams } = require('./db');
const { validateInput } = require('./validation');

AWS.config.update({ region: process.env.REGION || 'us-east-1' });
const DDB = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

const status = {
  OK: 200,
  BAD_REQUEST: 400,
  SERVER_ERROR: 500
};

module.exports.registration = function(data, validateInput, getUserParams, uuid) {
  // Validate user input
  const validationErrors = validateInput(data);
  if (validationErrors.length > 0) {
    console.error(`User validation errors:\n${validationErrors.join('\n')}`);
    return {
      statusCode: status.BAD_REQUEST,
      body: {
        message: 'Encountered input validation errors.',
        errors: validationErrors
      }
    }
  }

  // Insert into database
  const uid = uuid();
  const createdAt = new Date().toISOString();
  return DDB.putItem(getUserParams({ uid, createdAt, ...data }))
    .promise()
    .then(() => {
      const message = `Successfully registered user ${uid}.`;
      console.log(message);
      return { statusCode: status.OK, body: message };
    })
    .catch(error => {
      const message = 'An error occured while registering user.';
      console.error(message, error.message);
      return { statusCode: status.SERVER_ERROR, body: message };
    });
}

module.exports.registerUser = function(data){
  return this.registration(data, validateInput, getUserParams, uuid);
}