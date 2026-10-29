# Proposal

## Why

`openspec/specs/` has no contract for `kbqEllipsisCenter`. The directive is small (one source file of about 250 lines), but what it promises is spread across the source, its stylesheet, the unit and Playwright specs, the tooltip trigger it extends, and the file upload and breadcrumbs that rely on it. A baseline spec of its current behaviour lets later changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `ellipsis-center` capability: the observable behaviour of the `kbqEllipsisCenter` directive as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover how the text is rendered into two halves, when and where it is split, `minVisibleLength` and `charWidth`, re-splitting on text changes and resizes, the layout rules the directive loads itself, and the tooltip that spells out the full text.
- Record behaviour that the docs and the code disagree on, or that no test covers, as findings in `design.md` instead of fixing it here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `ellipsis-center`: the behaviour contract of `KbqEllipsisCenterDirective` and `KbqEllipsisCenterModule` from `@koobiq/components/ellipsis-center` — what a consumer can rely on when they put `kbqEllipsisCenter` on an element of limited width and a user reads, hovers or resizes it.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-ellipsis-center-baseline/` now, and `openspec/specs/ellipsis-center/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components, including the file upload and breadcrumbs that use the directive; the tooltip behaviour the directive inherits unchanged from `KbqTooltipTrigger` (delays, placement, triggers, `Escape`), which belongs to the tooltip; visual styling and design tokens; internals such as private members and timers; deprecated APIs.
- From then on, a change that alters the behaviour of the directive updates this spec through a `MODIFIED` delta.
