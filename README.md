# eslint-plugin-nava

An opinionated ESLint plugin for TypeScript projects that enforces clean code conventions, import organization, type safety patterns, and consistent module structure.

## Features

Custom rules:

- **`nava/no-inline-type-imports`** — Disallows `import { type X }` and enforces `import type { X }`. Also splits mixed imports (`import { type X, Y }`) into separate type/value imports. This rule works at the text level, so it reports and auto-fixes even though the TypeScript parser normalizes inline type imports.
- **`nava/multiline-type-literals`** — Enforces that inline object type literals and interface bodies span multiple lines.
- **`nava/module-member-order`** — Enforces top-level declarations to be ordered as `imports -> enum -> type -> interface -> const`.

Bundled configurations:

- **`nava/recommended`** — registers the plugin rules plus `@typescript-eslint/consistent-type-imports`.
- **`nava/react`** — a full flat config for React/TypeScript projects. It includes `eslint-plugin-perfectionist` (import sorting) and `eslint-plugin-prettier`, and is customizable (see below).

## Installation

```bash
npm install --save-dev eslint-plugin-nava
# or
pnpm add -D eslint-plugin-nava
```

`eslint` and `typescript-eslint` are peer dependencies and must be installed in your project.

## Usage

### Recommended (rules only)

In your `eslint.config.js` / `eslint.config.mjs`:

```js
import nava from 'eslint-plugin-nava/recommended';

export default [
    nava,
    {
        rules: {
            // override any rule here
            'nava/no-inline-type-imports': 'warn',
        },
    },
];
```

### Full React config

```js
import navaReact from 'eslint-plugin-nava/configs/react';

export default [
    ...navaReact,
    {
        rules: {
            // override any rule or add your own
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
```

### Single rule

```js
import nava from 'eslint-plugin-nava';

export default [
    {
        plugins: { nava },
        rules: {
            'nava/no-inline-type-imports': 'error',
            'nava/multiline-type-literals': 'error',
            'nava/module-member-order': 'error',
        },
    },
];
```

## Rules

| Rule | Description | Fixable |
| --- | --- | --- |
| `nava/no-inline-type-imports` | Use `import type { X }` instead of `import { type X }` | ✅ |
| `nava/multiline-type-literals` | Inline object type literals and interface bodies must be multiline | ✅ |
| `nava/module-member-order` | Top-level declarations ordered as `imports -> enum -> type -> interface -> const` | ✅ |

## License

MIT

## Tips
- Import the recommended config to enable all rules at once.

## Migration
See [docs/migration.md](docs/migration.md) for moving from local rules.

## FAQ
**Why a custom no-inline-type-imports?** The TypeScript parser normalizes inline type imports, so a standard rule cannot report them. This rule inspects raw text.

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md).

## Internal
Rules share a small sort helper in src/sort-utils.ts.

## Status
- v0.1.0: initial release

## Status
- v0.1.0: initial release

## Internals
Rules share a small sort helper.

## Contributing
See CONTRIBUTING.md for local setup.
