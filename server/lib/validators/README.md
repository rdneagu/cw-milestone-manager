# How to create new validators

Preferably, the name of the validator should be close to what the table will be named.

Example: If validator is related to coursework, the file should be named `coursework.validator.js`

#### Creating and importing your validator along the `validate.js` package
###### In your `coursework.validator.js` file
```javascript
const validator = {
  // validation rules
}

module.exports = validator;
```
###### In your `coursework.js` helper file which is located in the /lib folder
```javascript
const validate = require('validate.js');
const validators = require('./validators/coursework.validator.js');
```

#### How to use the created validator
###### First you have to define some rules in the validator file:
List of rules: https://validatejs.org/#validators
```javascript
const validator = {
  // validation rules for coursework creation form
  create: {
    title: {
      // Presence restricts the field to not be undefined or empty (see allowEmpty: false)
      presence: {
        message: '^You must enter a title', // The caret at the beginning specifies that the error message starts here (without it will be automatically prefixed)
        allowEmpty: false, // Do not allow empty ('') entries
      },
      // Length is self explanatory (must have between min and max characters)
      length: {
        minimum: 6,
        maximum: 18,
      },
      // Format is testing the value against the regex pattern to see if it matches
      format: {
        pattern: '[a-z0-9 ]+', // This pattern allows only alphanumeric characters, numbers or empty spaces
        flags: 'i', // Regex identifier (i means case insensitive)
        message: 'must contain only alphanumeric characters, numbers or empty space', // Without caret, prefixed automatically (Title must contain...)
      },
    },
  },
}
module.exports = validator;
```
###### Using the validator is simple, in your helper function:
```javascript
const validate = require('validate.js');
const validators = require('./validators/coursework.validator.js');

const coursework = {
  async create(data) {
    // Attempt to validate the data using the validator created, it will store any errors returned
    const error = validate(data, validators.create);
    // If error is not undefined it means we have errors in our validator so we throw it back since it will be catched by the route
    if (error) {
      throw error;
    }
    // Reaching this line means the fields are validated
    return true;
  }
}
```
