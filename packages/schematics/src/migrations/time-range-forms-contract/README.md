# time-range-forms-contract

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `21.0.0-0`). Reports the `time-range` call sites the component review breaks. It never
writes to the tree.

## Background

The review made the component tell Angular's forms layer the truth about itself, and turned the
published form-field adapter from a set of declarations into a real implementation.

| Member                                                                                | Before                | After                             |
| ------------------------------------------------------------------------------------- | --------------------- | --------------------------------- |
| `KbqTimeRangeEditor.timepickerList`                                                   | view query            | removed                           |
| `KbqTimeRangeTitleAsControl.value` / `empty` / `required` / `disabled` / `errorState` | writable, never set   | getters over the host and control |
| `KbqTimeRangeTitleAsControl.id` / `placeholder` / `controlType` / `stateChanges`      | writable, `undefined` | readonly, generated and emitting  |
| `KbqTimeRange.setDisabledState` / `KbqTimeRangeEditor.setDisabledState`               | absent                | implemented                       |
| `KbqTimeRangeTitle.disabled`                                                          | absent                | signal input                      |

The one-line defect behind the review is worth naming. `mapTimeRange` assembled its argument as
`toDate: this.form.controls.toTime.value` — the _time_ control feeding the _date_ slot — and
`combineDateAndTime` takes the calendar date from its first argument. A user who picked "to:
20 September" got a range ending on whatever day the timepicker held. The form's own validator read
`toDate` correctly, so validation and emission disagreed about what the range was.

## What it does _not_ do

Nothing is rewritten. What replaces a write to a member that became a getter is a binding on the host
component or nothing at all, and neither can be derived from the assignment.

| Pattern                                          | Manual migration                                                                 |
| ------------------------------------------------ | -------------------------------------------------------------------------------- |
| `.timepickerList`                                | Provide an `ErrorStateMatcher`; the editor no longer writes `errorState` by hand |
| `.errorState = …` and friends                    | Drive the state through the bound form control                                   |
| `(valueCorrected)`                               | Still emits, but only for values it actually corrected                           |
| `.kbq-radio-group .kbq-time-range-editor__range` | The from/to block is a sibling of the radiogroup now, not a descendant           |

## Notes with no call site to point at

- Ranges emitted before this release ended on the wrong calendar day. Persisted values may need
  correcting.
- A disabled control is inert: the trigger leaves the tab order, the popover refuses to open, and the
  host takes a `kbq-disabled` class.
- The control becomes `touched` when the popover closes, so a `required` time range shows its error
  message at the moment the matcher intends instead of never.
- The popover footer dropped its unnamed `role="group"`, and the from/to prefixes are associated with
  their four inputs through `aria-labelledby` instead of an inert `aria-label` on a bare `<span>`.

## Running it manually

```
ng generate @koobiq/components:time-range-forms-contract --project my-app
```
