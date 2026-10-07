# core-mixins-removal

Migration schematic invoked automatically by `ng update @koobiq/components@21` (registered for `21.0.0-0`).
Reports the uses of the removed `mixinDisabled` and `mixinTabIndex`. It never writes to the tree.

## Background

Both mixins were deprecated, unused inside the library, and logged a dev-mode warning on every instance. They are
removed from `@koobiq/components/core` with their types.

| Removed                                           | Manual migration                                                                 |
| ------------------------------------------------- | -------------------------------------------------------------------------------- |
| `mixinDisabled`, `CanDisable`, `CanDisableCtor`   | `readonly disabled = input(false, { transform: booleanAttribute })` on the class |
| `mixinTabIndex`, `HasTabIndex`, `HasTabIndexCtor` | A `tabIndex` input on the class, rendered as -1 while it is disabled             |

## Running it manually

```bash
ng g @koobiq/components:core-mixins-removal --project "<your project>"
```
