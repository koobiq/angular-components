# Proposal

## Why

`openspec/specs/` has no contract for `kbq-toggle`, so a change to it has nothing to diff against. The toggle is small (about 300 lines of source), but what it promises consumers is split between the component, the shared checkable behaviour in `@koobiq/components/core`, the unit and e2e tests and the MDX docs. A baseline spec of its current behaviour lets later toggle changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `toggle` capability: the observable behaviour of `kbq-toggle` as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the checked, disabled, indeterminate and loading states, the `change` and `indeterminateChange` events, pointer and keyboard interaction, the click actions, forms integration, the label, hint and label position, the `big` and `color` inputs, ids, tab order, accessibility and motion.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `toggle`: the behaviour contract of the `kbq-toggle` component in `@koobiq/components/toggle` — what a consumer can rely on when they render a toggle, bind it to a form, and a user operates it with a pointer, the keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-toggle-baseline/` now, and `openspec/specs/toggle/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (`kbq-checkbox` and `kbq-button-toggle` included), the internals of the shared checkable behaviour beyond what a toggle exposes, visual styling and design tokens, and deprecated APIs such as `onLabelTextChange()`.
- From then on, a change that alters toggle behaviour updates this spec through a `MODIFIED` delta.
