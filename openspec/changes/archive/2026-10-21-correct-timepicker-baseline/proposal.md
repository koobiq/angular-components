# Proposal

## Why

The baseline spec of `timepicker` states behaviour the code does not have. A static audit of `openspec/specs/timepicker/spec.md` against `packages/components/timepicker` and the shared `core` code on `c9c196a9b` found eight requirements whose wording contradicts the source; this change corrects them so the spec describes what ships.

## What Changes

- **Date adapter is required**: `value()` is not always a date of the adapter: while a form control is bound, it takes every value the control emits as it is, so a control set to a string leaves that string in `value()`.
- **Typed text is parsed after each key**: a complete time needs a colon between its parts; digits that run on without one are read as a single part and clamped, so `1230` becomes 23:00. A key pressed with Ctrl or Cmd is not read.
- **Typed time keeps the date**: a pasted 12-hour time whose hour reaches 24 or more (12 `am`, or 12 to 19 with `pm`) goes to the adapter as it is, and the Luxon adapter moves it to the next day.
- **Rejected keys**: only a non-word character after a single digit is handled as a separator; the underscore is always rejected with `incorrectInput`.
- **Separator after a single digit**: the replacement applies where the digit and the character first occur together, so a colon typed after `12:2` rewrites the hours and the input shows `23:00`.
- **Keys left to the browser**: empty text left by Backspace or Delete reaches only a bound form control; without one, `value()` keeps the previous time.
- **Error state**: the state is re-evaluated on every change detection only while a form control is bound; without one it is evaluated once, when the timepicker initializes.
- **Time zone changes**: after a switch to `'system'` the Luxon adapter leaves the date in its previous zone, so the text keeps the previous wall-clock time.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `timepicker`: corrects the requirements "Date adapter is required", "Typed text is parsed after each key", "Typed time keeps the date", "Rejected keys", "Separator after a single digit", "Keys left to the browser", "Error state" and "Time zone changes".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-timepicker-baseline/` and, once archived, `openspec/specs/timepicker/spec.md`. No source, test, documentation or public API changes.
