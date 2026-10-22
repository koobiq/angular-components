# Proposal

## Why

`kbq-filter-bar` is a composite of a dozen public pieces (the bar, the saved-filter menu, the add and reset controls, nine pipe types and the directive that renders them), about 5,400 lines of source and 12,500 lines of unit tests, and what it promises consumers is spread across that source, the unit and e2e tests and a long MDX page. A baseline spec of its current behaviour lets later filter-bar changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `filter-bar` capability: the observable behaviour of `@koobiq/components/filter-bar` as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the bar and its `filter` model, how pipes are rendered, cleared, removed and added, the reset control, every built-in pipe type (`readonly`, `text`, `input`, `select`, `multiselect`, `tree-select`, `multi-tree-select`, `date`, `datetime`), search, "select all", locked values, panel height, captions, the empty-options message, date and interval limits, saved filters and their save popover, state saving, localization, accessibility names and custom pipes.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `filter-bar`: the behaviour contract of `kbq-filter-bar` and the components, directives, pipes, tokens and helpers that ship with it in `@koobiq/components/filter-bar` — what a consumer can rely on when they bind a filter to the bar, render its pipes, and a user edits, saves and restores filters with a pointer, the keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-filter-bar-baseline/` now, and `openspec/specs/filter-bar/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components the bar is built from (`kbq-select`, `kbq-tree-select`, `kbq-popover`, `kbq-dropdown`, `kbq-search-expandable`, the datepicker and timepicker) beyond what a pipe exposes, the state-saving and locale machinery of `core` beyond what the bar exposes, visual styling and design tokens other than the two width properties a consumer sets, internals, and deprecated APIs (`KBQ_FILTER_BAR_CONFIGURATION`, `KBQ_FILTER_BAR_DEFAULT_CONFIGURATION`).
- From then on, a change that alters filter-bar behaviour updates this spec through a `MODIFIED` delta.
