module.exports = {
  root: true,
  extends: [
    'eslint:recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true,
    es2022: true,
    node: true
  },
  globals: {
    React: 'readonly',
    JSX: 'readonly'
  },
  rules: {
    // Disable some strict rules for now to avoid breaking existing code
    'no-unused-vars': 'warn',
    'no-console': 'off' // Allow console statements in this codebase
  },
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'dist/',
    'build/',
    '*.config.js',
    '*.config.ts',
    'playwright-report/',
    'test-results/',
    'pnpm-lock.yaml'
  ]
};