# scrollbar-deprecated-path

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `20.3.0-0`). Rewrites `@koobiq/components/scrollbar` imports to
`@koobiq/components/scrollbar/deprecated`.

## Background

`@koobiq/components/scrollbar` now resolves to a new, dependency-free scrollbar built on
`CdkScrollable`. The previous implementation — the `overlayscrollbars`-based `KbqScrollbar`
component together with `KbqScrollbarDirective` — moved to
`@koobiq/components/scrollbar/deprecated` and will be removed in a future major version.

Nothing about that implementation changed: `initializationTarget`, `options`, `events`, `defer`,
`scrollbarInstance`, the `onInitialize` / `onUpdate` / `onDestroy` / `onScroll` outputs and the
`kbq-scrollbar` element selector all behave exactly as before at the new path. Repointing the
import is the whole migration — adopting the new scrollbar is a separate, manual step.

## Behaviour change

The two entry points share only two exported names, so most unmigrated imports break loudly:
`KbqScrollbarModule`, `KbqScrollbarDirective`, `KBQ_SCROLLBAR_CONFIG`,
`KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG`, `KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG_PROVIDER`,
`KbqScrollbarEvents`, `KbqScrollbarEventListenerArgs` and `KbqScrollbarTarget` live at the
`/deprecated` path only, so the build stops with `TS2305: … has no exported member`.

`KbqScrollbar` and `KbqScrollbarOptions` are the silent pair — both names exist at both paths:

- `KbqScrollbar` keeps the `kbq-scrollbar` selector and `exportAs: 'kbqScrollbar'`, so a template
  that only renders `<kbq-scrollbar>` keeps compiling and keeps rendering — with the new
  component, which has a different set of inputs. The `[kbq-scrollbar]` attribute form of the
  selector is gone as well, so a host marked that way quietly matches nothing.
- `KbqScrollbarOptions` is now `{ mode: KbqScrollbarMode }` instead of the `overlayscrollbars`
  `PartialOptions`.

## What it does

The schematic walks every `.ts` file under the project root — the whole workspace when `--project`
is omitted, which is how `ng update` invokes it — skipping `node_modules` and `dist`, and rewrites
the module specifier `@koobiq/components/scrollbar` to `@koobiq/components/scrollbar/deprecated`.

The match is quote-anchored (`(['"])@koobiq/components/scrollbar\1`), so only the exact, bare
specifier is taken, in the quote style it was written in:

| Specifier                                   | Result                                      |
| ------------------------------------------- | ------------------------------------------- |
| `'@koobiq/components/scrollbar'`            | rewritten, still single-quoted              |
| `"@koobiq/components/scrollbar"`            | rewritten, still double-quoted              |
| `'@koobiq/components/scrollbar/deprecated'` | untouched — the migration is idempotent     |
| `'@koobiq/components/scrollbar-x'`          | untouched — a sibling package, not a prefix |

It is a textual replacement rather than an AST rewrite, so an `import`, an `export … from`, a
dynamic `import()` and a specifier handed to something like `jest.mock()` are all covered by the
same pass.

## What it does _not_ do (manual)

| Pattern                               | Manual migration                                                                                                                                                                                   |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A specifier outside a `.ts` file      | Only `.ts` files are visited — the same string in a JSON config or a documentation snippet stays as written                                                                                        |
| `overlayscrollbars` in `package.json` | The `/deprecated` entry point still imports it. Adding it as a dependency is the `mandatory-peer-dependencies` migration's job                                                                     |
| Moving off `/deprecated`              | Nothing is migrated _to_ the new scrollbar: `options` / `events` / `defer` are replaced by `kbqScrollbarMode`, and the `overlayscrollbars` instance by the `scrollTo*` methods and `scrollChanges` |

`fix` defaults to `true`. `ng update` invokes migrations with no options at all, and
`migrations.json` declares no schema, so the rule applies that default itself. With `--fix false`
every file that would change is logged instead of written, followed by the same count either way.

[Params](schema.ts)

Usage for Angular Cli:

```shell
ng g @koobiq/components:scrollbar-deprecated-path --project <your project>
```

Usage for Nx:

```shell
nx g @koobiq/components:scrollbar-deprecated-path --project <your project>
```

### Run locally

Build package

```shell
yarn run build:schematics
```

Run command (for example, for `koobiq-docs` project)

```shell
ng g ./dist/components/schematics/collection.json:scrollbar-deprecated-path --project koobiq-docs
```

### Result

#### Before

```ts
import { Component } from '@angular/core';
import { KbqScrollbarModule } from '@koobiq/components/scrollbar';

@Component({
    selector: 'my-page',
    imports: [KbqScrollbarModule],
    template: `
        <kbq-scrollbar [options]="{ scrollbars: { autoHide: 'never' } }">...</kbq-scrollbar>
    `
})
export class MyPage {}
```

#### After

```ts
import { Component } from '@angular/core';
import { KbqScrollbarModule } from '@koobiq/components/scrollbar/deprecated';

@Component({
    selector: 'my-page',
    imports: [KbqScrollbarModule],
    template: `
        <kbq-scrollbar [options]="{ scrollbars: { autoHide: 'never' } }">...</kbq-scrollbar>
    `
})
export class MyPage {}
```
