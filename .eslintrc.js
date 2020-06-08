module.exports = {
  ...require('@ackee/styleguide-backend-config/eslint'),
  ignorePatterns: ['dist'],
  parserOptions: {
    project: '.eslint.tsconfig.json',
  },
  rules: {
    ...require('@ackee/styleguide-backend-config/eslint').rules,
    '@typescript-eslint/no-misused-promises': 1,
    '@typescript-eslint/ban-ts-ignore': 1,
  },
}
