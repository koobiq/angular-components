# Proposal

## Why

`openspec/specs/` has no contract for the scrollbar. `@koobiq/components/scrollbar` ships three public pieces — the `kbq-scrollbar` component, the `kbqScrollbarViewport` directive that about fifteen other components (select, dropdown, popover, modal, tabs, code block and more) and CDK virtual scroll viewport elements reuse, and the `kbqNativeScrollbar` directive — and what they promise is spread across about 1,000 lines of source, 1,700 lines of unit tests, a 740-line Playwright spec and the MDX overview. A baseline spec of the current behaviour lets later scrollbar changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `scrollbar` capability: the observable behaviour of `kbq-scrollbar`, `kbqScrollbarViewport` and `kbqNativeScrollbar` as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the display modes and their defaults, the option providers, when a bar is drawn and how it follows content changes, the viewport directive and virtual scrolling, programmatic scrolling, the scroll indicator, the browser-scrollbar directive, scroll events, pointer interaction with the bars, the track geometry and stacking, accessibility and motion.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `scrollbar`: the behaviour contract of `kbq-scrollbar`, `kbqScrollbarViewport` and `kbqNativeScrollbar` in `@koobiq/components/scrollbar` — what a consumer can rely on when they render a scrollable area with a custom or customized scrollbar, configure it, scroll it from code and a user operates it with a pointer, the keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-scrollbar-baseline/` now, and `openspec/specs/scrollbar/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components, including the ones that embed `kbqScrollbarViewport`, and `kbqOverflowShadowContainer` beyond its use on a scrollbar; the deprecated `@koobiq/components/scrollbar/deprecated` entry point; visual styling and design tokens beyond what a consumer observes as layout; and internals such as measurement scheduling, observers and private classes.
- From then on, a change that alters scrollbar behaviour updates this spec through a `MODIFIED` delta.
