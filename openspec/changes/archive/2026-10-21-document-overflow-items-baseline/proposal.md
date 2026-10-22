# Proposal

## Why

`openspec/specs/` has no contract for `@koobiq/components/overflow-items`, yet the directive set decides which items of a row or column stay visible in `kbq-breadcrumbs`, in top-bar layouts and in consumer layouts. What it promises is spread across about 370 lines of source, 620 lines of unit tests, 400 lines of Playwright tests and the MDX docs, and much of it (how sizes are measured, what triggers a recalculation, what the hidden state looks like in the DOM) is written down nowhere. A baseline spec of the current behaviour lets later changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `overflow-items` capability: the observable behaviour of `kbqOverflowItems`, `kbqOverflowItem` and `kbqOverflowItemsResult` as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the directives and their template references, the layout the container imposes, how overflow is measured, the hidden state of items and of the result, the set of hidden IDs and the `changes` output, the hiding direction, `order`, `alwaysVisible`, alignment, vertical orientation, wrap mode, what triggers a recalculation, debouncing, the resize targets, manual `hide()` / `show()`, and the state before the first recalculation and on the server.
- Record behaviour that the docs and the code disagree on, suspected defects and weak tests as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, examples, styles or the public API.

## Capabilities

### New Capabilities

- `overflow-items`: the behaviour contract of the `kbqOverflowItems` container directive and the `kbqOverflowItem` and `kbqOverflowItemsResult` directives that ship with it in `@koobiq/components/overflow-items` — what a consumer can rely on when they lay out items in a container that hides the ones that do not fit and shows a result element in their place.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-overflow-items-baseline/` now, and `openspec/specs/overflow-items/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: the components built on top of it (`kbq-breadcrumbs`, `kbq-top-bar` and others), visual styling and design tokens, the internals of the directives (private members, the measuring helpers, RxJS wiring) beyond what a consumer observes, and deprecated APIs (the entry point has none).
- From then on, a change that alters overflow-items behaviour updates this spec through a `MODIFIED` delta.
