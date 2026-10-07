# option-signals

Migration schematic invoked automatically by `ng update @koobiq/components@21` (registered for `21.0.0-0`).
Migrates consumers of the signal inputs of `KbqOption`, `KbqOptgroup`, `KbqOptionActionComponent` and
`KbqTimezoneOption`.

## Background

The options keep their state in signal inputs. The state consumers read through events and models stays a property
read — `event.option.value`, `select.selected.disabled`, `option.viewValue` in a `kbqSelectTagContent` template — so
those reads are unchanged:

| Member                                                        | Read           | Programmatic write |
| ------------------------------------------------------------- | -------------- | ------------------ |
| `KbqOption.value`, `.viewValue`, `.disabled`, `.showCheckbox` | unchanged      | removed            |
| `KbqTimezoneOption.timezone`                                  | unchanged      | removed            |
| `KbqOptgroup.disabled`, `KbqOptionActionComponent.disabled`   | becomes a call | removed            |

## What it rewrites

A read of `disabled` on a receiver typed `KbqOptgroup` or `KbqOptionActionComponent`, or through a template reference
on `<kbq-optgroup>` or `<kbq-option-action>`, becomes a call.

## What it reports

| Pattern                                              | Action                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------ |
| `option.value = …` and the other option state writes | Bind the input in the template.                                    |
| `option.stateChanges`                                | No longer emits for `disabled`: read it in a `computed()` instead. |
| `option.textElement`                                 | Typed `ElementRef \| undefined` now.                               |
| `KbqOptionBase`                                      | `value` is an abstract getter, `disabled` has no abstract setter.  |

## Running it by hand

```bash
ng g @koobiq/components:option-signals --project "<your project>"
```
