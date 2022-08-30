// 'use strict';
const { v4: uuid } = require('uuid');
const AWS = require('aws-sdk');

AWS.config.update({ region: process.env.REGION || 'us-east-1' });
const DDB = new AWS.DynamoDB.DocumentClient();

const status = { 
  OK: 200,
  BAD_REQUEST: 400,
  SERVER_ERROR: 500
};

class Response {
  constructor(message = "", statusCode = status.OK){
    const body = JSON.stringify({ message });
    this.statusCode = statusCode;
    this.body = body;
    this.headers = { 'Content-Type': 'application/json' };
  }
}

module.exports.registerUser = async function(event) {
  const { firstName, lastName, email } = JSON.parse(event.body);
  const uid = uuid();
  const createdAt = new Date().toISOString();

  try {
    const emailExists = await DDB.query({
      TableName: process.env.USER_TABLE,
      IndexName: 'Principal',
      KeyConditionExpression: 'username = :email',
      ExpressionAttributeValues: { ':email': email },
      Select: 'COUNT'
     }).promise()
      .then(({ Count }) => Count > 0);
     
    if(emailExists){
      const message = `User email ${email} already exists.`;
      console.error(message);
      return new Response(message, status.BAD_REQUEST);
    }

    await DDB.put({
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
    }).promise();
    const message = `Successfully registered user ${uid}.`;
    console.log(message);
    return new Response(message);
  } catch(error) {
    const message = 'An error occured while registering user.';
    console.error(message, error.message);
    return new Response(message, status.SERVER_ERROR);
  }
}