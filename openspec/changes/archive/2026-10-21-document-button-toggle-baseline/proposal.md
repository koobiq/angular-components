# Proposal

## Why

`openspec/specs/` has no contract for `kbq-button-toggle-group` and `kbq-button-toggle`. Their behaviour is spread across about 900 lines of source, 2,000 lines of unit tests, a Playwright spec and a short docs page, and much of it (how a value waits for its toggle, which changes reach the form, which events fire when) is visible only in the source. A baseline spec of the current behaviour lets later button-toggle changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `button-toggle` capability: the observable behaviour of `kbq-button-toggle-group` and `kbq-button-toggle` as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover single and multiple selection, the standalone toggle, the group value and how it maps to toggles, the `change` and `valueChange` events, Angular forms integration, disabled toggles and groups, the vertical and stretched layouts, the hit area between toggles, content slots, label truncation and its tooltip, and accessibility: roles and states, the roving tab stop, arrow-key navigation, accessible names and the development-mode warning.
- Record behaviour that the docs and the code disagree on, suspected defects and tests that cannot fail as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `button-toggle`: the behaviour contract of `kbq-button-toggle-group` and `kbq-button-toggle` in `@koobiq/components/button-toggle` — what a consumer can rely on when they render a group or a standalone toggle, bind it to a form, and a user operates it with a pointer, the keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-button-toggle-baseline/` now, and `openspec/specs/button-toggle/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components, including `kbq-button` and `kbq-button-group` beyond what a toggle exposes through them; deprecated APIs; visual styling and design tokens; internals such as the group–toggle synchronization methods.
- The component renders no locale strings of its own, so there is no localization requirement.
- From then on, a change that alters button-toggle behaviour updates this spec through a `MODIFIED` delta.
