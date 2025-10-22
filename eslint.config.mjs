// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

export default defineConfig(
  eslint.configs.recommended,
  {
    ignores: ['dist/**/*', 'node_modules/**/*', '*.config.mjs', '*.config.js', 'jest.config.js', 'jest.setup.js'],
  },
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    ignores: ['dist/**/*', 'node_modules/**/*', '*.config.mjs'],
  })),
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'no-console': 'warn', // Changed from error to warn for development
      'no-unused-vars': 'off', // Turn off the base rule
      '@typescript-eslint/no-unused-vars': 'off', // Turn off TypeScript version
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-unused-expressions': 'error',
      'no-unused-labels': 'error',
    },
  },
);
