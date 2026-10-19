# list-signals

Migration schematic invoked automatically by `ng update @koobiq/components@21` (registered for `21.0.0-0`).
Reports programmatic writes to the signal inputs of `KbqListSelection` and `KbqListOption`. It never writes to the
tree.

## Background

The inputs of the list are signal inputs read through a getter. A read is unchanged; a write no longer compiles.

| Member                                                                                         | Write                            |
| ---------------------------------------------------------------------------------------------- | -------------------------------- |
| `KbqListSelection`: `autoSelect`, `noUnselectLast`, `multiple`, `tabIndex`, `selectAllHandler` | Bind it                          |
| `KbqListSelection.disabled`                                                                    | Bind it, or use the form control |
| `KbqListOption`: `value`, `disabled`, `draggable`, `showCheckbox`                              | Bind it                          |
| `KbqListOption.selected`, `KbqListSelection.multipleMode`                                      | Still writable                   |

## Running it manually

```bash
ng g @koobiq/components:list-signals --project "<your project>"
```
