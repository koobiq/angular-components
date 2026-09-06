# inline-edit-a11y-and-types

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `21.0.0-0`). Reports what the inline-edit review broke. It never writes to the tree.

## Background

The edit overlay used to render two `<div class="cdk-visually-hidden" aria-hidden="true" tabindex="0">`
sentinels around its panel to detect a Tab out of the editor. That is an axe `aria-hidden-focus`
failure and two live tab stops that announce nothing, so the sentinels — and the
`KbqFocusRegionItem` directive behind them — are gone; the boundary is resolved against the panel's
own first and last tabbable control.

The widget semantics moved with them. The host carried a `tabindex` and no ARIA at all, so a
`<kbq-inline-edit>` was an unknown element that happened to be focusable. `role="button"`,
`aria-expanded`, `aria-disabled` and the accessible name now live on
`.kbq-inline-edit__view-content`, and on `.kbq-inline-edit__focus-anchor` while the view content is
interactive — putting them on the host would nest the `kbqInlineEditMenu` button inside a widget role.

| Member                            | Before                       | After                               |
| --------------------------------- | ---------------------------- | ----------------------------------- |
| `KbqFocusRegionItem`              | exported directive           | removed                             |
| `setValueHandler`                 | `(value: any) => void`       | `(value: unknown) => void`          |
| `validationTooltip`               | `string \| TemplateRef<any>` | `string \| TemplateRef<unknown>`    |
| `saved`, `canceled`, `modeChange` | `protected`                  | public                              |
| `KbqA11yLocaleConfiguration`      | 15 keys                      | plus the required `edit`            |
| host `tabindex` / `role`          | on `<kbq-inline-edit>`       | on `.kbq-inline-edit__view-content` |

## What it does _not_ do

Nothing is rewritten. A removed export has no replacement expression, a narrowed handler parameter
needs a cast only the host can choose, and a selector that matched the host by `tabindex` or `:focus`
is a decision about which element it actually meant.

| Pattern                                     | Manual migration                                                           |
| ------------------------------------------- | -------------------------------------------------------------------------- |
| `kbqFocusRegionItem` / `KbqFocusRegionItem` | Drop it — the Tab boundary is detected on the panel                        |
| `[setValueHandler]` handler                 | Widen the parameter to `unknown` and narrow inside                         |
| `KbqA11yLocaleConfiguration` literal        | Add the `edit` key, or switch to a partial override provider               |
| `.kbq-inline-edit[tabindex]` / `:focus`     | Target `.kbq-inline-edit__view-content` / `.kbq-inline-edit__focus-anchor` |

## Notes with no call site to point at

- The view mode is announced as a `button` with `aria-expanded`. Its name comes from the new `edit`
  a11y locale key, or from an `aria-label` on the component — which is read as an input, so a
  hand-rolled `aria-label` on the host is no longer just an attribute.
- `saved`, `canceled` and `modeChange` are public, so a `viewChild(KbqInlineEdit)` can subscribe to
  them. Template bindings are unaffected.
- `save()` marks the projected controls touched itself and gates on the control's validity rather than
  on the `ErrorStateMatcher` verdict. Typing no longer flips a pristine `required` field into its error
  look, and `commit()` on a never-touched invalid control keeps the editor open instead of writing the
  value through — a workaround directive that reset `touched` on the first input can be deleted.
- The panel shadow reads `--kbq-inline-edit-panel-shadow`, the token the panel used to declare and then
  bypass, so setting it now changes the shadow. The private `.kbq-mask`, `.kbq-mask__fade` and
  `.kbq-mask__container` classes were renamed to their `.kbq-inline-edit__menu-mask*` equivalents.

## Running it manually

```
ng generate @koobiq/components:inline-edit-a11y-and-types --project my-app
```
