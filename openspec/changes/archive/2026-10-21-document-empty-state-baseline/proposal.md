# Proposal

## Why

`kbq-empty-state` has no spec, so a later change to it has no contract to diff against. The component is small (about 180 lines of source and 380 lines of unit tests), but what it promises consumers is spread across the source, its stylesheets, the unit and e2e tests and the MDX docs: four content slots, three inputs, the host classes they set and the error tint that reaches an icon in the illustration slot. A baseline spec of its current behaviour lets later empty-state changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `empty-state` capability: the observable behaviour of `kbq-empty-state` and its slot directives as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the content slots and their order, content that is not projected, the host and slot classes, `size`, `alignTop` and the layout it depends on, the optical compensation for an illustration, `errorColor` and the tint of a `kbq-icon-item`, the title, accessibility and the NgModule.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `empty-state`: the behaviour contract of `kbq-empty-state` and the `kbq-empty-state-icon`, `kbq-empty-state-title`, `kbq-empty-state-text` and `kbq-empty-state-actions` directives in `@koobiq/components/empty-state` — what a consumer can rely on when they place content in the slots and set the inputs.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-empty-state-baseline/` now, and `openspec/specs/empty-state/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components, including `kbq-icon-item` beyond what the empty state does to it; deprecated APIs; visual styling and design tokens beyond the layout a consumer relies on; internals such as the injection token the slots use.
- From then on, a change that alters empty-state behaviour updates this spec through a `MODIFIED` delta.
