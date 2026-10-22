# Proposal

## Why

The baseline spec of `datepicker` states behaviour the code does not have. A static audit of `openspec/specs/datepicker/spec.md` against `packages/components/datepicker` and the shared `core` code on `c9c196a9b` found nine requirements whose wording contradicts the source; this change corrects them so the spec describes what ships.

## What Changes

- **Calendar controls outside the tab order**: only the day cells and the hosts of the month and year selects have `tabindex="-1"`; the previous, current date and next buttons render no `tabindex` while enabled, because `kbq-button` drops the one the header binds, and the buttons that open the month and year lists are native buttons, so all of them stay in the tab order.
- **Normalizing date parts**: while the input holds a value, a typed day past the end of the typed month becomes that month's last day rather than 31; a year longer than four digits keeps its first four only when it is above 9999.
- **Deleting text**: text changed by Backspace or Delete is parsed on blur or on the next key that reaches the parser; Up and Down step the last parsed value instead, and Left or Right render that value again when a date part is empty.
- **Pasting a date**: pasted text that starts with one digit followed by a non-digit gets a `0` in front, three digit groups are joined with the format's separator even when they do not parse, and only Latin letters emit `incorrectInput`.
- **Stepping a date part**: Up and Down with a modifier key are not prevented, and a year step keeps the day, so from 29 February into a common year it empties the input and passes an invalid date to the form control.
- **Parse validation**: gaining focus does not re-validate the control, so a parse error reported on blur stays while the input has focus until the next validation.
- **Blur re-validation**: blur on text that does not parse re-validates with events, so `statusChanges` emits although the value did not change.
- **Toggle keeps focus in the input**: the click of a disabled toggle propagates to the form field.
- **Placeholder**: with a locale service the placeholder is the service locale's string whatever the input format, and strings provided for `KBQ_DATEPICKER_LOCALE_CONFIGURATION` win only without a locale service; the scenarios that rely on no locale service say so.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `datepicker`: corrects the requirements "Calendar controls outside the tab order", "Normalizing date parts", "Deleting text", "Pasting a date", "Stepping a date part", "Parse validation", "Blur re-validation", "Toggle keeps focus in the input" and "Placeholder".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-datepicker-baseline/` and, once archived, `openspec/specs/datepicker/spec.md`. No source, test, documentation or public API changes.
