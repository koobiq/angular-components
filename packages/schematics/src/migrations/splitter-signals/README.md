# splitter-signals

Migration schematic invoked automatically by `ng update @koobiq/components@20` (registered for
`20.3.0-0`). Migrates `KbqSplitterComponent` and `KbqGutterDirective` consumers to the finished
signal-based API.

## Background

Every input on the splitter and its gutter was an accessor with coercion in the setter, which is why
the automated signal migration skipped all thirteen. They are signal inputs now, with
`booleanAttribute` and `numberAttribute` doing the coercion.

`KbqGutterGhostDirective` went the other way. Its `visible`, `x`, `y`, `direction` and `size` were
`@Input()` in name only: the splitter renders `<kbq-gutter-ghost>` with **no bindings** and drives
them imperatively during a drag, outside the Angular zone. They are plain properties now.

## What it rewrites

| Before                                                                            | After                   |
| --------------------------------------------------------------------------------- | ----------------------- |
| `splitter.hideGutters` / `.direction` / `.disabled` / `.useGhost` / `.gutterSize` | calls                   |
| `splitter.isDragging` / `.isVertical`                                             | calls                   |
| `gutter.direction` / `.order` / `.size` / `.isVertical` / `.dragged`              | calls                   |
| `gutter.dragged = …`                                                              | `gutter.dragged.set(…)` |

On receivers explicitly typed `KbqSplitterComponent` or `KbqGutterDirective`, and through template
reference variables on `<kbq-splitter>`. Already-migrated reads are left alone, so the schematic is
idempotent.

## What it does _not_ do

| Pattern                                                                               | Manual migration                                             |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `.resizing`                                                                           | Removed — it was dead and always `false`; use `isDragging()` |
| `.elementRef` / `.changeDetectorRef` / `.areas` / `.areaRefs` / `.gutters` / `.ghost` | Closed layout bookkeeping                                    |
| `KbqGutterGhostDirective` bindings                                                    | It never accepted them; there is nothing to bind             |
| `viewChild(KbqSplitterComponent)`                                                     | The query returns the instance, so a read is a double call   |

## Notes with no call site to point at

- **`hideGutters`, `disabled` and `useGhost` are `booleanAttribute` inputs.** A valueless attribute
  means `true` now; `coerceBooleanProperty` treated the empty string as `false`.
- **A `gutterSize` that is not a positive number falls back to the default 6** instead of keeping
  whatever the previous value happened to be. The old setter read its own getter, so an invalid
  value silently preserved the last valid one.
- **The gutter lays itself out reactively** instead of once in `ngOnInit`, so changing `direction`
  after init re-applies the layout — and clears the dimension the other direction owns, which used
  to stay behind as a stale `width` or `height`.
- **A splitter area unsubscribes from `gutterPositionChange` when it is destroyed.** An area removed
  from a long-lived splitter used to keep emitting `sizeChange` for every later drag.

## Running it manually

```
ng generate @koobiq/components:splitter-signals --project my-app
```

Pass `--fix=false` to see what it would change without writing.
