# Proposal

## Why

`openspec/specs/` has no contract for the badge yet. `@koobiq/components/badge` is small (about 140 lines of source and 250 lines of unit tests), but what it promises consumers is spread across the source, the unit and e2e tests, the docs examples and the MDX page, and the page itself has no API section. A baseline spec of the current behaviour lets later badge changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `badge` capability: the observable behaviour of `kbq-badge` and the directives that ship with it as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the host element and its content projection, the `badgeColor` input with its color class and fallback, the `KbqBadgeColors` values, the `compact` and `outline` inputs with their host classes and boolean coercion, the caption directive, the icon spacing classes the module applies to leading and trailing icons, and what the badge does not do for accessibility.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `badge`: the behaviour contract of the `kbq-badge` component, the `kbq-badge-caption` directive and the icon spacing directive that ship in `@koobiq/components/badge` — what a consumer can rely on when they render a badge, pick its color, size and fill, and put text, a caption or icons into it.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-badge-baseline/` now, and `openspec/specs/badge/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components, including `kbq-tag`, `kbq-icon` and the tooltip shown in the docs example; deprecated APIs; visual styling and design tokens (colors, sizes, paddings, typography) beyond the host classes a consumer can style or test against; internals such as the class name constants marked `@internal`.
- From then on, a change that alters badge behaviour updates this spec through a `MODIFIED` delta.
