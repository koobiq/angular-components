# Proposal

## Why

The baseline spec of `accordion` states behaviour the code does not have. A static audit of `openspec/specs/accordion/spec.md` against `packages/components/accordion` on `c9c196a9b` found three requirements whose wording contradicts the source; this change corrects them so the spec describes what ships.

## What Changes

- **Controlled value**: in single mode only the first non-empty value of a bound array is applied, so a bound array of two values expands one item, not both; and a change of `stateSavingKey` applies the bound value again even though it did not change, undoing the user's toggles.
- **Unusable saved payloads**: a saved array that mixes strings with other entries is not ignored; its strings are restored and the other entries dropped. Only an array without any string (other than an empty array), or an object without any `{ expanded, value }` entry, is ignored.
- **Changing the state saving key**: while `value` is bound, a key change does not restore the state saved under the new key and does not keep the current state; it applies the bound value again.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `accordion`: corrects the requirements "Controlled value", "Unusable saved payloads" and "Changing the state saving key".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-accordion-baseline/` and, once archived, `openspec/specs/accordion/spec.md`. No source, test, documentation or public API changes.
