import navaReact from 'eslint-plugin-nava/configs/react';

export default [
    ...navaReact,
    {
        rules: {
            'perfectionist/sort-imports': [
                'error',
                {
                    groups: [['builtin', 'external'], ['alias'], ['parent', 'sibling', 'index'], 'unknown'],
                    customGroups: [
                        { elementNamePattern: '^@modules/', groupName: 'alias' },
                        { elementNamePattern: '^src/', groupName: 'sibling' },
                    ],
                    type: 'line-length',
                    newlinesBetween: 1,
                    order: 'desc',
                },
            ],
        },
    },
];
