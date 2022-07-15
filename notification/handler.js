'use strict';
const get = require('lodash.get');

const paths = {
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

module.exports.activation = async function(dbEvent) {
  const records = dbEvent.Records.map(mapEventPaths(paths));
  const updates = records.map(({ uid, updatedBy, updatedAt }) => 
    `${uid} activated by ${updatedBy} at ${updatedAt}`
  );
  console.log('User activation:', updates.join(', '));
  return { statusCode: 200, body: {} };
}