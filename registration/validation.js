// 'use strict';
const AJV = require("ajv").default;
const RE2 = require("re2"); // See https://ajv.js.org/security.html#redos-attack
const addFormats = require("ajv-formats");
const addErrors = require("ajv-errors");

const schema = require('./schema.json');

const jsonValidator = new AJV({ allErrors: true, regExp: RE2 });
addErrors(jsonValidator);
addFormats(jsonValidator, { mode: 'fast', formats: [ "email" ] });

module.exports.validateInput = function(data){
  const validator = jsonValidator.compile(schema);
  const valid = validator(data);
  let errors = [];
  if (!valid) {
    errors = validator.errors.map(e => e.message);
  }
  return errors;
}