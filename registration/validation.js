// 'use strict';
const AJV = require("ajv").default;
const schema = require('./schema.json');

const jsonValidator = new AJV({ allErrors: true });
require("ajv-errors")(jsonValidator);

module.exports.validateInput = function(data){
  const validator = jsonValidator.compile(schema);
  const valid = validator(data);
  let errors = [];
  if (!valid) {
    errors = validator.errors.map(e => e.message);
  }
  return { data, errors };
}