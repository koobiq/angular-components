# Proposal

## Why

`openspec/specs/` has no contract for the timepicker. `kbqTimepicker` is a single directive of about 1,060 lines with a 1,650-line unit spec, and what it promises consumers is spread across the source, the unit and e2e tests and the MDX docs, which describe the keyboard in terms the code does not follow. A baseline spec of its current behaviour lets later timepicker changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `timepicker` capability: the observable behaviour of `input[kbqTimepicker]` as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the two time formats and how the value is rendered, the placeholder and its localization, typing and how text is normalized, the arrow, Home, End and Space keys, pasting, completing the text on blur, the `min`, `max` and parse validators, forms integration (value accessor, `[value]`, disabled, touched, error state), the form field, the validation tooltip, the time zone and the exported constants.
- Record behaviour that the docs and the code disagree on, suspected defects and tests that cannot fail as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `timepicker`: the behaviour contract of the `kbqTimepicker` directive and the constants that ship with it in `@koobiq/components/timepicker` — what a consumer can rely on when they put the directive on an input, bind it to a form, and a user types, pastes or steps the time with the keyboard.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-timepicker-baseline/` now, and `openspec/specs/timepicker/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (`kbq-datepicker`, `kbq-time-range`, the filter-bar date pipes and `kbq-inline-edit`, which compose the timepicker), the behaviour of `kbq-form-field` and `kbqTooltip` beyond what the timepicker drives, the date adapters themselves, visual styling and design tokens, deprecated APIs, and internals.
- From then on, a change that alters timepicker behaviour updates this spec through a `MODIFIED` delta.
