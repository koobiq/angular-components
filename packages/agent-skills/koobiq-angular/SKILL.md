---
name: koobiq-angular
description: Builds and edits Angular UI with the Koobiq design system (@koobiq/components) - kbq-* components, --kbq-* design tokens, themes, forms, icons, localization and version upgrades. Use whenever a task creates or changes screens, forms, tables, dialogs, navigation or styles in a project that depends on @koobiq/components, when choosing which Koobiq component fits a need, or when upgrading Koobiq. Also applies to requests in Russian, such as "сделай форму на Koobiq", "добавь модальное окно", "какой компонент Koobiq выбрать", "обнови Koobiq".
license: MIT
metadata:
    koobiq-version: '{{VERSION}}'
    angular: '{{NG_VERSION}}'
---

# Koobiq for Angular

This skill was generated for `@koobiq/components` {{VERSION}} (Angular {{NG_VERSION}}). It holds the rules and the map of
components. The facts for the version the project actually has installed live next to the package, in
`node_modules/@koobiq/components/agent-docs/`.

## Before you start

1. Read the installed version from `node_modules/@koobiq/components/package.json`. If its major version differs from
   {{VERSION}}, trust `node_modules/@koobiq/components/agent-docs/` over this file and tell the user to refresh the skill
   with `ng generate @koobiq/components:agent-skills`.
2. If `node_modules` is missing (dependencies not installed, or Yarn Plug'n'Play), read the same files from
   `https://unpkg.com/@koobiq/components@<installed version>/agent-docs/`.

## Where the facts are

| What                                                                          | Where                                                           |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------- |
| A component: overview, the full code of its examples, inputs, outputs, tokens | `node_modules/@koobiq/components/agent-docs/components/<id>.md` |
| Installation, theming, typography, localization, schematics, upgrade guides   | `node_modules/@koobiq/components/agent-docs/guides/<id>.md`     |
| Formatters, forms and validation helpers                                      | `node_modules/@koobiq/components/agent-docs/other/<id>.md`      |
| What `ng update` migrates in each version                                     | `node_modules/@koobiq/components/agent-docs/migrations.md`      |
| Exact typings of an entry point                                               | `node_modules/@koobiq/components/<entry>/index.d.ts`            |

The `<id>` values are in the tables at the end of this file. The same pages for people are at
`https://koobiq.io/en/components/<id>/overview` (Russian: `https://koobiq.io/ru/components/<id>/overview`).

## Rules

1. Use Koobiq components before writing custom UI. Find the component in the tables below; when two look alike, read
   [references/selection.md](references/selection.md).
2. Import from secondary entry points only: `@koobiq/components/<entry>`, for example `KbqButtonModule` from
   `@koobiq/components/button`. The root `@koobiq/components` exports nothing. Shared utilities, providers and injection
   tokens come from `@koobiq/components/core`.
3. Start from the closest example in the component's reference instead of guessing inputs; every input and output of the
   component is listed there. Do not use anything marked **(deprecated)** in new code.
4. Style with design tokens: the global `--kbq-*` custom properties for colors, spacing, radii, shadows and typography.
   Never hard-code colors, pixel sizes or font sizes. To change one component, redefine its `--kbq-<name>-*` tokens
   instead of its CSS properties, in a selector of at least two classes that targets the component element itself, such
   as `.my-toolbar .kbq-button`: the component declares its tokens on its own `.kbq-<name>` class, so a value set on a
   wrapper alone never reaches it. See [references/theming.md](references/theming.md).
5. Put text controls inside `<kbq-form-field>`; hints, errors and validation are in
   [references/forms.md](references/forms.md).
6. Icons come from `@koobiq/icons` through the `kbq-icon` attribute; see [references/icons.md](references/icons.md).
   Give every icon-only button an accessible label.
7. Locale texts and server-side rendering: see [references/localization-ssr.md](references/localization-ssr.md). Do not
   touch `window` or `document` directly in code that can run on the server.
8. Upgrade with `ng update @koobiq/components`: it applies the migrations listed in `migrations.md`. Do not rewrite a
   deprecated API by hand when a migration covers it.
9. Build the project after the change (`ng build` or the project's own build script) and fix every error before you
   report the task as done.

A minimal standalone component that follows the rules:

```ts
import { Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

@Component({
    selector: 'app-sign-in',
    imports: [KbqFormFieldModule, KbqInputModule, KbqButtonModule],
    template: `
        <kbq-form-field>
            <kbq-label>Login</kbq-label>
            <input kbqInput />
        </kbq-form-field>
        <button kbq-button color="theme">Sign in</button>
    `
})
export class SignInComponent {}
```

## Workflow

1. List the UI parts the task needs and map each one to a component id from the tables below.
2. Read `node_modules/@koobiq/components/agent-docs/components/<id>.md` for every component you use and start from its
   closest example.
3. Implement with imports from the matching entry points, design tokens for styling and `kbq-form-field` around text
   controls.
4. Build and fix.
5. Report gaps. When no Koobiq component fits, or you had to override `.kbq-*` classes or hard-code a value, say so in
   your answer: what was missing, what you did instead and why. Never hide such a workaround. The design system team
   collects these reports as issues at https://github.com/koobiq/angular-components/issues.

## Components

{{COMPONENTS}}

## Formatters, forms and validation

{{OTHER}}

## Guides

{{GUIDES}}
