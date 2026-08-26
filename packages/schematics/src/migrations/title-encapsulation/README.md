# title-encapsulation

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `20.3.0-0`). Reports the members of `KbqTitleDirective` that stopped being public in
the title review. It never writes to the tree.

## Background

`kbq-title` measures its host and opens a tooltip when the text is truncated. The review kept that
surface — the `kbq-title` input and the tooltip it opens — and closed everything else, because the
rest was the measurement machinery:

| Member                                                                                                 | Before           | After                   |
| ------------------------------------------------------------------------------------------------------ | ---------------- | ----------------------- |
| `resizeStream`                                                                                         | `Subject<Event>` | removed                 |
| `hasOnlyText`                                                                                          | public getter    | `private`               |
| `ngOnDestroy`                                                                                          | declared         | removed, no `OnDestroy` |
| `child`, `parent`, `isHorizontalOverflown`, `isVerticalOverflown`, `handleElementEnter`, `hideTooltip` | public           | `protected`             |

`resizeStream` is the only one that changes how the directive works rather than only what it exposes. It was
fed by a `(window:resize)` host listener, so one directive instance meant one listener — a dropdown
with hundreds of options meant hundreds. The directive now injects the CDK `SharedResizeObserver`,
which adds no per-instance listener and, unlike `window:resize`, also reacts to container-only
resizes. A consumer that pushed into `resizeStream` to force a re-measure can drop the call.

## What it does _not_ do

Nothing is rewritten. Every member is either gone or hidden, so there is no expression to migrate a
call site to — what a consumer should do instead depends on why it reached in.

| Pattern                                                                         | Manual migration                                                  |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `.resizeStream`                                                                 | Drop the call; the shared `ResizeObserver` re-measures on its own |
| `.hasOnlyText`                                                                  | Read the rendered DOM directly if it is genuinely needed          |
| `.child` / `.parent` / `.is*Overflown` / `.handleElementEnter` / `.hideTooltip` | Use the `kbq-title` input; these are measurement internals        |
| `super.ngOnDestroy()` in a subclass                                             | Remove it — the base tears down through `takeUntilDestroyed`      |

## Notes with no call site to point at

- The tooltip now opens on keyboard focus, which the class JSDoc and the published guide already
  described. A host that compensated for its absence can drop the workaround.
- `titleContent` is typed `TemplateRef<unknown>` instead of `TemplateRef<any>`. A `TemplateRef<Ctx>`
  still assigns to it; a value read back out needs a cast.

## Running it manually

```
ng generate @koobiq/components:title-encapsulation --project my-app
```
