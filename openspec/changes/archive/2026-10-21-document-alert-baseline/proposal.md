# Proposal

## Why

`kbq-alert` has no spec, so a later change to it has no contract to diff against. The component is small (about 180 lines of source and 280 lines of unit tests), but what it promises consumers is spread across the source, the unit and e2e tests, the MDX docs and the icon components it tints. A baseline spec of its current behaviour lets later alert changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `alert` capability: the observable behaviour of `kbq-alert` and its marker directives as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the size, style and status inputs and their host classes, the auto-tint of the projected status icon and the dev-mode warning about two icons, the content slots (icon, title, text, controls, close control), the `closed` output, the selectors and export names, and what the alert does and does not do for accessibility.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `alert`: the behaviour contract of the `kbq-alert` component and the `kbq-alert-title`, `kbq-alert-control` and `kbq-alert-close-button` directives in `@koobiq/components/alert` — what a consumer can rely on when they render an alert, fill its slots and react to its close control.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-alert-baseline/` now, and `openspec/specs/alert/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (the icon, icon item, icon button, button and link components are described only as far as the alert reacts to them), deprecated APIs, visual styling and design tokens, and internals.
- From then on, a change that alters alert behaviour updates this spec through a `MODIFIED` delta.
