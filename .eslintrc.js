module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ['plugin:vue/essential', '@vue/airbnb'],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'max-len': ["error", { "code": 350 }],
    'object-curly-newline': ["error", { "consistent": true }],
    'no-throw-literal': 'off',
    'linebreak-style': 'off',
    'no-plusplus': 'off',
    'new-cap': 'off',
    'no-param-reassign': 'off',
    'no-underscore-dangle': 'off',
  }
};
