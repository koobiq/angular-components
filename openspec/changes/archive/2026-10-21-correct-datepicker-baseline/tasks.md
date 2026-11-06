# Tasks

## 1. Verify the corrections

- [ ] 1.1 Re-read the evidence for "Calendar controls outside the tab order" (the `[tabindex]` bindings in `packages/components/datepicker/calendar-header.html` and `calendar-body.html`, the `tabIndex` input and the `[attr.tabindex]` host binding of `KbqButton` in `packages/components/button/button.component.ts`) and verify the enabled header buttons render no `tabindex` attribute
- [ ] 1.2 Re-read the evidence for "Normalizing date parts" (`DateDigit.parseDay` and `parseYear`, `getDateFromString` and `parseOnBlur` in `packages/components/datepicker/datepicker-input.directive.ts`) and verify the day is capped at the typed month's length while the input holds a value
- [ ] 1.3 Re-read the evidence for "Deleting text" (`onKeyDown`, `isKeyForByPass`, `verticalArrowKeyHandler`, `changeCaretPosition` and `fixEmptyDigit` in `datepicker-input.directive.ts`) and verify Up and Down step the last parsed value after the text was deleted
- [ ] 1.4 Re-read the evidence for "Pasting a date" (`onPaste` in `datepicker-input.directive.ts`) and verify the `0` put before a single leading digit, the joining with the format's separator and the Latin-only letter check
- [ ] 1.5 Re-read the evidence for "Stepping a date part" (`isKeyForByPass`, `incrementDate`, `decrementDate` and `verticalArrowKeyHandler` in `datepicker-input.directive.ts`, `createDate` of the Luxon adapter) and verify a year step from 29 February empties the input
- [ ] 1.6 Re-read the evidence for "Parse validation" (`focusChanged`, `parseValidator` and `onInput` in `datepicker-input.directive.ts`) and verify gaining focus does not re-validate the control
- [ ] 1.7 Re-read the evidence for "Blur re-validation" (`onBlur`, `parseOnBlur`, `onInput` and `updateValue` in `datepicker-input.directive.ts`) and verify text that does not parse is re-validated with events
- [ ] 1.8 Re-read the evidence for "Toggle keeps focus in the input" (`onMousedown` and `toggleCalendar` in `packages/components/datepicker/datepicker-toggle.component.ts`) and verify `stopPropagation()` runs only for an enabled toggle bound to a datepicker
- [ ] 1.9 Re-read the evidence for "Placeholder" (`datepickerInputLocaleConfiguration` in `datepicker-input.directive.ts`, `kbqInjectLocaleConfiguration` in `packages/components/core/locales/configuration.ts`, `getParams` in `locale-service.ts`) and verify a locale service replaces the format rule and the strings provided for the token
- [ ] 1.10 Run `openspec validate correct-datepicker-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`.
