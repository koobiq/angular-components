# Proposal

## Why

The baseline spec of `tags` states behaviour the code does not have. A static audit of `openspec/specs/tags/spec.md` against `packages/components/tags` and the `core`, `form-field` and `autocomplete` pieces it relies on found six requirements whose text the source contradicts, so the contract would mislead the next change written against it.

## What Changes

- **Tag value**: a bound `null` falls back to the text content, and binding `undefined` after a value keeps that value instead of falling back to the text.
- **Tag list tab stop**: a `tabIndex` of 0 counts as unset, so an empty list gets `-1` even with `[tabIndex]="0"`; only a non-zero tab index holds whatever the tags.
- **Reduced motion of reordering**: `provideNoopAnimations()` also adds `kbq-animations-disabled`, and the reduced-motion setting is read once, when the tag is created.
- **Tag list reports user changes of its tags**: a non-array value counts as an empty array, and a user request the consumer drops leaves the list waiting, so the next change of the tags made in code is reported too.
- **Trimming on a kbqInput**: trimming comes from `KbqTrim`, which a `kbqInput` carries only when the template imports `KbqInputModule`, `KbqFormFieldModule` or `KbqTrim`.
- **Enter with an active autocomplete option**: the tag input still prevents the default action of Enter while the input is empty, as it does for every separator key but Tab.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `tags`: corrects the six requirements above so that they describe the shipped behaviour.

## Impact

- Files: only `openspec/changes/correct-tags-baseline/` now, and `openspec/specs/tags/spec.md` once the change is archived.
- Code, public API, tests, docs and examples: unchanged.
