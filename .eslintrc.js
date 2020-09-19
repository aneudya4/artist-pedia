module.exports = {
  parser: '@typescript-eslint/parser',

  parserOptions: {
    plugins: ['@typescript-eslint'],
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],
};
