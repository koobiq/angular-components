# Proposal

## Why

The input entry point has no spec, so a change to it has no contract to diff against. `@koobiq/components/input` ships four directives and two validators on a native `<input>` (about 1,500 lines of source and 3,900 lines of unit tests), and the number input carries most of the behaviour: what a keystroke, a paste or an arrow key does to the text and to the value depends on the locale and on half a dozen inputs. What it promises consumers is spread across the source, the unit and e2e tests and the MDX docs. A baseline spec of its current behaviour lets later input changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `input` capability: the observable behaviour of `kbqInput`, `kbqNumberInput`, `kbqInputPassword`, `kbqInputMonospace` and the `min` / `max` validator directives as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the text input as a form field control (id, placeholder, type, value, empty, focus, disabled, required, error state, autofill, accessibility), the number input (typing, the keys it accepts, grouping, the fraction separator, the minus sign, integer mode, paste, stepping and its bounds, the bound value, `valueAsNumber`, `valueChange`, ARIA), the validators, number formatting by locale, the monospace input and the password input.
- Record behaviour that the docs and the code disagree on, suspected defects and weak tests as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `input`: the behaviour contract of the directives in `@koobiq/components/input` — what a consumer can rely on when they put `kbqInput`, `kbqNumberInput` or `kbqInputPassword` on an `<input>`, bind it to a form, and a user types, pastes, steps or reveals a value.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-input-baseline/` now, and `openspec/specs/input/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components, including the form field pieces the input works with (`kbq-form-field`, `kbq-stepper`, `kbq-password-toggle`, `kbq-cleaner`, the hints, `kbqTrim`) beyond what the input exposes to them; `kbqNormalizeWhitespace` and `PasswordValidators` from `core`; deprecated APIs such as `KBQ_INPUT_NUMBER_DEFAULT_CONFIGURATION`; visual styling and design tokens; internals.
- From then on, a change that alters input behaviour updates this spec through a `MODIFIED` delta.
