# Proposal

## Why

`openspec/specs/` has no contract for the list. `@koobiq/components/list` ships a selectable listbox, `kbq-list-selection` with `kbq-list-option` (about 2,200 lines of source and 4,800 lines of unit tests), plus the plain `kbq-list` container, and what they promise consumers is spread across the source, the unit and e2e tests and the MDX docs. A baseline spec of the current behaviour lets later list changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `list` capability: the observable behaviour of `kbq-list-selection`, `kbq-list-option`, `kbq-list-option-caption`, `kbq-list` and `kbq-list-item` as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover mouse and keyboard selection, the `autoSelect` and `noUnselectLast` rules, the selection modes and changing them at runtime, the value and forms integration, `compareWith`, disabled state, focus and the tab stop, typeahead, the "select all" row and `Ctrl`/`Cmd` + `A`, copying, groups, the horizontal layout, the option action button, virtual scrolling, drag and drop, accessibility and localization.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `list`: the behaviour contract of the components and directives in `@koobiq/components/list` — what a consumer can rely on when they render a selectable list, bind it to a form, reorder its options by dragging, and a user operates it with mouse, keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-list-baseline/` now, and `openspec/specs/list/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (`kbq-tree-selection`, `kbq-select`, `kbq-file-upload`), the internals of the shared `kbq-optgroup`, `kbq-option-action`, pseudo-checkbox and key manager beyond what a list exposes, visual styling and design tokens, and deprecated APIs.
- From then on, a change that alters list behaviour updates this spec through a `MODIFIED` delta.
