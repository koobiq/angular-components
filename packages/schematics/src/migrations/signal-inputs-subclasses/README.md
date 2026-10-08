# signal-inputs-subclasses

Migration schematic invoked automatically by `ng update @koobiq/components@21` (registered for `21.0.0-0`).
Reports subclasses of the components whose decorator inputs became signal inputs. It never writes to the tree.

## Background

The inputs of `KbqCheckbox`, `KbqToggleComponent`, `KbqRadioGroup`, `KbqRadioButton`, `KbqButtonToggleGroup`,
`KbqButtonToggle`, `KbqButton`, `KbqButtonGroupRoot`, `KbqSplitButton`, `KbqIcon`, `KbqIconButton`, `KbqIconItem` and
`KbqSearchExpandable`, and of the pop-up triggers — tooltip, popover, popover confirm, app switcher, notification
center, password toggle and ellipsis center — and of the tags, file uploads, accordion item, navbar item, notification
item and sidebar are signal inputs named `<member>Input`, which `ngOnChanges` hands to the unchanged member.
Reading and writing the members works as before.

| Pattern                                  | Manual migration                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| A subclass that implements `ngOnChanges` | Call `super.ngOnChanges(changes)`                                              |
| A subclass that redeclares an `@Input()` | Override the `<member>Input` signal input with its alias, e.g. `iconNameInput` |
| A panel that redeclares `elementRef`     | Override the protected `elementRef` getter over a `viewChild()`                |

A boolean input accepts `boolean | string | null | undefined` in a template now, rather than anything.

## Running it manually

```bash
ng g @koobiq/components:signal-inputs-subclasses --project "<your project>"
```
