# empty-state-error-color

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `21.0.0-0`). Reports the members the empty-state review removed or turned into
signals, and the four theme custom properties it renamed. It never writes to the tree.

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
| `KbqEmptyState.size`                 | `@Input()`, writable     | `input()`, read as `size()`           |
| `--kbq-empty-state-title`            | theme token              | `--kbq-empty-state-title-color`       |
| `--kbq-empty-state-color`            | theme token (text color) | `--kbq-empty-state-text-color`        |
| `--kbq-empty-state-error-title`      | theme token              | `--kbq-empty-state-error-title-color` |
| `--kbq-empty-state-error-color`      | theme token (text color) | `--kbq-empty-state-error-text-color`  |

The old names are removed, not deprecated. Nothing chains to them, so an override of one is ignored
and a `var()` read of one resolves to nothing — in both cases without an error.

## `size` and the file-upload subclass

`size` was the last decorator left on the component. It stayed one because
`KbqFileUploadEmptyState` — a public class in `@koobiq/components/file-upload` — extends
`KbqEmptyState` and assigned `this.size = 'big'` straight after `super()`, which an `input()` cannot
take.

That subclass redeclares the input with its own default instead:

```ts
override readonly size = input<KbqDefaultSizes>('big');
```

So `<kbq-file-upload-empty-state>` still renders at `big` without a binding, and a `[size]` binding
still overrides it. Nothing changes for anyone rendering that component.

## What it does _not_ do

Nothing is rewritten. A call to a removed method has no replacement expression, renaming a token
override is a theming decision, and `size` is far too common a property name to rewrite blind —
`file.size`, `blob.size` and `map.size` all appear in files that also render an empty state.

The `size` report is therefore matched on the receiver, not the member: only a read like
`emptyState.size` or `myEmptyState?.size` is flagged. A read through a variable named something else
is not reported at all, and the summary says so rather than letting you assume it was covered.

| Pattern                                           | Manual migration                                         |
| ------------------------------------------------- | -------------------------------------------------------- |
| `.setErrorColor()`                                | Bind `[errorColor]` on `<kbq-empty-state>` and delete it |
| `--kbq-empty-state-title` / `-color` / `-error-*` | Rename to the `-color`-suffixed names                    |
| `emptyState.size`                                 | `emptyState.size()`                                      |
| `emptyState.size = 'big'`                         | Bind `[size]="'big'"` — an `input()` has no setter       |

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
