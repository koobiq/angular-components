# controls-signal-inputs

Migration schematic invoked automatically by `ng update @koobiq/components@21` (registered for `21.0.0-0`).
Reports subclasses of the controls whose decorator inputs became signal inputs. It never writes to the tree.

## Background

The inputs of `KbqCheckbox`, `KbqToggleComponent`, `KbqRadioGroup`, `KbqRadioButton`, `KbqButtonToggleGroup`,
`KbqButtonToggle`, `KbqButton`, `KbqButtonGroupRoot`, `KbqSplitButton`, `KbqIcon`, `KbqIconButton`, `KbqIconItem` and
`KbqSearchExpandable` are signal inputs named `<member>Input`, which `ngOnChanges` hands to the unchanged member.
Reading and writing the members works as before.

| Pattern                                  | Manual migration                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| A subclass that implements `ngOnChanges` | Call `super.ngOnChanges(changes)`                                              |
| A subclass that redeclares an `@Input()` | Override the `<member>Input` signal input with its alias, e.g. `iconNameInput` |

A boolean input accepts `boolean | string | null | undefined` in a template now, rather than anything.

## Running it manually

```bash
ng g @koobiq/components:controls-signal-inputs --project "<your project>"
```
