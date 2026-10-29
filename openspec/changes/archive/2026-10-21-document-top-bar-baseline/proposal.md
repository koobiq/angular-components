# Proposal

## Why

`openspec/specs/` holds no contract for `kbq-top-bar` yet. The component is small (one component and two directives in under 100 lines of TypeScript), but most of what it promises consumers lives outside that code: in its stylesheet and custom properties, in the overlay layering it takes part in, and in the accessibility guidance of the MDX pages. A baseline spec of its current behaviour lets later top bar changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `top-bar` capability: the observable behaviour of `kbq-top-bar`, `[kbqTopBarContainer]` and `[kbqTopBarSpacer]` as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the structure of the bar and its slots, the row layout, the spacer's clearance and the start container's minimum width, the spacing of overflowing actions, sticky positioning, layering against overlays, the shadow and its motion, where the custom properties are read, and accessibility.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `top-bar`: the behaviour contract of `kbq-top-bar` and the directives that ship with it in `@koobiq/components/top-bar` — what a consumer can rely on when they lay out a page or panel header with it, make it stick, open panels from it and expose it to assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-top-bar-baseline/` now, and `openspec/specs/top-bar/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (breadcrumbs, overflow items, dropdown, navbar) beyond how the bar treats them, the internals of the overlay layer registry, visual styling and the design tokens that only change appearance (background, padding, radius, typography, shadow color), and deprecated APIs.
- From then on, a change that alters top bar behaviour updates this spec through a `MODIFIED` delta.
