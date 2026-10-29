# Proposal

## Why

`@koobiq/components/icon` is used by almost every other component, and what it promises consumers is spread across three components, an SVG registry with four ways to configure it, the unit and e2e tests and three MDX pages. A baseline spec of its current behaviour lets later icon changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `icon` capability: the observable behaviour of `kbq-icon`, `kbq-icon-button`, `kbq-icon-item` and `KbqIconRegistry` as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the font class, the size taken from the name, color and the error color, inline SVG resolution and its fallback to the font class, the registry (literals, URLs, sprites, resolvers, the dictionary, namespaces, errors), accessibility defaults, and the size, tab order, disabled state and button semantics of the icon button and the variants of the icon item.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `icon`: the behaviour contract of the `kbq-icon`, `kbq-icon-button` and `kbq-icon-item` components and of the icon registry and its providers in `@koobiq/components/icon` — what a consumer can rely on when they render an icon, configure SVG icons, and a user operates an icon button with mouse, keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-icon-baseline/` now, and `openspec/specs/icon/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: the components that embed icons (form field, tags, buttons, alert, empty state and the rest), the `@koobiq/icons` package and its glyphs, visual styling and design tokens (colors, paddings, the rotate and flip utility classes), internals of the registry and the change-detection details of the icon, and deprecated APIs.
- From then on, a change that alters icon behaviour updates this spec through a `MODIFIED` delta.
