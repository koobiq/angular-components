# Proposal

## Why

`openspec/specs/` has no contract for `kbq-autocomplete`. The component is small in templates but large in behaviour: about 1,500 lines of source, 4,600 lines of unit tests and a Playwright suite cover a field-level panel, forms integration, a caret-anchored panel, a text mode with trigger characters and an inline hint. What it promises consumers is spread across the source, the tests and the MDX docs. A baseline spec of its current behaviour lets later autocomplete changes be written as `MODIFIED` deltas against a known contract instead of rediscovering it each time.

## What Changes

- Add the `autocomplete` capability: the observable behaviour of `kbq-autocomplete`, the `kbqAutocomplete` trigger, `kbqAutocompleteOrigin` and the footer as they ship on `main` today, written as requirements with scenarios that the existing tests already exercise or that can be checked by hand.
- Cover opening and closing the panel, choosing an option, forms integration, the active option, keyboard and pointer interaction, the caret-anchored panel, text mode with trigger characters and the inline hint, panel width and position, the footer, the scrollbar and accessibility.
- Record behaviour that the docs and the code disagree on, suspected defects and tests that cannot fail as findings in `design.md` instead of fixing them here.
- No change to source, tests, docs, styles or the public API.

## Capabilities

### New Capabilities

- `autocomplete`: the behaviour contract of `@koobiq/components/autocomplete` — what a consumer can rely on when they bind a panel to an input or a textarea, connect it to a form, and a user operates it with the mouse, the keyboard or assistive technology.

### Modified Capabilities

None.

## Impact

- Files: only `openspec/changes/document-autocomplete-baseline/` now, and `openspec/specs/autocomplete/spec.md` once the change is archived.
- Code, public API, dependencies, tests and docs: unchanged.
- Out of scope: other components, including `kbq-select`, `kbq-tag-input` and `kbq-tooltip` beyond the members the autocomplete exposes to them; the internals of the shared option, optgroup, key manager, caret and text-mirror helpers in `core` beyond what an autocomplete exposes; visual styling and design tokens; deprecated APIs.
- From then on, a change that alters autocomplete behaviour updates this spec through a `MODIFIED` delta.
