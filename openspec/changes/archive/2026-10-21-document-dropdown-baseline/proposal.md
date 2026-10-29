# Proposal

## Why

`openspec/specs/` holds only the select baseline, so a dropdown change has no contract to diff against. `kbq-dropdown` is the menu that eleven other entry points build on (split button, navbar, app switcher, breadcrumbs, filter bar, tabs, list and tree among them), and its behaviour is spread across about 2,700 lines of source, 5,500 lines of unit tests, a Playwright suite and the MDX docs. A baseline spec of what it does today lets later dropdown changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `dropdown` capability: the observable behaviour of `kbq-dropdown`, `[kbqDropdownTriggerFor]` and the directives that ship with them on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover opening and closing, the `closed` reasons, focus on open and on close, keyboard and pointer interaction inside the panel, item states (disabled, progress, secondary action, links), the footer and other content directives, lazy content, nested panels and the safe area, the search field, the caret-anchored menu, positions and fallbacks, panel width, layering, tooltips and accessibility.
- Record behaviour that the docs and the code disagree on, suspected defects and tests that cannot fail as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `dropdown`: the behaviour contract of `kbq-dropdown`, the `kbqDropdownTriggerFor` trigger, `kbq-dropdown-item` and the content, footer, caption, group header, item action and search directives in `@koobiq/components/dropdown` — what a consumer can rely on when they attach a menu to a trigger and a user operates it with mouse, keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-dropdown-baseline/` now, and `openspec/specs/dropdown/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components that build on the dropdown (`kbq-split-button`, `kbq-navbar`, `kbq-app-switcher` and the rest), the shared overlay, key manager and panel-width helpers of `@koobiq/components/core` beyond what the dropdown exposes, visual styling and design tokens, internals, and deprecated APIs.
- From then on, a change that alters dropdown behaviour updates this spec through a `MODIFIED` delta.
