# Proposal

## Why

`openspec/specs/` holds only the select baseline, so a change to tabs has no contract to diff against. `@koobiq/components/tabs` ships two components that share a paginated, draggable header — `kbq-tab-group` and the `kbqTabNavBar` navigation — and what they promise consumers is spread across about 3,100 lines of source, 3,700 lines of unit tests, a Playwright spec and the MDX docs. A baseline spec of the current behaviour lets later tabs changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `tabs` capability: the observable behaviour of `kbq-tab-group`, `kbq-tab`, `kbqTabLabel`, `kbqTabContent`, `kbqTabNavBar`, `kbqTabLink` and `kbqTabNavPanel` as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover selection by index, by id and by function, the change events, disabled and empty tabs, labels and tooltips, lazy content, the header position, vertical and underlined layouts, keyboard and pointer interaction, pagination and drag scrolling of an overflowing strip, focus restoration, the ARIA pattern of both components, and state saving.
- Record behaviour that the docs and the code disagree on, suspected defects and tests that do not check what their name says as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `tabs`: the behaviour contract of the tab group, the tab navigation bar and the directives that ship with them in `@koobiq/components/tabs` — what a consumer can rely on when they render tabs, drive the selection from code, and a user operates them with a mouse, the keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-tabs-baseline/` now, and `openspec/specs/tabs/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (the tooltip, scrollbar, select and dropdown are covered only where tabs configure them), the deprecated `KbqVerticalTabsCssStyler`, visual styling and design tokens, and internals such as the `@docs-private` header, label wrapper and body classes beyond what a consumer observes through the group.
- From then on, a change that alters tabs behaviour updates this spec through a `MODIFIED` delta.
