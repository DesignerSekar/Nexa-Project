import js from '@eslint/js';
import nx from '@nx/eslint-plugin';
import prettier from 'eslint-config-prettier';
import a11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.nx/**',
      '**/storybook-static/**',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/coverage/**',
      '**/public/mockServiceWorker.js',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    plugins: { react, 'react-hooks': reactHooks, 'jsx-a11y': a11y },
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // Nx module boundaries: core may never reach into web.
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { '@nx': nx },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: 'scope:core',
              onlyDependOnLibsWithTags: ['scope:core'],
            },
            {
              sourceTag: 'scope:web',
              onlyDependOnLibsWithTags: ['scope:core', 'scope:web'],
            },
            {
              sourceTag: 'scope:mobile',
              onlyDependOnLibsWithTags: ['scope:core', 'scope:mobile'],
            },
          ],
        },
      ],
    },
  },

  // The core tier must stay platform-neutral so React Native can consume it.
  // See docs/mobile-readiness.md.
  {
    files: ['libs/core/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'window', message: 'libs/core must stay platform-neutral. Use an injected port.' },
        { name: 'document', message: 'libs/core must stay platform-neutral.' },
        {
          name: 'localStorage',
          message: 'libs/core must stay platform-neutral. Use KeyValueStore.',
        },
        {
          name: 'sessionStorage',
          message: 'libs/core must stay platform-neutral. Use KeyValueStore.',
        },
        { name: 'navigator', message: 'libs/core must stay platform-neutral.' },
        { name: 'location', message: 'libs/core must stay platform-neutral.' },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'axios', message: 'libs/core talks to the HttpClient port, not a transport.' },
            { name: 'antd', message: 'Ant Design has no React Native target.' },
            { name: 'echarts', message: 'Not platform-neutral.' },
            {
              name: '@tanstack/react-router',
              message: 'Web-only router. Mobile uses React Navigation.',
            },
            { name: '@nexa/platform-web', message: 'core must not depend on the web tier.' },
            { name: '@nexa/theme-web', message: 'core must not depend on the web tier.' },
            { name: '@nexa/shared-ui', message: 'core must not depend on the web tier.' },
          ],
          patterns: [
            { group: ['ag-grid*'], message: 'Not platform-neutral.' },
            { group: ['antd/*'], message: 'Ant Design has no React Native target.' },
            { group: ['@nexa/shared-ui/*'], message: 'core must not depend on the web tier.' },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'MetaProperty[meta.name="import"]',
          message: 'import.meta does not exist under Metro. Read config from an injected object.',
        },
      ],
    },
  },

  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/mocks/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-restricted-globals': 'off',
    },
  },

  {
    files: ['**/*.{js,mjs,cjs}'],
    ...tseslint.configs.disableTypeChecked,
  },

  prettier
);
