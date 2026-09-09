# empty-state-error-color

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `21.0.0-0`). Reports the one member the empty-state review removed and the four theme
custom properties it renamed. It never writes to the tree.

## Background

`errorColor` used to reach the illustration imperatively. `KbqEmptyState.ngAfterContentInit()` read
the input once and called `KbqEmptyStateIcon.setErrorColor()`, which assigned `color = 'error'` on the
injected `kbq-icon-item`. Three things followed from that one call:

- it never came back — flipping `[errorColor]` to `false` left a red icon above black text;
- it never arrived late — flipping to `true` after init did nothing;
- it only happened for one of the two supported markup shapes, because the directive resolved the
  icon through `inject(KbqIconItem)`, which sees an icon on its own host element and not one wrapped
  by it.

The tint is driven by the input now, in both shapes, so `setErrorColor()` has no caller and is gone.

| Member                               | Before                   | After                                 |
| ------------------------------------ | ------------------------ | ------------------------------------- |
| `KbqEmptyStateIcon.setErrorColor()`  | public, called at init   | removed                               |
| `KbqEmptyState.icon`                 | public `@ContentChild`   | `protected` `contentChild()`          |
| `KbqEmptyState.ngAfterContentInit()` | public lifecycle hook    | removed                               |
| `--kbq-empty-state-title`            | theme token              | `--kbq-empty-state-title-color`       |
| `--kbq-empty-state-color`            | theme token (text color) | `--kbq-empty-state-text-color`        |
| `--kbq-empty-state-error-title`      | theme token              | `--kbq-empty-state-error-title-color` |
| `--kbq-empty-state-error-color`      | theme token (text color) | `--kbq-empty-state-error-text-color`  |

Each new name is chained from the old one it replaces, so an override — or a direct read — of either
name still applies. The old names are deprecated and the chain will be dropped.

## What it does _not_ do

Nothing is rewritten. A call to a removed method has no replacement expression, and renaming a token
override is a theming decision.

| Pattern                                           | Manual migration                                         |
| ------------------------------------------------- | -------------------------------------------------------- |
| `.setErrorColor()`                                | Bind `[errorColor]` on `<kbq-empty-state>` and delete it |
| `--kbq-empty-state-title` / `-color` / `-error-*` | Rename to the `-color`-suffixed names                    |

## Notes with no call site to point at

- The title is rendered with heading typography — `subheading` at `size="normal"`, `headline` at
  `size="big"` — but every usage in the library wrote it as a `div`. Write a real heading of the level
  the page calls for, `<h2 kbq-empty-state-title>`; the component zeroes the user-agent margin, so
  nothing moves.
- An empty state inserted into a page that has already been read needs `role="status"` on
  `<kbq-empty-state>`, or `role="alert"` for the error variant. The component adds no `role` of its own.
- `empty-state.scss` loads its own token layer instead of relying on a second `styleUrls` entry, so
  anything reusing the stylesheet across a package boundary now gets the custom properties together
  with the rules that read them.

## Running it manually

```
ng generate @koobiq/components:empty-state-error-color --project my-app
```
