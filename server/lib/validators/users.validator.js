const validate = require('validate.js');

const validator = {
  recovery: [
    {
      account: {
        presence: {
          message: '^You must enter an account to recover',
          allowEmpty: false,
        },
      },
    },
    {
      code: {
        presence: {
          allowEmpty: false,
        },
      },
    },
    {
      password: {
        presence: true,
        length: {
          minimum: 6,
          maximum: 18,
        },
      },
      confirmPassword: {
        presence: true,
        equality: {
          attribute: 'password',
          message: '^The password does not match',
        },
      },
    },
  ],
  register: {
    username: {
      presence: true,
      length: {
        minimum: 6,
        maximum: 18,
      },
      format: {
        pattern: '[a-z0-9_.]+',
        flags: 'i',
        message: 'must contain only alphanumeric characters, numbers or symbols [_.]',
      },
    },
    password: {
      length: {
        minimum: 6,
        maximum: 18,
      },
    },
    confirmPassword: {
      equality: {
        attribute: 'password',
        message: '^The password does not match',
      },
    },
    email: {
      presence: {
        allowEmpty: false,
      },
      email: true,
    },
    confirmEmail: {
      equality: {
        attribute: 'email',
        message: '^The email does not match',
      },
    },
  },
  validate(data, rules) {
    return validate(data, rules);
  },
};

module.exports = validator;
