# Proposal

## Why

The baseline spec of `timezone` states behaviour the code does not have. A static audit of `openspec/specs/timezone/spec.md` against `packages/components/timezone` and the `select`, `core`, `form-field` and `icon` pieces it relies on found eight requirements whose text the source contradicts, so the contract would mislead the next change written against it.

## What Changes

- **Pointer opens and closes the panel**: a click on the trigger of an open select closes the panel, and a click on a disabled option neither selects it nor closes the panel.
- **Error state colors the arrow**: a disabled select gives its arrow `kbq-empty`, whatever its error state; `kbq-error` and `kbq-contrast-fade` apply only while it is enabled.
- **Cleaner**: the cleaner is rendered only while the selected option is one that `clearPredicate` accepts, by default one that is not disabled.
- **Timezone option layout**: the second offset column is written as `offset()` writes it, which is unsigned for a zero offset and empty for one that does not resolve.
- **Collapsing other countries**: the group of the other countries is left out when there is no other zone for it to hold.
- **Panel width**: `panelWidth="auto"` matches the field but is never narrower than `panelMinWidth`.
- **Arrow keys change the value of a closed select**: Left and Right swap in a right-to-left layout, a step starts from the active option rather than from the value, and a backward step with no active option does nothing.
- **Typeahead matches the city**: a select that has a search field runs no typeahead at all, and a typed space opens the panel of a closed select.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `timezone`: corrects the eight requirements above so that they describe the shipped behaviour.

## Impact

- Files: only `openspec/changes/correct-timezone-baseline/` now, and `openspec/specs/timezone/spec.md` once the change is archived.
- Code, public API, tests, docs and examples: unchanged.
