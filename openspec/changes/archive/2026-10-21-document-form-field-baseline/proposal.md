# Proposal

## Why

Only `select` has a baseline spec so far, and `kbq-form-field` wraps nearly every text control in the library, including the select. What it promises consumers — the label, hints and errors, the cleaner, the password toggle, the stepper, prefixes and suffixes, the fieldset and the trimming of values — is spread across about 1,500 lines of source, 2,000 lines of unit tests, a Playwright spec and two MDX pages. A baseline spec of its current behaviour lets later form-field changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `form-field` capability: the observable behaviour of `@koobiq/components/form-field` as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the control slot and its errors, the label and the horizontal layout, hints, error messages and their timing, `aria-describedby`, the state classes on the host, default options, prefix and suffix slots, the overlay origin, the cleaner, the password toggle and the reactive password hint, the stepper, `kbq-fieldset`, the trimming of `kbqInput` and `kbqTextarea` values, and the contract for custom controls.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `form-field`: the behaviour contract of `kbq-form-field` and the elements and directives that ship with it in `@koobiq/components/form-field` (`kbq-label`, `kbq-hint`, `kbq-error`, `kbq-cleaner`, `kbqPrefix`, `kbqSuffix`, `kbq-password-toggle`, `kbq-reactive-password-hint`, `kbq-stepper`, `kbq-fieldset`, `kbqLegend`, `kbqFieldsetItem`, `KbqTrim`) — what a consumer can rely on when they wrap a control in a form field, bind it to a form, and a user operates it with mouse, keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-form-field-baseline/` now, and `openspec/specs/form-field/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: the controls placed inside a form field (`kbqInput`, `kbqInputPassword`, `kbqNumberInput`, `kbqTextarea`, `kbq-select`, `kbq-tag-list` and the rest) beyond the state they hand to the form field, the error state matchers of `core` beyond what a form field shows for them, cleaners hosted by a select, tree select, timezone select or tag list, visual styling and design tokens (including the autofill tint and control groups), internals, and deprecated APIs.
- From then on, a change that alters form-field behaviour updates this spec through a `MODIFIED` delta.
