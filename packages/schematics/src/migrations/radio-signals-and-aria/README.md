# radio-signals-and-aria

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `21.0.0-0`). Moves the radio's one-way inputs to the signal API and reports what has
no mechanical translation.

## Background

`name` is the load-bearing contract in the radio: the app-global `UniqueSelectionDispatcher` fans a
notification out to every listener in the application, and the name comparison inside each listener is
the only isolation there is. A button used outside a group never assigned one, so `undefined ===
undefined` made every group-less radio in the application one selection group — checking one
un-checked the others, in unrelated routes, overlays and dialogs. In the other direction, `ngOnInit`
overwrote an explicitly bound `[name]` with the group's, so the documented input did nothing.

## What it rewrites

A read of one of these becomes a call. The rewrite is **scoped by receiver type**, which matters here
more than in any other component of the campaign: `name`, `labelPosition` and `required` exist on both
classes, and only the group's became signals.

| Type             | Members                             |
| ---------------- | ----------------------------------- |
| `KbqRadioGroup`  | `name`, `labelPosition`, `required` |
| `KbqRadioButton` | `id`, `inputId`                     |

So `group.required` becomes `group.required()`, while `button.required` is left exactly as it was.

## What stays an accessor input, and why

| Member                                                                    | Why                                                                                                                                                                             |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `KbqRadioGroup.value`                                                     | `writeValue` writes it, and has to resolve the checked button synchronously before the first render; a `model()` would also publish a `valueChange` output duplicating `change` |
| `KbqRadioGroup.selected`                                                  | the buttons write their selection back onto the group                                                                                                                           |
| `KbqRadioGroup.disabled`                                                  | `setDisabledState` writes it, and it coerces with `booleanAttribute` — a `model()` carries no `transform`                                                                       |
| `KbqRadioButton.checked`                                                  | two-way state the component and the form both write, with a `booleanAttribute` transform                                                                                        |
| `KbqRadioButton.value`                                                    | writing it re-resolves the checked state against the group                                                                                                                      |
| `disabled`, `required`, `labelPosition`, `name`, `tabIndex` on the button | each folds in the group's value — a button inside a disabled group is disabled — so the read is derived, not stored                                                             |

Reads and writes of those are unchanged.

## What it only reports

| Pattern                      | Manual migration                                          |
| ---------------------------- | --------------------------------------------------------- |
| `[isFocused]` / `.isFocused` | Read the `cdk-*-focused` classes, or call `focus(origin)` |
| `.radioGroup`                | Guard the access — the button may not be in a group       |
| `.id = …`                    | Bind `[id]` instead; `id` is read-only now                |
| `--kbq-radio-size-*-top`     | Delete the override; no rule read it                      |

`KbqRadioButton.isFocused` was removed outright: a published input that nothing read. `radioGroup` is
typed `KbqRadioGroup | null` — it was always injected with `{ optional: true }` and the non-null
assertion only hid it.

## Notes with no call site to point at

- Two `<kbq-radio-button>`s used outside a group are independent now. Markup that relied on the old
  mutual exclusion has to say so: put them in a group, or give them the same explicit `[name]`.
- `[name]` on a button inside a group is honoured, so a button bound to its own name forms its own
  selection group instead of silently inheriting the group's.
- `<kbq-radio-group>` is a `radiogroup`, which takes no name from its content. Name it with a plain
  `aria-label` / `aria-labelledby` attribute on the element — a detached label sibling leaves the
  group unnamed for assistive technology.
- A `kbq-hint` projected into a button is exposed through `aria-describedby` instead of being folded
  into the button's accessible name.
- `[color]` on the group colors every button in it, `[required]` reaches the group as
  `aria-required`, and an error color as `aria-invalid`.
- The native input carries its option value, so a group inside a plain `<form>` submits that value
  instead of the literal `"on"`. Only string-like values round-trip, and a group meant for native
  submission still needs an explicit `[name]`.

## Running it manually

```
ng generate @koobiq/components:radio-signals-and-aria --project my-app
```

Pass `--fix=false` to see what would change without writing.
