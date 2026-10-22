# Tasks

## 1. Verify the corrections

- [ ] 1.1 Re-read the evidence for "Date adapter is required" (`setValue` and `setControl` in `packages/components/timepicker/timepicker.directive.ts`) and verify the control's `valueChanges` are written to `value()` without the adapter
- [ ] 1.2 Re-read the evidence for "Typed text is parsed after each key" (`onKeyDown`, `onInput` and `replaceNumbers` in `timepicker.directive.ts`, the test "Should normalize time part with more than four digits") and verify digits without a colon are clamped as hours and a key with Ctrl or Cmd schedules no read
- [ ] 1.3 Re-read the evidence for "Typed time keeps the date" (`getDateFromTimeString` in `timepicker.directive.ts`, `createDateTime` of `@koobiq/luxon-date-adapter`, `DateTime.set` of Luxon) and verify a pasted `12:3 aM` lands on the next day
- [ ] 1.4 Re-read the evidence for "Rejected keys" (`onKeyDown` and `replaceSymbols` in `timepicker.directive.ts`) and verify an underscore after a single digit emits `incorrectInput`
- [ ] 1.5 Re-read the evidence for "Separator after a single digit" (`replaceSymbols` and `replaceNumbers` in `timepicker.directive.ts`) and verify `12:2` followed by `:` renders `23:00`
- [ ] 1.6 Re-read the evidence for "Keys left to the browser" (`onKeyDown`, `onBlur` and `onInput` in `timepicker.directive.ts`) and verify empty text calls only `onChange(null)`, which is a no-op without a form control
- [ ] 1.7 Re-read the evidence for "Error state" (`ngDoCheck`, `ngAfterContentInit` and `setControl` in `timepicker.directive.ts`, `KbqErrorStateTracker` in `packages/components/core/common-behaviors/error-state.ts`) and verify the state is re-evaluated only while a control is set
- [ ] 1.8 Re-read the evidence for "Time zone changes" (the `timezoneService.changes` subscription in `timepicker.directive.ts`, `deserialize`, `format` and `activeZone` in `packages/angular-luxon-adapter/adapter/date-adapter.ts`, `reconfigure` of `@koobiq/luxon-date-adapter`) and verify a switch to `'system'` keeps the date's zone
- [ ] 1.9 Run `openspec validate correct-timepicker-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`.
