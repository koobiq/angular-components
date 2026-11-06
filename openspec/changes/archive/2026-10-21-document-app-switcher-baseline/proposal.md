# Proposal

## Why

`openspec/specs/` has no contract for the app switcher, so a change to it has nothing to diff against. What `[kbqAppSwitcher]` promises consumers is spread over about 1,600 lines of source, 2,500 lines of unit tests, a Playwright spec and a short docs page, and part of it lives in the dropdown and pop-up code it builds on. A baseline spec of its current behaviour lets later app-switcher changes be written as `MODIFIED` deltas against a known contract.

## What Changes

- Add the `app-switcher` capability: the observable behaviour of the app switcher as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover opening and closing the popup, the trigger's inputs, outputs and host classes, how sites and applications are listed (rows, icons, links, the selected application), grouping by type, the multi-site layout and its flyout panels, search, keyboard and pointer interaction, accessibility, the tooltip on the same trigger and localization.
- Record behaviour that the docs, the JSDoc and the code disagree on, suspected defects and tests that cannot fail as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `app-switcher`: the behaviour contract of the `[kbqAppSwitcher]` trigger directive and the popup it opens from `@koobiq/components/app-switcher`, including the exported grouping helpers and the inline icon sanitizer — what a consumer can rely on when they bind sites and applications to it and a user operates it with a pointer, the keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-app-switcher-baseline/` now, and `openspec/specs/app-switcher/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (`kbq-dropdown`, `kbq-tooltip`, `kbq-form-field` and the pop-up base classes beyond what the app switcher exposes), deprecated APIs (`KBQ_APP_SWITCHER_CONFIGURATION`, `KBQ_APP_SWITCHER_DEFAULT_CONFIGURATION`), visual styling and design tokens, and internals such as the row components, the key manager and change-detection details.
- From then on, a change that alters app-switcher behaviour updates this spec through a `MODIFIED` delta.
