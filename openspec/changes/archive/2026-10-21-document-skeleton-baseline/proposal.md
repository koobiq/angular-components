# Proposal

## Why

`openspec/specs/` has no contract for the skeleton yet. `@koobiq/components/skeleton` ships the `kbqSkeleton` directive and fourteen presets (about 700 lines of source and 900 lines of unit tests), and what they promise consumers is spread across the source, the unit and e2e tests and the MDX docs. A baseline spec of the current behaviour lets later skeleton changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `skeleton` capability: the observable behaviour of the `kbqSkeleton` directive and its presets as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the `kbq-skeleton` element and the `kbqSkeleton` directive (turning a skeleton on and off, `inert`, how the host is painted, the border radius fallback, the wave, reduced motion and the pause outside the viewport), the element presets (button, badge, tag, icon, link), the layout presets (typography, group, description list, table, form field, accordion, checkable, tabs, tree), how the presets read their counts, and the global presets configuration.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `skeleton`: the behaviour contract of the `kbqSkeleton` directive, the `kbq-skeleton` element and the presets that ship with them in `@koobiq/components/skeleton` — what a consumer can rely on when they render a placeholder while data loads and swap it for the real content.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-skeleton-baseline/` now, and `openspec/specs/skeleton/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: the components the presets stand in for (button, badge, tag, table, form field, accordion, tabs, tree and the rest), deprecated APIs, visual styling and design tokens beyond the sizes the presets promise, and internals such as the shared wave service and the style loader.
- From then on, a change that alters skeleton behaviour updates this spec through a `MODIFIED` delta.
