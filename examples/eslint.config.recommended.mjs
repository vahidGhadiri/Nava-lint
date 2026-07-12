import nava from 'eslint-plugin-nava/recommended';

export default [
    nava,
    {
        rules: {
            'nava/no-inline-type-imports': 'error',
            'nava/multiline-type-literals': 'error',
            'nava/module-member-order': 'error',
        },
    },
];
