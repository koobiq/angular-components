# input-signals

Migration schematic invoked automatically by `ng update @koobiq/components@21` (registered for `21.0.0-0`).
Reports programmatic writes to the signal inputs of `KbqNumberInput` and `KbqInput`. It never writes to the tree.

## Background

`KbqNumberInput.value`, `KbqNumberInput.disabled` and `KbqInput.type` are signal inputs read through a getter. A read
is unchanged; a write no longer compiles.

| Write                                               | Manual migration                                       |
| --------------------------------------------------- | ------------------------------------------------------ |
| `numberInput.value = …`, `numberInput.disabled = …` | Bind `[value]` / `[disabled]`, or use the form control |
| `input.type = …`                                    | Bind `[type]`                                          |

## Running it manually

```bash
ng g @koobiq/components:input-signals --project "<your project>"
```
