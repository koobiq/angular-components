# Proposal

## Why

`kbq-timezone-select` extends `kbq-select`, and what it adds — the zone option with its offset and city list, the overflow tooltip, the rejection of multiple selection, the localized search placeholder and the grouping and formatting helpers — is spread across about 850 lines of source, 2,000 lines of unit tests, a Playwright spec and the MDX docs. Only `select` has a baseline spec so far. A baseline of the timezone entry point lets later timezone changes be written as `MODIFIED` deltas against a known contract, and keeps the inherited select behaviour pointing at the `select` spec instead of being restated.

## What Changes

- Add the `timezone` capability: the observable behaviour of `@koobiq/components/timezone` as it ships on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover the select as a single-selection `kbq-select` (what it inherits, what it rejects, what differs in its trigger and panel), the timezone option (value, offset label, city list, highlight, typeahead label), the overflow tooltip, the search placeholder and the other localized strings, and the exported helpers for offsets, sorting, grouping and city filtering.
- Record behaviour that the docs and the code disagree on, suspected defects and tests that cannot fail as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `timezone`: the behaviour contract of `kbq-timezone-select`, `kbq-timezone-option`, the `KbqTimezoneOptionTooltip` and `kbq-timezone-select-trigger` directives, the `utcOffset` and `citiesByFilter` pipes and the zone helpers exported from `@koobiq/components/timezone` — what a consumer can rely on when they build a zone list, render it in a form and a user operates it.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-timezone-baseline/` now, and `openspec/specs/timezone/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components (`kbq-select` itself is covered by the `select` spec, which this one refers to for inherited behaviour), deprecated APIs, visual styling and design tokens, and internals such as the hidden-items measurer, the private placeholder bookkeeping and the tooltip's resize and content observers.
- From then on, a change that alters timezone behaviour updates this spec through a `MODIFIED` delta.
