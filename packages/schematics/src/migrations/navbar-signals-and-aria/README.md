# navbar-signals-and-aria

Migration schematic invoked automatically by `ng update @koobiq/components`.
Migrates consumers of `@koobiq/components/navbar` to its signal-based API and reports the accessibility,
composition and layering changes of the navbar review.

## Why

The review finished the signal migration of the navbar, replaced the inheritance from `KbqTooltipTrigger` on
`KbqNavbarItem` / `KbqNavbarBrand` with composition, collapsed the two mutually derived orientation booleans of
`KbqNavbarRectangleElement` into one `orientation`, and moved the disabled state and the accessible names onto
standard ARIA attributes.

Template _bindings_ keep working — `[expanded]`, `[collapsable]`, `[collapsedText]`, `[kbqTooltip]`,
`[kbqPlacement]`, `[kbqTrigger]` are unchanged — so what breaks is programmatic access and reads through a
template reference variable.

| Member                                               | Before                 | After                                             | Auto-fix                         |
| ---------------------------------------------------- | ---------------------- | ------------------------------------------------- | -------------------------------- |
| `KbqVerticalNavbar.expanded`                         | `@Input()` accessor    | `ModelSignal<boolean>`                            | ✅ read → call, write → `.set()` |
| `KbqVerticalNavbar.configuration`                    | untyped field          | `WritableSignal<KbqVerticalNavbarConfiguration>`  | ✅ read → call                   |
| `KbqVerticalNavbar.openOver`                         | `input()`              | unchanged (call)                                  | ✅ read → call                   |
| `KbqFocusableComponent.tabIndex`                     | `@Input()` accessor    | `ModelSignal<number>`                             | ✅ read → call, write → `.set()` |
| `KbqNavbarItem.isCollapsed`                          | getter                 | `Signal<boolean>`                                 | ✅ read → call                   |
| `KbqNavbarItem.collapsable` / `collapsedText`        | `@Input()` accessors   | `input()` signals                                 | ✅ read → call                   |
| `KbqNavbarBrand.collapsed` / `collapsedText`         | getter / accessor      | `Signal<boolean>` / `input()`                     | ✅ read → call                   |
| `KbqNavbarRectangleElement.horizontal` / `vertical`  | boolean accessors      | `isHorizontal()` / `isVertical()` + `orientation` | ✅ read and `= true` write       |
| `KbqNavbarItem.disabled` / `KbqNavbarBrand.disabled` | tooltip suppression    | removed                                           | ⚠️ warn                          |
| `content` / `show()` / `hide()` / `visibleChange`    | inherited from tooltip | owned tooltip (`item.tooltip.*`)                  | ⚠️ warn                          |
| `KbqNavbarLogo.hovered` / `KbqNavbarTitle.hovered`   | `Subject<boolean>`     | removed                                           | ⚠️ warn                          |
| `KbqNavbarContainerPositionType`                     | exported type          | removed                                           | ⚠️ warn                          |

## What it does (auto-fix)

The schematic walks every `.ts`, `.html`, `.scss` and `.css` file in the project (skipping `node_modules` and
`dist`) and, for files that reference the navbar:

- **TypeScript access.** For a receiver whose static type is annotated with one of the navbar classes
  (method/function params, class fields — including `@ViewChild(KbqVerticalNavbar) x: KbqVerticalNavbar` and
  constructor parameter-properties — and typed locals):
    - `navbar.expanded` → `navbar.expanded()` (incl. optional chain `navbar?.expanded`)
    - `navbar.expanded = true` → `navbar.expanded.set(true)`
    - `element.horizontal` → `element.isHorizontal()`, and `element.horizontal = true` →
      `element.orientation = 'horizontal'`
- **Template reference reads.** For a `#ref="KbqVerticalNavbar"`, `#ref="kbqNavbarItem"` or
  `#ref="kbqNavbarBrand"` (also the `ref-x="…"` form), reads through that ref are rewritten in the same template,
  external `.html` and inline `template:` strings alike: `navbar.expanded` → `navbar.expanded()`.

All rewrites are idempotent — an access already followed by `()`, `.set`, `.update`, `.asReadonly` or
`.subscribe` is left alone, so running twice does not double the call.

A member backed by `input()` rather than `model()` (`collapsable`, `collapsedText`, `openOver`) cannot be
written to at all; such an assignment is left in place for the compiler to point at, because the fix is to drive
it from the binding.

## What it does _not_ do (warn-only)

| Change                                              | Manual migration                                                                                                                                                                                                                       |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `item.disabled` / `brand.disabled`                  | Removed. They never meant "not interactive" — they suppressed the tooltip — while colliding with the real disabled state of the same element. Read `item.navbarFocusableItem.disabled`; control the tooltip with `kbqTooltipDisabled`. |
| `item.content`, `item.show()`, `item.visibleChange` | `KbqNavbarItem` / `KbqNavbarBrand` own a `KbqTooltipTrigger` instead of extending one: `item.tooltip.content`, `item.tooltip.show()`, `item.tooltip.visibleChange`.                                                                    |
| `item.updateDropdown()`                             | Private now — the item refreshes its dropdown itself on every orientation or collapse change.                                                                                                                                          |
| `logo.hovered` / `title.hovered`                    | Removed: nothing subscribed to them and they were never completed. Bind the pointer enter/leave events on the element instead.                                                                                                         |
| `KbqNavbarContainerPositionType`                    | Removed — it had no consumer and `KbqNavbarContainer` has no position input.                                                                                                                                                           |
| `kbq-navbar-item[disabled]` in a stylesheet         | A disabled item renders `aria-disabled="true"` and `.kbq-disabled`, never the `disabled` content attribute, which is meaningless on a custom element.                                                                                  |

## Behaviour changes with no call site to migrate

Printed once per run:

- `Ctrl+/` toggles one vertical navbar — the one holding focus, falling back to the first on the page. It used
  to toggle every one of them at once, because each toggle bound its own window listener.
- The horizontal and the vertical navbar are both announced as `role="navigation"` landmarks and accept an
  `aria-label` input. An item authored as `<kbq-navbar-item>` (not as `<a>`/`<button>`, and not wrapping a
  button or form field) is announced as `role="button"` and answers to Enter/Space; `<kbq-navbar-divider>` is
  `role="separator"`.
- A collapsed item or brand publishes its title as `aria-label`. Set the new `aria-label` input on an icon-only
  item that has no title of its own — a tooltip alone never named it.
- `.kbq-navbar` left the CDK overlay layer (1000). The navbar, its toggle and an open-over container read
  `--kbq-navbar-z-index` / `--kbq-navbar-toggle-z-index` / `--kbq-navbar-vertical-open-over-z-index`
  (990 / 991 / 989).
- Hard-coded sizes became tokens: `--kbq-navbar-vertical-size-expanded-width`,
  `--kbq-navbar-item-vertical-size-height`, `--kbq-navbar-toggle-size-circle`,
  `--kbq-navbar-brand-vertical-size-title-max-width`.
- `!important` is gone from the collapsed brand title and the navbar item icon color; both now win on
  specificity. An override that relied on losing to `!important` may start applying.

## Running it manually

```
ng generate @koobiq/components:navbar-signals-and-aria --project my-app
```

Pass `--fix=false` to see what would change without writing files.

## Limitations

Receivers are matched by explicit type annotation only (no cross-package type inference), so aliased or inferred
receivers (`const n = this.navbar; n.expanded`) are left untouched. After running, **always inspect the diff**
and act on the warnings before committing.
