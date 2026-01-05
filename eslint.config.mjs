import eslint from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'
import neostandard, { resolveIgnoresFromGitignore } from 'neostandard'

export default defineConfig(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    ...neostandard(),
    {
        plugins: {
            '@stylistic': stylistic
        }
    },
    {
        ignores: [
            ...resolveIgnoresFromGitignore()
        ]
    },
    [globalIgnores([
        'node_modules',
        'lib/',
        'jest.config.js',
        'index.js'
    ])],
    {
        rules: {
            'object-shorthand': ['error'],
            'no-console': ['error', { allow: ['debug', 'info', 'warn', 'error'] }],
            'quotes': ['off', 'error', 'single', { 'avoidEscape': true }],
            'camelcase': 'off',
            'eqeqeq': 'error',
            'no-empty': ['error', { 'allowEmptyCatch': true }],
            'no-unused-vars': ['error', {
                'args': 'none',
                'caughtErrors': 'none'
            }],
            'yoda': 'off',
            '@stylistic/indent': ['warn', 4], // https://eslint.style/rules/indent#options
            '@stylistic/linebreak-style': ['error', 'unix'],
            '@stylistic/quote-props': ['warn', 'consistent'],
            '@stylistic/no-multi-spaces': 'error', // https://eslint.style/rules/no-multi-spaces#no-multi-spaces
            '@stylistic/comma-dangle': ['error', 'never'] // https://eslint.style/rules/comma-dangle#comma-dangle
        }
    }
)
