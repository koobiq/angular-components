# tabs-signals-and-aria

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `21.0.0-0`). Reports the `tabs` members that were removed or became signal-backed in
the tabs review, and states the ARIA and theming changes that have no call site to point at. It never
writes to the tree.

## Background

The review closed the members that were wired to nothing and gave `KbqTabGroup` the ARIA tabs pattern
that `KbqTabNavBar`, in the same package, already had.

| Member                         | Before               | After                                   |
| ------------------------------ | -------------------- | --------------------------------------- |
| `KbqTabGroup.resizeStream`     | public `Subject`     | removed                                 |
| `(window:resize)` on the group | host listener        | removed                                 |
| `KbqTabGroup.disabled`         | published input      | removed                                 |
| `KbqTab.disabled`              | accessor input       | signal input                            |
| `KbqTabGroup.getTabIndex()`    | `(tab, index)`       | `(tab, tabHeader, index)`, never `null` |
| `KbqVerticalTabsCssStyler`     | applies a host class | deprecated no-op                        |
| `KbqTabLabelWrapper` host      | `[attr.disabled]`    | `[attr.aria-disabled]`                  |

`resizeStream` deserves a note. Nothing was ever subscribed to it: `subscribeToResize()` read the
`vertical` signal input in the constructor, before Angular writes inputs, so it returned early on
every instantiation and the `(window:resize)` listener pushed into a `Subject` with no subscribers.
The header is observed with the CDK `SharedResizeObserver` now, which also catches container resizes
that no window event reports, so a manual `resizeStream.next(event)` has no counterpart.

`KbqTabGroup.disabled` is the same shape of defect from the other side: it was published, documented
and appeared in the API table, and no template bound it and no style targeted it. Disable the
individual tabs instead.

## What it does _not_ do

Nothing is rewritten. A read of a signal member becomes a call, a removed member has no replacement
expression, and an attribute selector has to be rewritten by hand.

| Pattern                    | Manual migration                                                |
| -------------------------- | --------------------------------------------------------------- |
| `.resizeStream`            | Nothing to call; the header observes itself                     |
| `<kbq-tab-group disabled>` | Disable the tabs: `<kbq-tab [disabled]="true">`                 |
| `.disabled = …` on a tab   | Bind `[disabled]` — a signal input takes no assignment          |
| `.disabled` on a tab       | Read it as a call, `tab.disabled()`                             |
| `.getTabIndex(tab, index)` | Pass the header: `getTabIndex(tab, tabHeader, index)`           |
| `KbqVerticalTabsCssStyler` | Stop importing it; the class follows the `vertical` binding now |
| `.kbq-tab-label[disabled]` | Target `.kbq-disabled`, or `[aria-disabled="true"]` in a test   |

## Notes with no call site to point at

- `KbqTabGroup` renders the ARIA tabs pattern: the label strip is a `role="tablist"` (carrying
  `aria-orientation="vertical"` when `vertical` is set), each label a `role="tab"` with
  `aria-selected` and `aria-controls`, and each body a `role="tabpanel"` with `aria-labelledby` and a
  tab stop while it is the active one. Hand-rolled `role` or `aria-*` attributes on those elements
  are duplicates now.
- The roving `tabindex` follows the header's focus position rather than the selection, and a disabled
  tab gets `-1` rather than no attribute at all. A group whose selected tab was disabled used to have
  no element with `tabindex="0"` and was unreachable with <kbd>Tab</kbd>.
- `KbqTabNavBar` emits `aria-orientation="vertical"` when it is both vertical and a real tablist —
  that is, when `[tabNavPanel]` is supplied. Without `[tabNavPanel]` the nav bar stays plain
  navigation and emits no tab semantics at all.
- `[vertical]` works as a binding. The layout class came from a selector-matched directive with a
  static host class, and Angular matches attribute selectors against property-binding names, so
  `[vertical]="false"` used to leave the class applied permanently. `disablePagination` is derived
  rather than latched, so a header that stops being vertical gets its paginator arrows back.
- `KbqTabHeader` is `OnPush` like every other component in the package.
- `KbqPaginatedTabHeader` is exported from the entry point, and the duplicate `ScrollDirection` in
  `tab-header.component` was deleted in favour of the base one. Both still resolve through
  `@koobiq/components/tabs`.
- The four `on-surface` theme branches read the `--kbq-tabs-tab-item-*-on-surface-*` tokens they
  always declared instead of the `on-background` family. A value overridden only on the
  `on-background` tokens no longer reaches a group or nav bar with `[onSurface]`.

## Running it manually

```
ng generate @koobiq/components:tabs-signals-and-aria --project my-app
```
