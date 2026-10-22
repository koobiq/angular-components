# Proposal

## Why

`openspec/specs/` is empty, so no change has a contract to diff against. `kbq-select` is one of the largest components in the library (about 2,600 lines of source and 10,700 lines of unit tests), and what it promises consumers is spread across the source, the unit and e2e tests and the MDX docs. A baseline spec of its current behaviour lets later select changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `select` capability: the observable behaviour of `kbq-select` as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover opening and closing the panel, keyboard and mouse interaction, single and multiple selection, forms integration, how the trigger shows the value (tags, the "+N" counter, multiline mode, custom trigger and tag templates), the cleaner, "select all" and `Ctrl`/`Cmd` + `A`, search, option groups, the footer, virtual scrolling, panel sizing, accessibility and localization.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `select`: the behaviour contract of the `kbq-select` component and the directives that ship with it in `@koobiq/components/select` — what a consumer can rely on when they render a select, bind it to a form, and a user operates it with mouse, keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-select-baseline/` now, and `openspec/specs/select/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: `kbq-tree-select`, `kbq-autocomplete`, the internals of the shared option and optgroup classes beyond what a select exposes, visual styling and design tokens, and deprecated APIs.
- From then on, a change that alters select behaviour updates this spec through a `MODIFIED` delta.
