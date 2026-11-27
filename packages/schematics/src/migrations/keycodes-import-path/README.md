# keycodes-import-path

Migration schematic invoked automatically by `ng update @koobiq/components@21.2`
(registered for `21.2.0-0`). Moves the keycode constants (`ENTER`, `SPACE`, `TAB`, the arrows, the
numpad and function keys, and the rest) off `@koobiq/components/core` onto `@angular/cdk/keycodes`.

## Background

`@koobiq/components/core` no longer uses its own copy of the keycode constants — from 21.2.0 the
library imports them from `@angular/cdk/keycodes` everywhere. The constants still exported from
`core` are deprecated and will be removed in 22.0.0.

Nothing breaks in 21.2.0: the values are identical, and an unmigrated import keeps compiling. The
deprecation only surfaces as a strikethrough in the editor.

## What it does

The schematic walks every `.ts` file under the project root — the whole workspace when `--project`
is omitted, which is how `ng update` invokes it — skipping `node_modules` and `dist`. For every
`import` / `export ... from` statement from the exact specifier `@koobiq/components/core` it moves
the keycode bindings to a statement from `@angular/cdk/keycodes`:

| Before                                                              | After                                                                                                           |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `import { ENTER } from '@koobiq/components/core';`                  | `import { ENTER } from '@angular/cdk/keycodes';`                                                                |
| `import { ENTER, KbqButtonModule } from '@koobiq/components/core';` | `import { KbqButtonModule } from '@koobiq/components/core';` + `import { ENTER } from '@angular/cdk/keycodes';` |
| `import { ENTER as RETURN } from '@koobiq/components/core';`        | `import { ENTER as RETURN } from '@angular/cdk/keycodes';` — an alias moves with its binding                    |
| multiline binding lists                                             | matched whole and split the same way                                                                            |
| `import { KbqButtonModule } from '@koobiq/components/core';`        | untouched — no keycode binding in the list                                                                      |
| `import { Whatever } from '@koobiq/components/core-x';`             | untouched — the closing quote anchors the specifier, a longer one is not a prefix match                         |
| `import { ENTERED_TEXT } from '@koobiq/components/core';`           | untouched — a binding matches only as a whole identifier, not as a substring                                    |

The quote style of each rewritten statement is preserved. Running the migration twice changes
nothing the second time.

## What it does _not_ do (manual)

| Pattern                          | Manual migration                                                                                            |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `hasModifierKey`                 | stays importable from `core` on purpose — its `KeyboardEvent \| MouseEvent` signature has no CDK equivalent |
| The 12 koobiq-only key helpers   | `isVerticalMovement`, `isSelectAll`, `isCopy` and the rest have no CDK equivalent and stay in `core`        |
| A specifier outside a `.ts` file | only `.ts` files are visited — the same string in a JSON config or a documentation snippet stays as written |

`fix` defaults to `true`. `ng update` invokes migrations with no options at all, and
`migrations.json` declares no schema, so the rule applies that default itself. With `--fix false`
every file that would change is logged instead of written, followed by the same count either way.

[Params](schema.ts)

Usage for Angular Cli:

```shell
ng g @koobiq/components:keycodes-import-path --project "<your project>"
```

Usage for Nx:

```shell
nx g @koobiq/components:keycodes-import-path --project "<your project>"
```

### Run locally

Build package

```shell
yarn run build:schematics
```

Run command (for example, for `koobiq-docs` project)

```shell
ng g ./dist/components/schematics/collection.json:keycodes-import-path --project koobiq-docs
```

### Result

#### Before

```ts
import { Component } from '@angular/core';
import { ENTER, KbqButtonModule, SPACE } from '@koobiq/components/core';

@Component({
    selector: 'my-page',
    imports: [KbqButtonModule],
    host: { '(keydown)': 'onKeydown($event)' }
})
export class MyPage {
    onKeydown(event: KeyboardEvent) {
        if (event.keyCode === ENTER || event.keyCode === SPACE) {
            // ...
        }
    }
}
```

#### After

```ts
import { Component } from '@angular/core';
import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { KbqButtonModule } from '@koobiq/components/core';

@Component({
    selector: 'my-page',
    imports: [KbqButtonModule],
    host: { '(keydown)': 'onKeydown($event)' }
})
export class MyPage {
    onKeydown(event: KeyboardEvent) {
        if (event.keyCode === ENTER || event.keyCode === SPACE) {
            // ...
        }
    }
}
```
