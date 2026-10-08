# modal-signals

Migration schematic invoked automatically by `ng update @koobiq/components@21` (registered for `21.0.0-0`).
Reports subclasses of `KbqModalComponent` and direct calls of its `ngOnChanges`. It never writes to the tree.

## Background

The decorator inputs of `KbqModalComponent` are signal inputs named `<member>Input`, handed to the unchanged member
from `ngOnChanges`, and its outputs are `<member>Output` over the unchanged emitters. Reading and writing the members
works as before, and so do the options of `KbqModalService`.

| Use                                                     | What to do                                                       |
| ------------------------------------------------------- | ---------------------------------------------------------------- |
| A subclass with its own `ngOnChanges`                   | Call `super.ngOnChanges(changes)`                                |
| A subclass that redeclared an `@Input()` or `@Output()` | Override the `<member>Input` or `<member>Output` member instead  |
| An accessor over `kbqVisible` or `kbqMaskClosable`      | They are fields: override them as fields, react in `ngOnChanges` |
| `ngOnChanges` called with a `SimpleChanges`             | Key it by `<member>Input` (`kbqVisibleInput`), or bind the input |

## Running it manually

```bash
ng g @koobiq/components:modal-signals --project "<your project>"
```
