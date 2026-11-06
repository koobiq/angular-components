# Proposal

## Why

`openspec/specs/` holds no contract for `kbq-search-expandable`. The component is small (about 560 lines of source and 1,300 lines of unit tests), but most of what it promises consumers is timing and state between the field, the bound form control and focus: when a typed query reaches the model, when the field expands on its own, what collapsing does to the value and where focus goes. That knowledge is spread across the source, the unit and e2e tests and a nine-line docs page. A baseline spec of its current behaviour lets later search-expandable changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `search-expandable` capability: the observable behaviour of `kbq-search-expandable` as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the forms requirement, the collapsed and expanded states and how they switch (button, close button, Escape, `toggle()`, `[isOpened]`), the `isOpenedChange` output, focus hand-offs, how the typed value reaches the bound control (debounce, `emitValueTimeout`, `isEmitValueByEnterEnabled`), programmatic writes and the auto-expand they trigger, the `value` signal, touched and error state, the disabled state, `tabIndex`, the tooltip, accessible names, localization and the exported constants.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `search-expandable`: the behaviour contract of the `kbq-search-expandable` component in `@koobiq/components/search-expandable` — what a consumer can rely on when they bind it to a form, expand and collapse it, and a user types into it with a pointer, the keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-search-expandable-baseline/` now, and `openspec/specs/search-expandable/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (including `kbq-filter-bar`, which projects the search into its right slot), the deprecated `KBQ_SEARCH_EXPANDABLE_CONFIGURATION` and `KBQ_SEARCH_EXPANDABLE_DEFAULT_CONFIGURATION` tokens, visual styling and design tokens, and internals such as the focus-monitor wiring and the private control that backs the input.
- From then on, a change that alters search-expandable behaviour updates this spec through a `MODIFIED` delta.
