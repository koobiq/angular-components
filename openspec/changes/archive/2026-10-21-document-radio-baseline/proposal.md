# Proposal

## Why

`openspec/specs/` has no contract for `@koobiq/components/radio`. What `kbq-radio-group` and `kbq-radio-button` promise consumers is spread across about 700 lines of source, a 1,100-line unit suite, a Playwright spec and the MDX docs, and part of it — keyboard interaction, tab stops, native form submission — is left to the browser. A baseline spec of the current behaviour lets later radio changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `radio` capability: the observable behaviour of `kbq-radio-group` and `kbq-radio-button` as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover size and label position, the error color, option content and hints, selection by pointer and keyboard, the group value and the selected button, change events, buttons used outside a group, names and native form submission, Angular forms integration, the disabled and required states, focus, and accessibility.
- Record behaviour that the docs and the code disagree on, suspected defects and tests that cannot fail as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `radio`: the behaviour contract of the `kbq-radio-group` directive and the `kbq-radio-button` component in `@koobiq/components/radio` — what a consumer can rely on when they render a group or a standalone button, bind it to a form, and a user operates it with mouse, keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-radio-baseline/` now, and `openspec/specs/radio/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (`kbq-checkbox`, `kbq-button-toggle`, `kbq-toggle`, `kbq-form-field` beyond the `kbq-hint` a button projects), deprecated APIs, visual styling and design tokens, and internals such as change-detection details and private members.
- From then on, a change that alters radio behaviour updates this spec through a `MODIFIED` delta.
