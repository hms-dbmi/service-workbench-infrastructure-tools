// 'use strict';
const { v4: uuid } = require('uuid');
const AWS = require('aws-sdk');

AWS.config.update({ region: process.env.REGION || 'us-east-1' });
const DDB = new AWS.DynamoDB.DocumentClient();

const status = { OK: 200, SERVER_ERROR: 500 };
const headers = { 'Content-Type': 'application/json' };

module.exports.registerUser = function(event) {
  const { firstName, lastName, email } = JSON.parse(event.body);
  const uid = uuid();
  const createdAt = new Date().toISOString();

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
      return { headers, statusCode: status.OK, body: JSON.stringify({ message }) };
    })
    .catch(error => {
      const message = 'An error occured while registering user.';
      console.error(message, error.message);
      throw new Error(`[${status.SERVER_ERROR}] ${message}`);
    });
}