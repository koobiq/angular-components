# Proposal

## Why

`openspec/specs/` has no contract for `kbq-dl`, the description list. It is a small component (about 420 lines of source and 870 lines of unit tests), but what it promises consumers is spread across the source, the stylesheet, the unit and e2e tests and the MDX page: when the list turns vertical on its own, how the term column is sized, how the column separator reacts to the pointer and the keyboard, and what `[(dtWidth)]` reports back. A baseline spec of its current behaviour lets later description list changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `dl` capability: the observable behaviour of `kbq-dl`, `kbq-dt` and `kbq-dd` as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the content model, the default, wide and vertical layouts, the automatic switch to the vertical layout and its breakpoint, item alignment, input coercion, the resizable term column (`dtWidth`, `dtMinWidth`, `ddMinWidth`, clamping, pointer drag, keyboard, double-click, cursors, direction), long text, the separator's accessibility and its localized name.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `dl`: the behaviour contract of the `kbq-dl` component and the `kbq-dt` and `kbq-dd` components that ship with it in `@koobiq/components/dl` — what a consumer can rely on when they render a description list, size its columns, and a user resizes the term column with a pointer, the keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-dl-baseline/` now, and `openspec/specs/dl/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components, including `kbqResizer` and `kbqResizable` beyond what the list exposes through its separator; the internals of the list; visual styling and design tokens beyond the layout a consumer relies on; and deprecated APIs.
- From then on, a change that alters description list behaviour updates this spec through a `MODIFIED` delta.
