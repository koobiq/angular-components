# Proposal

## Why

The baseline spec of `table` states behaviour the code does not have. A static audit of `openspec/specs/table/spec.md` against `packages/components/table` on `c9c196a9b` found two requirements that tie the published header height to whatever `<thead>` the table has, while the table only looks for its `<thead>` when `stickyHeader` turns on or the table first renders; this change corrects them so the spec describes what ships.

## What Changes

- **The pinned header publishes its height**: the table observes the `<thead>` it has when `stickyHeader` turns on, or when it first renders with `stickyHeader` on; a `<thead>` added, removed or replaced later is not followed until `stickyHeader` turns off and on again.
- **The height is published only while the header is pinned**: "without a `<thead>`" holds only for a table that has none at that moment; removing the `<thead>` while `stickyHeader` stays on neither removes the property nor stops the observation.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `table`: corrects the requirements "The pinned header publishes its height" and "The height is published only while the header is pinned".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-table-baseline/` and, once archived, `openspec/specs/table/spec.md`. No source, test, documentation or public API changes.
