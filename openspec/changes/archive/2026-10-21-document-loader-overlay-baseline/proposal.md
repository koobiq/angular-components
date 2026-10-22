# Proposal

## Why

`openspec/specs/` has no contract for `kbq-loader-overlay`. The component is small (about 190 lines of source and template), but what it promises consumers is split between the source, 21 unit tests, three Playwright screenshot tests and the MDX page, and the page describes alignment modes, a default text and focus blocking that the code does not have. A baseline spec of its current behaviour lets later loader-overlay changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `loader-overlay` capability: the observable behaviour of `kbq-loader-overlay` and its three marker directives as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the default indicator, text and caption, the empty state, how the overlay covers its parent, the `surface` variants and their host classes, the projected indicator, text and caption, the sizes, accessibility, and the NgModule.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `loader-overlay`: the behaviour contract of the `kbq-loader-overlay` component and the `[kbq-loader-overlay-indicator]`, `[kbq-loader-overlay-text]` and `[kbq-loader-overlay-caption]` directives in `@koobiq/components/loader-overlay` — what a consumer can rely on when they render an overlay over a block and fill it with an indicator, text and caption.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-loader-overlay-baseline/` now, and `openspec/specs/loader-overlay/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (`kbq-progress-spinner` beyond the way the overlay configures it, `kbq-skeleton`), the `kbqDelayLoadingIndicator` operator of `core` that the docs page recommends, the deprecated `transparent` and `card` inputs, visual styling and design tokens, and internals.
- From then on, a change that alters loader-overlay behaviour updates this spec through a `MODIFIED` delta.
