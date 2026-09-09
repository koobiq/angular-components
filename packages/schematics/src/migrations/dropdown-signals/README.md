# dropdown-signals

Migration schematic invoked automatically by `ng update @koobiq/components@21` (registered for
`21.0.0-0`). Migrates `KbqDropdown`, `KbqDropdownTrigger` and `KbqDropdownItem` consumers to the
signal-based API the component review landed.

## Background

The dropdown was the only component in the v21 review campaign whose decorators were left in place —
its siblings (`badge`, `autocomplete`, `markdown`, `progress-spinner`) each shipped a `*-signals`
migration, and the dropdown shipped none. Two notes in the source deferred the work explicitly:

```ts
// The inputs below stay decorators on purpose: in-repo consumers assign to them imperatively […]
// Migrating them is a breaking change owned by the next major.
```

v21 is that next major. Twenty of the twenty-one members are signals now.

## What it rewrites

A read becomes a call, scoped to the type that declares the member:

| Type                 | Members                                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `KbqDropdown`        | `xPosition`, `yPosition`, `overlapTriggerX`, `overlapTriggerY`, `hasBackdrop`, `backdropClass`, `templateRef`, `items`, `lazyContent` |
| `KbqDropdownTrigger` | `offsetX`, `offsetY`, `data`, `openByArrowDown`, `restoreFocus`, `dropdown`                                                           |
| `KbqDropdownItem`    | `disabled`, `icon`                                                                                                                    |

Six of them are `model()`s, so a write has a mechanical translation:

| Before                            | After                                |
| --------------------------------- | ------------------------------------ |
| `panel.xPosition = 'before'`      | `panel.xPosition.set('before')`      |
| `panel.overlapTriggerX = false`   | `panel.overlapTriggerX.set(false)`   |
| `trigger.offsetX = -8`            | `trigger.offsetX.set(-8)`            |
| `trigger.openByArrowDown = false` | `trigger.openByArrowDown.set(false)` |

They are `model()`s rather than `input()`s because in-repo hosts position the panel they were handed:
`kbq-split-button` writes `xPosition`, and `kbq-navbar-item` writes both overlap flags, `offsetX` and
`openByArrowDown`. A write to a read-only input (`hasBackdrop`, `restoreFocus`, `data`, …) is left
untouched and becomes a compile error the consumer fixes by hand.

Receivers are found by explicit type annotation and by the `inject()` / `viewChild()` /
`contentChild()` initializer forms, and through template reference variables — a bare `#ref` on
`<kbq-dropdown>` or `<kbq-dropdown-item>`, and `#ref="kbqDropdownTrigger"` on a trigger host. Reads
already migrated are left alone, so the schematic is idempotent.

**Input aliases did not change.** `[xPosition]`, `[panelWidth]`, `class`, `[kbqDropdownTriggerFor]`
and the rest bind exactly as before; only programmatic access moved.

## What it reports rather than fixes

- **`items` is a `Signal<readonly KbqDropdownItem[]>`, not a `QueryList`.** `items().length` and the
  array methods on `items()` work; `changes`, `first`, `last` and `toArray()` do not. Use
  `toObservable(panel.items)` for the stream, and the new `adoptItems()` in place of `items.reset(…)`.
- **`closed` is an `output()`.** It has `emit()` and `subscribe(fn)`, but no `pipe()`,
  `asObservable()` or `complete()`. Wrap it in `outputToObservable(panel.closed)`.
- **`classList` is `protected`.** It is one `computed` over the position classes, the safe-area class
  and the `class` input. Set `class` on `<kbq-dropdown>` to add your own.
- **`KbqDropdownPanel` changed shape throughout.** A custom panel has to be updated by hand.
- **Signal queries hold the instance behind a call of their own**, so a read through
  `viewChild(KbqDropdown)` is `this.panel().items()`. Those are resolved where the query is assigned
  to a field; other shapes are reported.

## Changes with no call site to match on

- `model()` takes no `transform`, so the six writable members no longer coerce a string attribute:
  use `[overlapTriggerX]="true"`, not `overlapTriggerX="true"`.
- `KbqDropdownItem.disabled` is a signal, and `ListKeyManagerOption.disabled` accepts one. A custom
  option that reads `item.disabled` as a plain property is broken by this — a signal is a function,
  so every item reads as disabled, and both the arrow skip and the typeahead match silently stop
  working. Read it through `kbqIsOptionDisabled` from `@koobiq/components/core`.
- `KbqDropdownItem.textElement` is unchanged. It implements `KbqTitleTextRef`, which `KbqTitle` and
  five other components read as a plain property.

## Options

| Option    | Default | Description                                                          |
| --------- | ------- | -------------------------------------------------------------------- |
| `project` | —       | Project to migrate. Omitted, the migration runs over the whole tree. |
| `fix`     | `true`  | When false, prints what would change without writing.                |
