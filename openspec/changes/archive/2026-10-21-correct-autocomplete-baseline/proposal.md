# Proposal

## Why

The baseline spec of `autocomplete` states behaviour the code does not have. A static audit of `openspec/specs/autocomplete/spec.md` against `packages/components/autocomplete/` and the `core` helpers it uses found seven requirements whose text, or one of whose scenarios, the source contradicts, so the spec cannot yet serve as the contract later changes are diffed against.

## What Changes

- **Scroll strategy**: the default strategy repositions the panel only when the page or a CDK scrollable (`cdkScrollable`, `kbqScrollbarViewport`) scrolls, not when any element outside the panel does.
- **Selected state of options**: the other options are not always left untouched; after a choice made with Enter while `autoActiveFirstOption` is on, the first enabled option can end up selected as well. The scenario now chooses with the pointer.
- **Values written by the form**: `displayWith` also receives `null` and `undefined`, so they leave the field empty only when no `displayWith` is set or it returns `null` or `undefined` for them.
- **Active option stays in view**: arrow keys scroll the list only for the panel bound when the field's view is first rendered; a panel bound later is not scrolled.
- **Panel anchored to the caret**: without a text selection, as in an `email` input, the panel falls back to the box of its field-anchored origin, such as the `kbq-form-field` container, not to the field's own box.
- **Text mode query is the word before the caret**: with `kbqAutocompleteMinLength` set to 0, an empty query starts after whitespace.
- **Trigger characters start a query**: only the last occurrence of each trigger before the caret is considered, so a trigger repeated inside the query, as in "/docs/api", ends it.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `autocomplete`: the seven requirements above are corrected to describe the shipped behaviour.

## Impact

- Files: only `openspec/changes/correct-autocomplete-baseline/` now, and `openspec/specs/autocomplete/spec.md` once the change is archived.
- Code, public API, tests and docs: unchanged.
