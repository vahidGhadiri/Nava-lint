import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        ignores: ['dist/**', 'node_modules/**'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        },
    },
];
