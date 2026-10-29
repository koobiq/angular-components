# Proposal

## Why

`openspec/specs/` holds only the `select` contract, so a change to `kbq-table` has nothing to diff against. The table is small (one component of about 90 lines and three inputs), but almost everything it promises lives in its styles: which rows get a line, which rows highlight on hover, which cells stay pinned and how focused controls are kept clear of a pinned header. That contract is spread across the source, the unit and e2e tests, a screenshot baseline and the MDX docs. A baseline spec of its current behaviour lets later table changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `table` capability: the observable behaviour of `table[kbq-table]` as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover where the component applies, its native semantics, the three inputs and the classes they toggle, how cells wrap and align, the header line, cells that hold a button, `border`, the hover highlight and `disableHover`, and `stickyHeader` with the published header height and the scroll margin that keeps focused controls out from under the header.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `table`: the behaviour contract of the `KbqTable` component and `KbqTableModule` in `@koobiq/components/table` — what a consumer can rely on when they put `kbq-table` on a native `<table>`, set its options and a user reads it, hovers its rows or moves focus through the controls inside it.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-table-baseline/` now, and `openspec/specs/table/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (the buttons and controls placed in cells, `kbq-skeleton` table rows), deprecated APIs, visual styling and design tokens beyond the ones a consumer sets, and internals.
- From then on, a change that alters table behaviour updates this spec through a `MODIFIED` delta.
