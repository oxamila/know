import js from '@eslint/js'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

/**
 * Shared ESLint flat config for Next.js workspaces.
 *
 * eslint-config-next@16 ships native ESLint 9 flat configs (Linter.Config[]),
 * so no FlatCompat layer is needed:
 *   - eslint-config-next/core-web-vitals -> react, hooks, import, jsx-a11y,
 *     @next/eslint-plugin-next (core-web-vitals) + TS parser wiring
 *   - eslint-config-next/typescript      -> typescript-eslint recommended
 *
 * Usage in a Next app: `import config from '@repo/eslint-config/next'`
 */
export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/out/**',
      '**/build/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/playwright-report/**',
      '**/test-results/**',
      'next-env.d.ts',
      '_internal/**',
    ],
  },
  js.configs.recommended,
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'smart'],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
    },
  },
]
