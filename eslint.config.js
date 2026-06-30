import js from '@eslint/js';
import playwright from 'eslint-plugin-playwright';

export default [
  js.configs.recommended,
  {
    files: ['tests/**/*.js', '**/*.spec.js'],
    plugins: {
      playwright,
    },
    rules: {
      ...playwright.configs.recommended.rules,
      'playwright/no-focused-test': 'error',
      'playwright/no-skipped-test': 'warn',
      'no-unused-vars': 'warn',
      'semi': ['error', 'always'],
      'quotes': ['error', 'single'],
      'indent': ['error', 2],
      'comma-dangle': ['error', 'always-multiline'],
      'eol-last': ['error', 'always'],
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
    },
    languageOptions: {
      globals: {
        process: 'readonly',
      },
    },
  },
  {
    ignores: [
      'node_modules',
      'playwright-report',
      'test-results',
    ],
  },
];