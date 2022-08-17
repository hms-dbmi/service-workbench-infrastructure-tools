// 'use strict';
const mapValues = require('lodash.mapvalues');

module.exports.putUserParams = function({ uid, firstName, lastName, email }) {
  // Helper method to populate the DynamoDB types for insertion, default unknown values to a string
  const dynamoFormat = function(data = '') {
    const value = () => data;
    const thisType = [
      { f: s => typeof s == 'string', key: 'S', value },
      { f: n => typeof n == 'number', key: 'N', value },
      { f: b => typeof b == 'boolean', key: 'BOOL', value },
      { f: l => typeof l == 'object' && Array.isArray(data), key: 'L', value: () => data.map(dynamoFormat) },
      { f: m => typeof m == 'object' && !Array.isArray(data), key: 'M', value: () => mapValues(data, dynamoFormat) },
      { f: _ => true, key: 'S', value: () => JSON.stringify(data) } // default
    ].find(i => i.f(data));
    return { [thisType.key]: thisType.value() };
  };

  return {
    TableName: process.env.USER_TABLE,
    Item: mapValues({
      uid,
      applyReason: process.env.USER_REASON,
      authenticationProviderId: process.env.USER_POOL,
      createdAt: new Date().toISOString(),
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
    }, dynamoFormat)
  };
}