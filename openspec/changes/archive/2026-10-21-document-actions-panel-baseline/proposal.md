# Proposal

## Why

`openspec/specs/` holds only `select`, so a change to the actions panel has no contract to diff against. `KbqActionsPanel` is a service rather than a template component: what it promises consumers (about 900 lines of source, 975 lines of unit tests and a Playwright spec) is spread across the service, the panel reference, the configuration class, the overlay container it can render into and the MDX docs. A baseline spec of its current behaviour lets later actions panel changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `actions-panel` capability: the observable behaviour of `KbqActionsPanel` from `@koobiq/components/actions-panel` as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover opening a panel from a component or a template, the panel reference and its events, closing by code, by the close button and by Escape, `disableClose`, data and the template context, replacing an open panel, the default and the element-scoped overlay containers, the configuration options and the default configuration provider, focus, ARIA, localization and reduced motion.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `actions-panel`: the behaviour contract of the `KbqActionsPanel` service and what ships with it in `@koobiq/components/actions-panel` — `KbqActionsPanelRef`, `KbqActionsPanelConfig`, the data and configuration tokens and the locale provider — that is, what a consumer can rely on when they open a panel, fill it with content, scope it to an element and a user operates it with mouse, keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-actions-panel-baseline/` now, and `openspec/specs/actions-panel/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components, including the ones the docs examples compose inside the panel (`KbqOverflowItems`, `kbq-dropdown`, `kbqPopover`, `kbqTooltip`); the `actions-panel-overlay-container` schematic migration; deprecated APIs; visual styling and design tokens; internals of the panel container (`@docs-private` members, animation states, the CDK `Dialog` and overlay plumbing) beyond what a consumer can observe.
- From then on, a change that alters actions panel behaviour updates this spec through a `MODIFIED` delta.
