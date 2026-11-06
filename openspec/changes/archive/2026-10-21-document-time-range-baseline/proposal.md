# Proposal

## Why

`openspec/specs/` holds only the `select` baseline, so a change to `kbq-time-range` has no contract to diff against. The component is about 1,800 lines of source with 1,700 lines of unit tests, and what it promises consumers — when a value is corrected, when the editor refuses to apply, how the trigger is labelled — is spread across the source, the unit and e2e tests and the MDX docs. A baseline spec of its current behaviour lets later time-range changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `time-range` capability: the observable behaviour of `kbq-time-range` as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover opening and closing the popover, the built-in and custom triggers, the preset options and the manual range, value correction and `valueCorrected`, Apply and Cancel, forms integration, `minDate` / `maxDate` and the border validation, the reversed-range swap, `kbq-time-range-title-as-control` inside a form field, DI-provided presets, accessibility and localization.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `time-range`: the behaviour contract of `kbq-time-range` and the pieces that ship with it in `@koobiq/components/time-range` (`kbq-time-range-title-as-control`, `kbqTimeRangeTitlePlaceholder`, the DI tokens and the locale provider) — what a consumer can rely on when they render a time range, bind it to a form, and a user operates it with a pointer, the keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-time-range-baseline/` now, and `openspec/specs/time-range/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components, including the datepicker, timepicker, radio, popover and form field that the editor is built from, beyond what a time range exposes; deprecated APIs; visual styling and design tokens; internals such as the editor and title components used on their own, the service and the bridge between the footer and the editor.
- From then on, a change that alters time-range behaviour updates this spec through a `MODIFIED` delta.
