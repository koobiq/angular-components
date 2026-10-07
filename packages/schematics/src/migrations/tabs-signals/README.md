# tabs-signals

Migration schematic invoked automatically by `ng update @koobiq/components@21` (registered for `21.0.0-0`).
Reports subclasses of the tabs classes and direct calls of their `ngOnChanges`. It never writes to the tree.

## Background

The decorator inputs of `KbqTabGroup`, `KbqTab`, `KbqTabHeader`, `KbqTabNavBar`, `KbqTabLink`, `KbqTabLabelWrapper`
and `KbqTabBody` are signal inputs named `<member>Input`, handed to the unchanged member from `ngOnChanges`. Their
decorator queries are signal queries behind getters: `KbqTabGroup.tabs` and the `items` of the header and the nav bar
stay `QueryList`s. Reading and writing the members works as before.

| Use                                         | What to do                                                            |
| ------------------------------------------- | --------------------------------------------------------------------- |
| A subclass with its own `ngOnChanges`       | Mark it `override` and call `super.ngOnChanges(changes)`              |
| A subclass that redeclared an `@Input()`    | Override the `<member>Input` signal input, e.g. `headerPositionInput` |
| A subclass that redeclared a query          | Override the getter (`tabs`, `items`, `labelContent`, …)              |
| `ngOnChanges` called with a `SimpleChanges` | Key it by `<member>Input` (`disabledInput`), or bind the input        |

A boolean input accepts `boolean | string | null | undefined` in a template now, rather than anything.

## Running it manually

```bash
ng g @koobiq/components:tabs-signals --project "<your project>"
```
