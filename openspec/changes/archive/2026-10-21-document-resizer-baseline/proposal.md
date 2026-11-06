# Proposal

## Why

`@koobiq/components/resizer` is small (about 320 lines of source), but `kbq-splitter`, `kbq-content-panel` and the column resizing of `kbq-dl` are built on it, and what it promises them is spread across the source, the unit spec and two short MDX pages. A baseline spec of its current behaviour lets later resizer changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `resizer` capability: the observable behaviour of the `kbqResizable` and `kbqResizer` directives as they ship on `main` today, written as requirements with scenarios that the existing unit tests already exercise or that can be checked by hand.
- Cover the container and handle pairing, the resize direction, the handle cursor and its override, how a pointer drag starts, follows the pointer and ends, the starting size and its box model, the `resizeStart` and `sizeChange` outputs, the document cursor during a drag, `disableSizeUpdate`, and what the directives leave to the consumer (keyboard, ARIA, styles).
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `resizer`: the behaviour contract of the `kbqResizable` and `kbqResizer` directives and `KbqResizerModule` in `@koobiq/components/resizer` — what a consumer can rely on when they mark an element as resizable, add drag handles to it and a user drags them with a pointer.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-resizer-baseline/` now, and `openspec/specs/resizer/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: the components built on the resizer (`kbq-splitter`, `kbq-content-panel`, `kbq-dl`) and their keyboard and double-click handling, other components, deprecated APIs, visual styling and design tokens, and internals of the directives.
- From then on, a change that alters resizer behaviour updates this spec through a `MODIFIED` delta.
