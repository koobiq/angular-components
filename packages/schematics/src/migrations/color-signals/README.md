# color-signals

Migration schematic invoked automatically by `ng update @koobiq/components@21` (registered for
`21.0.0-0`). Migrates consumers of the signal-based color of `KbqColorDirective`.

## Background

`KbqColorDirective` was an accessor input that added the `kbq-<color>` class to the host from its setter.
`color` is a writable signal now, linked to the `color` input and to the default color of the component, and
the class is rendered by a host binding. Every component built on the directive inherits it:

`KbqButton`, `KbqButtonGroupRoot`, `KbqSplitButton`, `KbqCheckbox`, `KbqPseudoCheckbox`, `KbqToggleComponent`,
`KbqRadioGroup`, `KbqRadioButton`, `KbqIcon`, `KbqIconButton`, `KbqIconItem`, `KbqFormField`, `KbqHint`,
`KbqError`, `KbqPasswordHint`, `KbqReactivePasswordHint`, `KbqCleaner`, `KbqProgressBar`, `KbqProgressSpinner`,
`KbqTag`.

## What it rewrites

On a receiver typed by one of these components, and through a template reference bound to one:

| Before                                        | After                                        |
| --------------------------------------------- | -------------------------------------------- |
| `icon.color === KbqComponentColors.Error`     | `icon.color() === KbqComponentColors.Error`  |
| `button.color = KbqComponentColors.Theme`     | `button.color.set(KbqComponentColors.Theme)` |
| `{{ b.color }}` with `<button kbq-button #b>` | `{{ b.color() }}`                            |

Template bindings such as `[color]="..."` are unchanged.

## What it reports

| Pattern                           | Action                                                                                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| A subclass of a colored component | The `color` accessor can no longer be overridden. Use `setDefaultColor()` for a default, `this.color()` to read, a `linkedSignal` to derive one. |
| `CanColor`                        | Its `color` is a `Signal` now.                                                                                                                   |

## Behavior changes with no call site

- A color set in code holds until the `[color]` binding or the default color of the component changes. On a
  button, that includes the color of its group and a change of `kbqStyle`.
- An unset or falsy `[color]` renders the default color class of the component, `kbq-empty` where it has none,
  instead of no color class.
- `KbqColorDirective` is generic: `KbqButton`, `KbqButtonGroupRoot` and `KbqSplitButton` narrow their color to
  `KbqButtonColor`.

## Running it by hand

```bash
ng g @koobiq/components:color-signals --project "<your project>"
```
