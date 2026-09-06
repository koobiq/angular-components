# radio-name-and-aria

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `21.0.0-0`). Reports the radio call sites the review changed. It never writes to the
tree.

## Background

`name` is the load-bearing contract in the radio: the app-global `UniqueSelectionDispatcher` fans a
notification out to every listener in the application, and the name comparison inside each listener is
the only isolation there is. A button used outside a group never assigned one, so `undefined ===
undefined` made every group-less radio in the application one selection group — checking one
un-checked the others, in unrelated routes, overlays and dialogs. In the other direction, `ngOnInit`
overwrote an explicitly bound `[name]` with the group's, so the documented input did nothing.

| Member                                                    | Before                    | After                            |
| --------------------------------------------------------- | ------------------------- | -------------------------------- |
| `KbqRadioButton.isFocused`                                | published input, unread   | removed                          |
| `KbqRadioButton.radioGroup`                               | `KbqRadioGroup`           | `KbqRadioGroup \| null`          |
| `KbqRadioButton.name`                                     | `undefined` without group | group name, else a unique id     |
| `KbqRadioButton.focus()`                                  | bare `element.focus()`    | `focus(origin?: FocusOrigin)`    |
| `KbqRadioGroup.focus()`                                   | —                         | forwards to the checked option   |
| `KbqRadioGroup.color`                                     | —                         | colors every button in the group |
| `--kbq-radio-size-big-top`, `--kbq-radio-size-normal-top` | declared, unreferenced    | removed                          |

## What it does _not_ do

Nothing is rewritten. A removed input has no replacement expression, and narrowing `KbqRadioGroup |
null` back to a non-null value is a decision the call site owns.

| Pattern                      | Manual migration                                          |
| ---------------------------- | --------------------------------------------------------- |
| `[isFocused]` / `.isFocused` | Read the `cdk-*-focused` classes, or call `focus(origin)` |
| `.radioGroup`                | Guard the access — the button may not be in a group       |
| `--kbq-radio-size-*-top`     | Delete the override; no rule read it                      |

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
ng generate @koobiq/components:radio-name-and-aria --project my-app
```
