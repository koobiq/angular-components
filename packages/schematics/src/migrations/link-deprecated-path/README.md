# link-deprecated-path

Migration schematic invoked automatically by `ng update @koobiq/components@21` (registered for
`21.0.0-0`). Rewrites `@koobiq/components/link` imports to `@koobiq/components/link/deprecated`.

## Background

`@koobiq/components/link` now resolves to the `KbqLink` component with the `[kbqLink]` selector. It
renders the underlined text itself, between the `kbqLinkPrefix` and `kbqLinkSuffix` slots, adds the
external icon through the `external` input, takes its size from the `size` input and its underline
from the `underline` input, covers the gaps between the lines of a wrapped link by itself, makes a link on any element but an `<a>` a pseudo link with the `button` role
and Enter and Space, and stops the click on a disabled link. The previous directive - `KbqLink` and
`KbqLinkModule` with the `[kbq-link]` selector, whose markup needed the `kbq-link__text` wrapper and
the `kbq-link_external` and `kbq-text-with-dot` classes - moved to
`@koobiq/components/link/deprecated` and will be removed in a future major version.

Nothing about the directive changed: its inputs, the `[kbq-link]` selector, the `kbqLink` export
name and the classes its markup relies on behave exactly as before at the new path. Rewriting the
import is the whole migration - adopting the component is a separate, manual step.

## Behaviour change

An unmigrated import keeps compiling, and that is why the migration exists: both entry points
export `KbqLink` and `KbqLinkModule`. Without the rewrite the import brings in the component, whose
selector is `[kbqLink]`, so the `kbq-link` attribute in the templates matches nothing and the links
lose their styles.

## What it does

The schematic walks every `.ts` file under the project root - the whole workspace when `--project`
is omitted, which is how `ng update` invokes it - skipping `node_modules` and `dist`, and rewrites
the module specifier `@koobiq/components/link` to `@koobiq/components/link/deprecated`.

The match is quote-anchored (`(['"])@koobiq/components/link\1`), so only the exact, bare specifier
is taken, in the quote style it was written in:

| Specifier                                    | Result                                                                                 |
| -------------------------------------------- | -------------------------------------------------------------------------------------- |
| `'@koobiq/components/link'`                  | rewritten, still single-quoted                                                         |
| `"@koobiq/components/link"`                  | rewritten, still double-quoted                                                         |
| `'@koobiq/components/link/deprecated'`       | untouched - the migration is idempotent                                                |
| `'@koobiq/components/link-x'` (hypothetical) | untouched - the closing quote is required, so a longer specifier is not a prefix match |

It is a textual replacement rather than an AST rewrite, so an `import`, an `export … from`, a
dynamic `import()` and a specifier handed to something like `jest.mock()` are all covered by the
same pass.

## What it does _not_ do (manual)

| Pattern                          | Manual migration                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A specifier outside a `.ts` file | Only `.ts` files are visited - the same string in a JSON config or a documentation snippet stays as written                                                                                                                                                                                                                                                                                                                                                 |
| Templates                        | Left as written; they keep working against the directive at its new path                                                                                                                                                                                                                                                                                                                                                                                    |
| Moving off `/deprecated`         | Nothing is migrated _to_ the component: rename `kbq-link` to `kbqLink`, `big` / `compact` to `size` and `noUnderline` to `underline="none"`, drop `multiline`, drop `pseudo` from a host that is not an `<a>` and the `kbq-link__text` wrapper, mark a leading icon with `kbqLinkPrefix` and a trailing one with `kbqLinkSuffix`, replace `kbq-link_external` and its north-east icon with `external`, and the `kbq-text-with-dot` dot with `kbqLinkSuffix` |

`fix` defaults to `true`. `ng update` invokes migrations with no options at all, and
`migrations.json` declares no schema, so the rule applies that default itself. With `--fix false`
every file that would change is logged instead of written, followed by the same count either way.

[Params](schema.ts)

Usage for Angular Cli:

```shell
ng g @koobiq/components:link-deprecated-path --project "<your project>"
```

Usage for Nx:

```shell
nx g @koobiq/components:link-deprecated-path --project "<your project>"
```

### Run locally

Build package

```shell
yarn run build:schematics
```

Run command (for example, for `koobiq-docs` project)

```shell
ng g ./dist/components/schematics/collection.json:link-deprecated-path --project koobiq-docs
```

### Result

#### Before

```ts
import { Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';

@Component({
    selector: 'my-page',
    imports: [KbqLinkModule, KbqIconModule],
    template: `
        <a class="kbq-link_external" href="https://koobiq.io" target="_blank" kbq-link>
            <span class="kbq-link__text">Koobiq</span>
            <i kbq-icon="kbq-north-east_16"></i>
        </a>
    `
})
export class MyPage {}
```

#### After

```ts
import { Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link/deprecated';

@Component({
    selector: 'my-page',
    imports: [KbqLinkModule, KbqIconModule],
    template: `
        <a class="kbq-link_external" href="https://koobiq.io" target="_blank" kbq-link>
            <span class="kbq-link__text">Koobiq</span>
            <i kbq-icon="kbq-north-east_16"></i>
        </a>
    `
})
export class MyPage {}
```

#### With the component

```ts
import { Component } from '@angular/core';
import { KbqLinkModule } from '@koobiq/components/link';

@Component({
    selector: 'my-page',
    imports: [KbqLinkModule],
    template: `
        <a href="https://koobiq.io" target="_blank" kbqLink external>Koobiq</a>
    `
})
export class MyPage {}
```
