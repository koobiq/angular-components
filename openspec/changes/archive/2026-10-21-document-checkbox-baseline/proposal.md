# Proposal

## Why

`openspec/specs/` has no spec for `kbq-checkbox`, so a later checkbox change has no contract to diff against. The checkbox is small (about 330 lines of source and 1,250 lines of unit tests), but what it promises consumers is split between the component, the shared `KbqCheckable` primitive in `@koobiq/components/core`, the unit and e2e tests and the MDX docs. A baseline spec of its current behaviour lets later checkbox changes be written as `MODIFIED` deltas against a known contract.

## What Changes

- Add the `checkbox` capability: the observable behaviour of `kbq-checkbox` and `KbqCheckboxRequiredValidator` as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the checked and indeterminate states, the click action and its injection token, pointer and keyboard interaction, the `change` and `indeterminateChange` outputs, the native input attributes, ids, focus and tab order, disabled state, Angular forms integration and the required validator, ARIA, and the layout options consumers set (`big`, `labelPosition`, `color`, the projected hint).
- Record docs that disagree with the code, suspected defects and tests that cannot fail as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `checkbox`: the behaviour contract of `kbq-checkbox` and the directives that ship with it in `@koobiq/components/checkbox` — what a consumer can rely on when they render a checkbox, bind it to a form, and a user operates it with a pointer, the keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-checkbox-baseline/` now, and `openspec/specs/checkbox/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components, including `kbq-toggle` and `kbq-pseudo-checkbox`; the `KbqCheckable` primitive and the "Block checkbox" example beyond what `kbq-checkbox` exposes; visual styling and design tokens beyond the host classes a consumer sets; internals; deprecated APIs.
- From then on, a change that alters checkbox behaviour updates this spec through a `MODIFIED` delta.
