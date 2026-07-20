# @whydrf/eslint-plugin-nava

An opinionated ESLint plugin for TypeScript projects that enforces clean-code conventions,
import organization, type-safety patterns, and a consistent module structure.

> The original name `eslint-plugin-nava` was rejected by npm for being too similar to the
> existing `eslint-plugin-ava`, so the package is published under the `@whydrf` scope.

---

## Why this plugin?

Three of the bundled rules do things that standard ESLint + TypeScript setups can't easily do:

- **`no-inline-type-imports`** — The standard `@typescript-eslint/consistent-type-imports` rule
  with `prefer: 'type-imports'` does **not** report `import { type X }`, because the TypeScript
  parser normalizes it to `import type { X }`. This rule works at the text level, so it still
  catches inline type imports, and even splits `import { type X, Y }` into separate type/value
  imports with auto-fix.
- **`multiline-type-literals`** — Enforces that inline object type literals
  (`type T = { a: string }`) and interface bodies are always multiline (better git diffs).
- **`module-member-order`** — Keeps top-level declarations in a consistent order:
  `imports → enum → type → interface → const`.

---

## Installation

```bash
# npm
npm install --save-dev @whydrf/eslint-plugin-nava

# pnpm
pnpm add -D @whydrf/eslint-plugin-nava

# yarn
yarn add -D @whydrf/eslint-plugin-nava
```

This package has peer dependencies. Install them if they aren't already in your project:

```bash
pnpm add -D eslint typescript typescript-eslint @eslint/js
```

| Peer dependency            | Version  | Required? |
| -------------------------- | -------- | --------- |
| `eslint`                   | `^9.0.0` | yes       |
| `typescript-eslint`        | `^8.0.0` | yes       |
| `@eslint/js`               | `^9.0.0` | yes       |
| `@typescript-eslint/utils` | `^8.0.0` | optional  |

> Requires ESLint 9 (flat config).

---

## Quick start

### Option 1 — Rules only (Recommended)

If you just want the three rules + `consistent-type-imports` enabled and keep the rest of your
config under your control:

```js
// eslint.config.js
import nava from '@whydrf/eslint-plugin-nava/recommended';

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

### Option 2 — Full React config

A ready-made flat config for React/TypeScript projects that includes:

- the plugin's own rules
- `eslint-plugin-perfectionist` (import sorting by line length)
- `eslint-plugin-prettier` (formatting via Prettier)
- JSX settings, browser globals, and disabling React-incompatible rules like `react/react-in-jsx-scope`

```js
// eslint.config.js
import navaReact from '@whydrf/eslint-plugin-nava/configs/react';

export default [
    ...navaReact,
    {
        rules: {
            // example: override import grouping
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

### Option 3 — A single rule

```js
// eslint.config.js
import nava from '@whydrf/eslint-plugin-nava';

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

---

## Rules

### `nava/no-inline-type-imports` ⚠️ auto-fix

Disallows `import { type X }` and enforces `import type { X }`.

```ts
// ❌ wrong
import { type Foo, bar } from './mod';

// ✅ correct (auto-fix produces this)
import type { Foo } from './mod';
import { bar } from './mod';
```

If the import only holds types, it is converted directly:

```ts
// ❌
import { type Foo } from './mod';

// ✅
import type { Foo } from './mod';
```

> Note: this rule works at the text level, so it still detects and fixes inline type imports
> even after the TypeScript parser has normalized them.

### `nava/multiline-type-literals` ⚠️ auto-fix

Enforces that inline object type literals span multiple lines.

```ts
// ❌ wrong
type User = { id: string; name: string };

// ✅ correct
type User = {
    id: string;
    name: string;
};
```

The same applies to `interface` bodies:

```ts
// ❌
interface User { id: string; name: string }

// ✅
interface User {
    id: string;
    name: string;
}
```

### `nava/module-member-order` ⚠️ auto-fix

Enforces the order of top-level declarations (after the import block):

```
imports → enum → type → interface → const
```

```ts
// ❌ wrong (mixed up)
const DEFAULTS = {};
type Id = string;
interface User {}

// ✅ correct (auto-fix produces this)
type Id = string;
interface User {}
const DEFAULTS = {};
```

> The rule only checks the leading block of declarations (up to the first statement that is not
> one of these four kinds). If there are comments between them, auto-fix is skipped to avoid
> dropping comments — only a report is emitted.

---

## Provided configs

| Export                                       | Description                                                          |
| -------------------------------------------- | -------------------------------------------------------------------- |
| `@whydrf/eslint-plugin-nava/recommended`     | A `Linter.Config` with the three rules + `consistent-type-imports`.  |
| `@whydrf/eslint-plugin-nava/configs/react`   | An array of configs for React/TS projects (perfectionist + prettier).|

---

## Running and auto-fixing

```bash
# lint only
pnpm eslint .

# lint + auto-fix
pnpm eslint . --fix
```

### VS Code on-save auto-fix

`.vscode/settings.json`:

```json
{
    "eslint.experimental.useFlatConfig": true,
    "eslint.packageManager": "pnpm",
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": "explicit"
    },
    "eslint.workingDirectories": [{ "mode": "auto" }]
}
```

With this setup, errors are shown live in the editor and fixed automatically on every save
(`Ctrl/Cmd+S`).

---

## Ready-made examples

The [`examples/`](./examples) folder contains two complete, copy-paste-ready config files:

- [`examples/eslint.config.recommended.mjs`](./examples/eslint.config.recommended.mjs)
- [`examples/eslint.config.react.mjs`](./examples/eslint.config.react.mjs)

---

## FAQ

**Does it conflict with Prettier?**
The `react` config includes `prettier/prettier`, so Prettier runs as an ESLint rule with no
conflict. In the `recommended` config you set up Prettier separately.

**Why is the name scoped?**
`eslint-plugin-nava` was rejected by npm for being too similar to `eslint-plugin-ava`, so the
package is published as `@whydrf/eslint-plugin-nava`.

**Can individual rules be turned off?**
Yes. After importing a config, override any rule with `"off"` or your preferred severity.

---

## Further reading

- [Migration guide](./docs/migration.md)
- [Usage tips](./docs/tips.md)
- [Contributing](./CONTRIBUTING.md)
- [Security](./SECURITY.md)
- [Changelog](./CHANGELOG.md)

## License

[MIT](./LICENSE)
