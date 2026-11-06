# Proposal

## Why

`openspec/specs/` holds only the `select` baseline, so a change to clamped text has no contract to diff against. The `@koobiq/components/clamped-text` entry point ships two containers, `kbq-clamped-text` and `[kbqClampedList]`, that share one disclosure trigger, one locale section and the `KbqClampedRoot` contract. What they promise consumers is spread across about 370 lines of source, 560 lines of unit tests, a Playwright spec and two MDX pages, and part of it rests on layout measurement that the unit tests can only mock. A baseline spec of the current behaviour lets later changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `clamped-text` capability: the observable behaviour of the `@koobiq/components/clamped-text` entry point as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover clamping text to `rows` lines and the "one hidden line is shown" rule, measurement and re-measurement on resize, the collapsed state and its two-way binding, the built-in toggle, scrolling on collapse, the clamped list's visible slice and threshold, the `kbqClampedListTrigger` disclosure semantics and keyboard, localization and the NgModule.
- Record behaviour that the docs and the code disagree on, suspected defects and gaps in the tests as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `clamped-text`: the behaviour contract of `kbq-clamped-text`, `[kbqClampedList]` and `[kbqClampedListTrigger]` from `@koobiq/components/clamped-text` — what a consumer can rely on when they clamp text or a list, bind its collapsed state, and a user expands or collapses it with a pointer, the keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-clamped-text-baseline/` now, and `openspec/specs/clamped-text/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (including `kbq-link` and `kbq-icon` beyond what the toggle shows), `overflow-items` and its clamped-list example, the `clamped-text-disclosure` migration, visual styling and design tokens, internals, and deprecated APIs.
- From then on, a change that alters clamped text or clamped list behaviour updates this spec through a `MODIFIED` delta.
