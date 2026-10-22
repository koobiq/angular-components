# Proposal

## Why

`openspec/specs/` has no contract for `kbq-breadcrumbs`. What the trail promises consumers — which items it shows, how it collapses them behind the expand button, how focus moves through it and what it exposes to assistive technology — is spread across the source, the unit and e2e tests, the overflow-items and button entry points it builds on, and the MDX docs. A baseline spec of its current behaviour lets later breadcrumbs changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `breadcrumbs` capability: the observable behaviour of `kbq-breadcrumbs` and the pieces that ship with it in `@koobiq/components/breadcrumbs` (`kbq-breadcrumb-item`, `kbqBreadcrumbView`, `kbqBreadcrumbsSeparator`, `kbqBreadcrumb`), as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover rendering and routing of the items, the current-page item, sizes, custom item templates and separators, the breadcrumb button directive, collapsing by width and by `max`, the expand button and its dropdown, the disabled state, the wrap modes, the first-item offset, the tooltip of a clipped item, the landmark and list semantics, keyboard and pointer focus, forms, the global configuration and localization.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `breadcrumbs`: the behaviour contract of `kbq-breadcrumbs` and the directives and components that ship with it in `@koobiq/components/breadcrumbs` — what a consumer can rely on when they render a trail, route its items, customize them, and a user operates it with a pointer, the keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-breadcrumbs-baseline/` now, and `openspec/specs/breadcrumbs/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (`kbq-dropdown`, `kbq-button`, `kbqOverflowItems` and `kbq-title` beyond what a trail exposes through them), the roving-focus directives used on their own outside a trail, deprecated APIs, visual styling and design tokens, and internals.
- From then on, a change that alters breadcrumbs behaviour updates this spec through a `MODIFIED` delta.
