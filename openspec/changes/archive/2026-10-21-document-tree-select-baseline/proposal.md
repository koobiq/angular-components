# Proposal

## Why

`openspec/specs/` has no `tree-select` capability, so a change to `kbq-tree-select` has no contract to diff against. The tree-select is a large component (about 2,000 lines of source, 7,100 lines of unit tests and 850 lines of Playwright specs), and what it promises consumers is spread across its own source, the embedded `kbq-tree-selection`, the shared select code in `core`, the tests and the MDX docs. A baseline spec of its current behaviour lets later tree-select changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `tree-select` capability: the observable behaviour of `kbq-tree-select` as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover opening and closing the panel, keyboard and pointer interaction on the closed control and in the open tree, single and multiple selection, forms integration and values written ahead of their data, how the trigger shows the value (tags, the "+N" counter, multiline mode, custom trigger, matcher and tag templates), the cleaner and `clearPredicate`, "select all" and `Ctrl`/`Cmd` + `A`, search, the footer and the empty states, panel sizing and position, accessibility and localization.
- Record behaviour that the docs and the code disagree on, suspected defects and tests that cannot fail as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `tree-select`: the behaviour contract of the `kbq-tree-select` component in `@koobiq/components/tree-select`, together with the parts of the projected `kbq-tree-selection` it drives — what a consumer can rely on when they render a tree-select, bind it to a form, and a user operates it with a pointer, the keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-tree-select-baseline/` now, and `openspec/specs/tree-select/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (`kbq-select`, a standalone `kbq-tree-selection`, `kbq-autocomplete`), the tree's own data source, flattener and filter algorithms beyond what the tree-select exposes, visual styling and design tokens, internals, and deprecated APIs.
- From then on, a change that alters tree-select behaviour updates this spec through a `MODIFIED` delta.
