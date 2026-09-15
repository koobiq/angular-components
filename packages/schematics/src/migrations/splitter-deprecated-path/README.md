# splitter-deprecated-path

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `20.3.0-0`). Rewrites `@koobiq/components/splitter` imports to
`@koobiq/components/splitter/deprecated`.

## Background

`@koobiq/components/splitter` now resolves to a rewritten splitter that lays its panels out with
CSS grid and adds per-panel size constraints, collapsing and hiding, snap points, full keyboard
support and the WAI-ARIA `separator` pattern. The previous implementation — `KbqSplitterComponent`
with `KbqSplitterAreaDirective`, `KbqGutterDirective`, `KbqGutterGhostDirective`,
`KbqSplitterModule` and the `Direction` enum — moved to `@koobiq/components/splitter/deprecated`
and will be removed in a future major version.

Nothing about that implementation changed: `direction`, `disabled`, `useGhost`, `hideGutters`,
`gutterSize`, `gutterPositionChange`, the `[kbq-splitter-area]` attribute selector and the
`min-width` / `min-height` driven constraints all behave exactly as before at the new path.
Rewriting the import is the whole migration — adopting the new splitter is a separate, manual step.

## Behaviour change

Most unmigrated imports break loudly: `KbqSplitterComponent`, `KbqSplitterAreaDirective`,
`KbqGutterDirective`, `KbqGutterGhostDirective` and `Direction` live at the `/deprecated` path
only, so the build stops with `TS2305: … has no exported member`.

`KbqSplitterModule` is the silent one — both entry points export a class under that name, and so
does the `kbq-splitter` element selector exist on both sides. An unmigrated
`import { KbqSplitterModule } from '@koobiq/components/splitter'` therefore keeps compiling, but
now pulls in the rewritten splitter, which projects `kbq-splitter-panel` children instead of
`[kbq-splitter-area]` hosts and takes `orientation` rather than `direction`. Such a group renders
its content with no panels and no separators. This is the case the migration exists for.

Templates need no changes of their own: once the import points at `/deprecated`, `<kbq-splitter>`
with `[kbq-splitter-area]` hosts, `direction`, `useGhost`, `hideGutters` and `gutterSize` keeps
working exactly as before.

## What it does

The schematic walks every `.ts` file under the project root — the whole workspace when `--project`
is omitted, which is how `ng update` invokes it — skipping `node_modules` and `dist`, and rewrites
the module specifier `@koobiq/components/splitter` to `@koobiq/components/splitter/deprecated`.

The match is quote-anchored (`(['"])@koobiq/components/splitter\1`), so only the exact, bare
specifier is taken, in the quote style it was written in:

| Specifier                                        | Result                                                                                 |
| ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `'@koobiq/components/splitter'`                  | rewritten, still single-quoted                                                         |
| `"@koobiq/components/splitter"`                  | rewritten, still double-quoted                                                         |
| `'@koobiq/components/splitter/deprecated'`       | untouched — the migration is idempotent                                                |
| `'@koobiq/components/splitter-x'` (hypothetical) | untouched — the closing quote is required, so a longer specifier is not a prefix match |

It is a textual replacement rather than an AST rewrite, so an `import`, an `export … from`, a
dynamic `import()` and a specifier handed to something like `jest.mock()` are all covered by the
same pass.

## What it does _not_ do (manual)

| Pattern                          | Manual migration                                                                                                                                                                         |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A specifier outside a `.ts` file | Only `.ts` files are visited — the same string in a JSON config or a documentation snippet stays as written                                                                              |
| Templates                        | `[kbq-splitter-area]` hosts, `direction`, `useGhost`, `hideGutters` and `gutterSize` bindings are left as written; they keep working against the deprecated component at its new path    |
| Moving off `/deprecated`         | Nothing is migrated _to_ the new splitter: areas become `kbq-splitter-panel`, `direction` becomes `orientation`, sizes move from `min-width` / CSS `flex` onto `size` / `minSize` inputs |

`fix` defaults to `true`. `ng update` invokes migrations with no options at all, and
`migrations.json` declares no schema, so the rule applies that default itself. With `--fix false`
every file that would change is logged instead of written, followed by the same count either way.

[Params](schema.ts)

Usage for Angular Cli:

```shell
ng g @koobiq/components:splitter-deprecated-path --project <your project>
```

Usage for Nx:

```shell
nx g @koobiq/components:splitter-deprecated-path --project <your project>
```

### Run locally

Build package

```shell
yarn run build:schematics
```

Run command (for example, for `koobiq-docs` project)

```shell
ng g ./dist/components/schematics/collection.json:splitter-deprecated-path --project koobiq-docs
```

### Result

#### Before

```ts
import { Component } from '@angular/core';
import { KbqSplitterModule } from '@koobiq/components/splitter';

@Component({
    selector: 'my-page',
    imports: [KbqSplitterModule],
    template: `
        <kbq-splitter [useGhost]="true">
            <div kbq-splitter-area>...</div>
            <div kbq-splitter-area>...</div>
        </kbq-splitter>
    `
})
export class MyPage {}
```

#### After

```ts
import { Component } from '@angular/core';
import { KbqSplitterModule } from '@koobiq/components/splitter/deprecated';

@Component({
    selector: 'my-page',
    imports: [KbqSplitterModule],
    template: `
        <kbq-splitter [useGhost]="true">
            <div kbq-splitter-area>...</div>
            <div kbq-splitter-area>...</div>
        </kbq-splitter>
    `
})
export class MyPage {}
```
