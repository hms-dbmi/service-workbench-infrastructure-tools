// 'use strict';
const { v4: uuid } = require('uuid');
const AWS = require('aws-sdk');

// const { getUserParams } = require('./db');
const { validateInput } = require('./validation');

AWS.config.update({ region: process.env.REGION || 'us-east-1' });
// const DDB = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
const DDB = new AWS.DynamoDB.DocumentClient();
console.log('DDB put', DDB.put());

const status = {
  OK: 200,
  BAD_REQUEST: 400,
  SERVER_ERROR: 500
};

module.exports.registration = function(data, validateInput, uuid) {
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
  const { firstName, lastName, email } = data;
  return DDB.put({
    TableName: process.env.USER_TABLE,
    Item: {
      uid,
      applyReason: process.env.USER_REASON,
      authenticationProviderId: process.env.USER_POOL,
      createdAt,
      createdBy: '_system_',
      email,
      username: email,
      encryptedCreds: 'N/A',
      firstName,
      lastName,
      identityProviderName: process.env.IDP_NAME,
      isAdmin: false,
      isExternalUser: true,
      isNativePoolUser: false,
      isSamlAuthenticatedUser: true,
      ns: `${process.env.IDP_NAME}||||${process.env.USER_POOL}`,
      projectId: [],
      rev: '1',
      status: 'pending',
      userRole: process.env.USER_ROLE
    }
  }).promise()
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
  return this.registration(data, validateInput, uuid);
}