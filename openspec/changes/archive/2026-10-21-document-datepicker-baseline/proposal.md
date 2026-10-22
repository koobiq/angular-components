# Proposal

## Why

`kbq-datepicker` has no spec, so a change to it has no contract to diff against. The behaviour consumers rely on is spread over a 1,700-line input directive with its own masking engine, the pop-up component, the calendar, its header and month view, the toggle icon, about 3,700 lines of unit tests, one Playwright spec and the MDX page. A baseline spec of what ships today lets later datepicker changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `datepicker` capability: the observable behaviour of `@koobiq/components/datepicker` as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover wiring an input to a datepicker, opening and closing the calendar (code, toggle icon, keyboard, outside clicks), focus handling, pop-up placement, the calendar grid and its header, typing, pasting and stepping dates in the input, forms integration, the `min`/`max`/filter/parse validators, the `dateInput` and `dateChange` events, the toggle icon, the input's attributes and the locale and time zone handling.
- Record docs and JSDoc that disagree with the code, suspected defects and weak tests as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `datepicker`: the behaviour contract of `kbq-datepicker`, the `input[kbqDatepicker]` directive, the `kbq-datepicker-toggle-icon` and the calendar they open — what a consumer can rely on when they wire a date field, bind it to a form, and a user operates it with the pointer or the keyboard.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-datepicker-baseline/` now, and `openspec/specs/datepicker/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (`kbq-timepicker`, `kbq-form-field`, the filter-bar date pipes, `kbq-select` used inside the calendar header), the date adapters themselves, deprecated APIs (`KBQ_DATEPICKER_CONFIGURATION`, `KBQ_DATEPICKER_DEFAULT_CONFIGURATION`), visual styling and design tokens, and internals such as the masking engine's private state.
- From then on, a change that alters datepicker behaviour updates this spec through a `MODIFIED` delta.
