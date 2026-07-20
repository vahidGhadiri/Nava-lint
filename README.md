# @whydrf/eslint-plugin-nava

یک ESLint plugin سلیقه‌ای (opinionated) برای پروژه‌های TypeScript که قراردادهای کدتمیز،
مرتب‌سازی importها، الگوهای type-safety و ساختار یکنواخت ماژول‌ها را تحمیل می‌کند.

> نام قبلی `eslint-plugin-nava` به دلیل تداخل با پکیج موجود `eslint-plugin-ava` توسط npm رد
> شد؛ لذا پکیج به صورت scoped منتشر شده است.

---

## چرا این پلاگین؟

سه تا از قانون‌های اینجا کارهایی را انجام می‌دهند که با تنظیمات معمولی ESLint + TypeScript
عملاً غیرممکن است:

- **`no-inline-type-imports`** — قانون استاندارد `@typescript-eslint/consistent-type-imports`
  وقتی `prefer: 'type-imports'` باشد، `import { type X }` را **گزارش نمی‌کند**، چون parser تایپ‌اسکریپت
  آن را به `import type { X }` نرمال‌سازی می‌کند. این قانون در سطح متن (text-level) کار می‌کند و
  حتی `import { type X, Y }` را به دو خط جداگانه می‌شکند و خودکار اصلاح (auto-fix) می‌کند.
- **`multiline-type-literals`** — تحمیل می‌کند که type literalهای درون‌خطی (`type T = { a: string }`)
  حتماً چندخطی باشند (خوانایی در تفاوت‌های git).
- **`module-member-order`** — ترتیب declarationهای سطح بالای فایل را یکنواخت می‌کند:
  `imports → enum → type → interface → const`.

---

## نصب

```bash
# npm
npm install --save-dev @whydrf/eslint-plugin-nava

# pnpm
pnpm add -D @whydrf/eslint-plugin-nava

# yarn
yarn add -D @whydrf/eslint-plugin-nava
```

این پکیج peer dependency دارد؛ اگر در پروژه‌تان نصب نیستند، نصبشان کنید:

```bash
pnpm add -D eslint typescript typescript-eslint @eslint/js
```

| Peer dependency             | نسخه     | اجباری؟ |
| --------------------------- | -------- | ------- |
| `eslint`                    | `^9.0.0` | بله     |
| `typescript-eslint`         | `^8.0.0` | بله     |
| `@eslint/js`                | `^9.0.0` | بله     |
| `@typescript-eslint/utils`  | `^8.0.0` | اختیاری |

> نیاز به ESLint نسخه ۹ (flat config) دارد.

---

## استفاده سریع

### گزینه ۱ — فقط قانون‌ها (Recommended)

اگر می‌خواهید فقط سه قانون بالا + `consistent-type-imports` فعال شود و بقیه تنظیمات دست خودتان باشد:

```js
// eslint.config.js
import nava from '@whydrf/eslint-plugin-nava/recommended';

export default [
    nava,
    {
        rules: {
            // هر کدام را می‌خواهید بازنویسی (override) کنید
            'nava/no-inline-type-imports': 'warn',
        },
    },
];
```

### گزینه ۲ — کانفیگ کامل React

یک flat config آماده برای پروژه‌های React/TypeScript شامل:

- قانون‌های خود پلاگین
- `eslint-plugin-perfectionist` (مرتب‌سازی importها بر اساس طول خط)
- `eslint-plugin-prettier` (فرمت با Prettier)
- تنظیمات JSX، globals و غیرفعال‌سازی قانون‌های ناسازگار با React (مثل `react/react-in-jsx-scope`)

```js
// eslint.config.js
import navaReact from '@whydrf/eslint-plugin-nava/configs/react';

export default [
    ...navaReact,
    {
        rules: {
            // مثال: بازنویسی گروه‌بندی importها
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

### گزینه ۳ — فقط یک قانون خاص

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

## قانون‌ها (Rules)

### `nava/no-inline-type-imports` ⚠️ auto-fix

اجازه نمی‌دهد `import { type X }` نوشته شود و آن را به `import type { X }` تبدیل می‌کند.

```ts
// ❌ غلط
import { type Foo, bar } from './mod';

// ✅ صحیح (auto-fix خودکار این را می‌سازد)
import type { Foo } from './mod';
import { bar } from './mod';
```

اگر فقط type داشته باشد، ساده تبدیل می‌شود:

```ts
// ❌
import { type Foo } from './mod';

// ✅
import type { Foo } from './mod';
```

> نکته: این قانون در سطح متن عمل می‌کند، پس حتی وقتی parser تایپ‌اسکریپت inline type import
> را نرمال می‌کند، باز هم آن را تشخیص داده و اصلاح می‌کند.

### `nava/multiline-type-literals` ⚠️ auto-fix

تحمیل می‌کند type literalهای شیء درون‌خطی حتماً چندخطی باشند.

```ts
// ❌ غلط
type User = { id: string; name: string };

// ✅ صحیح
type User = {
    id: string;
    name: string;
};
```

همین قانون برای بدنهٔ `interface` هم اعمال می‌شود:

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

ترتیب declarationهای سطح بالای فایل را بعد از بلوک importها تحمیل می‌کند:

```
imports → enum → type → interface → const
```

```ts
// ❌ غلط (ترتیب به‌هم‌ریخته)
const DEFAULTS = {};
type Id = string;
interface User {}

// ✅ صحیح (auto-fix این را می‌سازد)
type Id = string;
interface User {}
const DEFAULTS = {};
```

> قانون فقط بلوک اولِ declarationها (تا اولین چیزی که جزو این چهار دسته نیست) را بررسی می‌کند
> و اگر بین آن‌ها کامنت باشد، برای جلوگیری از حذف کامنت auto-fix را اعمال نمی‌کند (فقط هشدار می‌دهد).

---

## کانفیگ‌های ارائه‌شده

| Export                              | توضیح                                                                 |
| ----------------------------------- | --------------------------------------------------------------------- |
| `@whydrf/eslint-plugin-nava/recommended`   | یک `Linter.Config` شامل سه قانون + `consistent-type-imports`.         |
| `@whydrf/eslint-plugin-nava/configs/react` | آرایه‌ای از کانفیگ‌ها برای پروژهٔ React/TS (perfectionist + prettier). |

---

## اجرا و Auto-fix

```bash
# فقط بررسی (lint)
pnpm eslint .

# بررسی + اصلاح خودکار
pnpm eslint . --fix
```

### تنظیم VS Code برای اصلاح خودکار هنگام ذخیره (on-save)

فایل `.vscode/settings.json`:

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

با این تنظیم، خطاها به صورت زنده در ادیتور نشان داده می‌شوند و با هر بار ذخیره (`Ctrl/Cmd+S`)
به طور خودکار اصلاح می‌شوند.

---

## مثال‌های آماده (Examples)

در پوشهٔ [`examples/`](./examples) دو فایل کانفیگ کامل آماده شده است که می‌توانید مستقیماً
کپی کنید:

- [`examples/eslint.config.recommended.mjs`](./examples/eslint.config.recommended.mjs)
- [`examples/eslint.config.react.mjs`](./examples/eslint.config.react.mjs)

---

## سوالات متداول (FAQ)

**آیا با Prettier تداخل دارد؟**
کانفیگ `react` شامل `prettier/prettier` است، پس Prettier به عنوان قانون ESLint اجرا می‌شود
و تداخلی ندارد. در کانفیگ `recommended` خودتان باید Prettier را جدا تنظیم کنید.

**چرا اسم scoped است؟**
نام `eslint-plugin-nava` توسط npm به دلیل شباهت به `eslint-plugin-ava` رد شد؛ لذا از
`@whydrf/eslint-plugin-nava` استفاده می‌شود.

**آیا قانون‌ها قابل غیرفعال‌سازی تکی هستند؟**
بله. بعد از import کردن کانفیگ، هر قانون را می‌توانید با `"off"` یا سطح دلخواه بازنویسی کنید.

---

## لینک‌های بیشتر

- [راهنمای مهاجرت (Migration)](./docs/migration.md)
- [نکات استفاده (Tips)](./docs/tips.md)
- [مشارکت (Contributing)](./CONTRIBUTING.md)
- [امنیت (Security)](./SECURITY.md)
- [تغییرات (Changelog)](./CHANGELOG.md)

## لایسنس

[MIT](./LICENSE)
