# Proposal

## Why

`openspec/specs/` has no contract for `kbqTextarea`. The directive is small (about 400 lines), but what it promises consumers is spread across its source, the unit and e2e tests, the form-field specs that cover it (autofill, trimming) and two short MDX pages. A baseline spec of its current behaviour lets later textarea changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `textarea` capability: the observable behaviour of `textarea[kbqTextarea]` as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the auto-growing height, `maxRows` and `freeRowsHeight`, the resizable mode, the value and how it reaches Angular forms, trimming, the disabled and required states, the error state and its matchers, placeholder and id, focus, autofill, the host classes and the ARIA attributes.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `textarea`: the behaviour contract of the `kbqTextarea` directive and `KbqTextareaModule` in `@koobiq/components/textarea` — what a consumer can rely on when they put the directive on a `<textarea>`, bind it to a form, place it in a `kbq-form-field`, and a user types into it.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-textarea-baseline/` now, and `openspec/specs/textarea/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components, including `kbq-form-field` beyond what it does with a textarea inside it, `kbqInput` and `kbq-inline-edit`; deprecated APIs; visual styling and design tokens; internals such as the measuring algorithm and change-detection timing.
- From then on, a change that alters textarea behaviour updates this spec through a `MODIFIED` delta.
