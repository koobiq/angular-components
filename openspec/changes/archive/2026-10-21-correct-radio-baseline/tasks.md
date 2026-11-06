# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/radio/spec.md`; all paths are under `packages/components/radio/` unless stated otherwise.

## 1. Verify the corrections

- [ ] 1.1 "Button height": verify in `radio.component.html` that `<ng-content select="kbq-hint" />` follows the option text inside `.kbq-radio__text-container`, which `radio.scss` lays out as a column with a top margin on the hint, and that `packages/docs-examples/components/radio/radio-multiline/` wraps its labels in a group 255 px wide
- [ ] 1.2 "Selected button of a group" and "Checked state of a button": in `radio.component.ts`, verify that `ngOnInit()` checks a button when `radioGroup.value === _value()`, both `null` for a button without a `value`, while the `checked` setter writes `selected` only when the group value differs from the button's; and that `updateSelectedRadioFromValue()` checks such a button and stores it in `_selected` once `selected = null` or the unchecking of the selected button writes `null` to the group value
- [ ] 1.3 "Native form submission": verify that the native input binds `[attr.name]="name"` and that the `name` getter of the button returns its own name before the group's
- [ ] 1.4 "Focusing a group": verify that `focus()` of the group takes `_selected()` without checking `disabled`, and that the native input of a disabled button carries `disabled`, so it cannot take focus
- [ ] 1.5 "Exports": verify that `KbqRadioGroup` is declared with `@Directive` and `KbqRadioButton` with `@Component`, as the directive and component declarations in `tools/public_api_guard/components/radio.api.md` record
- [ ] 1.6 Run `openspec validate correct-radio-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirements into `openspec/specs/radio/spec.md`.
