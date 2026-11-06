# Proposal

## Why

`openspec/specs/` holds only the `select` baseline, so a change to the tree still has no contract to diff against. `@koobiq/components/tree` is a large entry point (about 4,100 lines of source and 6,600 lines of unit tests, plus a Playwright spec), and what it promises consumers is spread across the source, the unit and e2e tests and the MDX docs. A baseline spec of its current behaviour lets later tree changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `tree` capability: the observable behaviour of `kbq-tree-selection`, `kbq-tree-option`, `kbq-tree`, `kbq-tree-node`, the toggle and padding directives, the tree controls, the flattener and the data sources as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover rendering from a data source and node definitions, expanding and collapsing, text filtering and filter pipelines, the selection modes and how a pointer and the keyboard change the selection, checkboxes and the tri-state roll-up, "select all" and `Ctrl`/`Cmd` + `A`, forms integration and values written ahead of their data, option action buttons, state saving of the expansion, focus and keyboard navigation, accessibility and localization.
- Record behaviour that the docs and the code disagree on, suspected defects and tests that cannot fail as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `tree`: the behaviour contract of the `@koobiq/components/tree` entry point — what a consumer can rely on when they render a tree from a data source and a tree control, bind its selection to a form, and a user operates it with a pointer, the keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-tree-baseline/` now, and `openspec/specs/tree/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (`kbq-tree-select`, `kbq-list`, `kbq-select`), the members that exist only for an embedding `kbq-tree-select`, deprecated APIs (`KbqTreeNode.mostRecentTreeNode`, the `onSelectAll`, `onCopy` and `onSelectionChange` aliases beyond their being emitted), visual styling and design tokens, and internals.
- From then on, a change that alters tree behaviour updates this spec through a `MODIFIED` delta.
