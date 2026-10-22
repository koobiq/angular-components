# Proposal

## Why

`openspec/specs/` has no accordion capability, so no accordion change has a contract to diff against. `kbq-accordion` is about 1,250 lines of source across five building blocks and is covered by about 3,000 lines of unit tests, and what it promises consumers — expansion rules, keyboard handling, the ARIA wiring between trigger, heading and region, and state saving — is spread across the source, the unit and e2e tests and the MDX docs. A baseline spec of its current behaviour lets later accordion changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `accordion` capability: the observable behaviour of `kbq-accordion` and its parts as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the building blocks and their host classes and data attributes, single and multiple expansion, `collapsible`, disabled items and accordions, the controlled and default value, the item's `expanded` and its events, `openAll()` and `closeAll()`, keyboard navigation in both orientations and in right-to-left layout, interactive controls next to the trigger and inside the content, nested accordions, accessibility (button, heading and region semantics, `inert` content, heading level), the expand and collapse motion, and state saving.
- Record behaviour that the docs and the code disagree on, suspected defects and tests that cannot fail as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `accordion`: the behaviour contract of `kbq-accordion`, `kbq-accordion-item`, `kbq-accordion-header`, `kbq-accordion-trigger` and `kbq-accordion-content` from `@koobiq/components/accordion` — what a consumer can rely on when they render an accordion, drive it from code or bind its value, and a user operates it with mouse, keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-accordion-baseline/` now, and `openspec/specs/accordion/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components, the internals of the shared state-saving store beyond what the accordion exposes (storage format, expiry, key derivation rules), visual styling and design tokens, members marked `@docs-private`, and deprecated APIs.
- From then on, a change that alters accordion behaviour updates this spec through a `MODIFIED` delta.
