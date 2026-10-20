# tabs-signals-and-aria

Migration schematic invoked automatically by `ng update @koobiq/components@21` (registered for `21.0.0-0`).
Reports the subclasses of the tabs classes and the direct calls of their `ngOnChanges`, the members the tabs review
removed or changed, and states the ARIA and theming changes that have no call site to point at. It never writes to the
tree.

## Signal inputs and queries

The decorator inputs of `KbqTabGroup`, `KbqTab`, `KbqTabHeader`, `KbqTabNavBar`, `KbqTabLink`, `KbqTabLabelWrapper`
and `KbqTabBody` are signal inputs named `<member>Input`, handed to the unchanged member from `ngOnChanges`. Their
decorator queries are signal queries behind getters: `KbqTabGroup.tabs` and the `items` of the header and the nav bar
stay `QueryList`s. Reading and writing the members works as before — `tab.disabled`, `tabLink.active` and the selection
of a group stay plain properties.

| Use                                         | What to do                                                            |
| ------------------------------------------- | --------------------------------------------------------------------- |
| A subclass with its own `ngOnChanges`       | Mark it `override` and call `super.ngOnChanges(changes)`              |
| A subclass that redeclared an `@Input()`    | Override the `<member>Input` signal input, e.g. `headerPositionInput` |
| A subclass that redeclared a query          | Override the getter (`tabs`, `items`, `labelContent`, …)              |
| `ngOnChanges` called with a `SimpleChanges` | Key it by `<member>Input` (`disabledInput`), or bind the input        |

A boolean input accepts `boolean | string | null | undefined` in a template now, rather than anything.

## Review

The review closed the members that were wired to nothing and gave `KbqTabGroup` the ARIA tabs pattern that
`KbqTabNavBar`, in the same package, already had.

| Member                          | Before                  | After                                   |
| ------------------------------- | ----------------------- | --------------------------------------- |
| `KbqTabGroup.resizeStream`      | public `Subject`        | removed                                 |
| `(window:resize)` on the group  | host listener           | removed                                 |
| `KbqTabGroup.disabled`          | published input         | removed                                 |
| `KbqTabGroup.getTabIndex()`     | `(tab, index)`          | `(tab, tabHeader, index)`, never `null` |
| `KbqVerticalTabsCssStyler`      | applies a host class    | deprecated no-op                        |
| `KbqTabLabelWrapper` host       | `[attr.disabled]`       | `[attr.aria-disabled]`                  |
| `KbqTabLink` host               | `[attr.disabled]`       | `[attr.aria-disabled]` only             |
| `KbqTabBody.afterLeavingCenter` | `EventEmitter<boolean>` | `EventEmitter<void>`                    |

The header is observed with the CDK `SharedResizeObserver` now, which also catches container resizes that no window
event reports, so a manual `resizeStream.next(event)` has no counterpart. `KbqTabGroup.disabled` was published,
documented and appeared in the API table, and no template bound it and no style targeted it: disable the individual
tabs instead.

| Pattern                    | Manual migration                                                |
| -------------------------- | --------------------------------------------------------------- |
| `.resizeStream`            | Nothing to call; the header observes itself                     |
| `<kbq-tab-group disabled>` | Disable the tabs: `<kbq-tab [disabled]="true">`                 |
| `.getTabIndex(tab, index)` | Pass the header: `getTabIndex(tab, tabHeader, index)`           |
| `KbqVerticalTabsCssStyler` | Stop importing it; the class follows the `vertical` binding now |
| `.kbq-tab-label[disabled]` | Target `.kbq-disabled`, or `[aria-disabled="true"]` in a test   |

## What it cannot reach

`KbqTabGroup.disabled` is matched only where the type name and the property access sit on one line —
`<kbq-tab-group disabled>`, or a single-statement access. The two-step form, where the reference is typed once and read
later,

```ts
@ViewChild(KbqTabGroup) group: KbqTabGroup;
// ...
if (this.group.disabled) { … }
```

is **not** reported: widening it to the whole file would fire on every `.disabled` of a tab in any file that mentions a
tab group. The removed input did nothing, so a missed call site is dead code rather than a behaviour change.

A stylesheet matching `a[disabled]` inside a nav bar has to move to `.kbq-disabled`; stylesheets are not visited.

## Notes with no call site to point at

- `KbqTabGroup` renders the ARIA tabs pattern: the label strip is a `role="tablist"` (carrying
  `aria-orientation="vertical"` when `vertical` is set), each label a `role="tab"` with `aria-selected` and
  `aria-controls`, and each body a `role="tabpanel"` with `aria-labelledby` and a tab stop while it is the active one.
  Hand-rolled `role` or `aria-*` attributes on those elements are duplicates now.
- The roving `tabindex` follows the header's focus position rather than the selection, and a disabled tab gets `-1`
  rather than no attribute at all. A group whose selected tab was disabled had no element with `tabindex="0"`.
- `KbqTabNavBar` emits `aria-orientation="vertical"` when it is both vertical and a real tablist — that is, when
  `[tabNavPanel]` is supplied. Without `[tabNavPanel]` the nav bar stays plain navigation.
- `[vertical]` works as a binding, and `disablePagination` is derived rather than latched, so a header that stops being
  vertical gets its paginator arrows back.
- `KbqTabHeader` is `OnPush` like every other component in the package.
- `KbqPaginatedTabHeader` is exported from the entry point, and the duplicate `ScrollDirection` in
  `tab-header.component` was deleted in favour of the base one.
- The four `on-surface` theme branches read the `--kbq-tabs-tab-item-*-on-surface-*` tokens instead of the
  `on-background` family.

## Running it manually

```bash
ng g @koobiq/components:tabs-signals-and-aria --project "<your project>"
```
