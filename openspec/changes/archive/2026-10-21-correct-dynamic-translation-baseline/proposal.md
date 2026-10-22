# Proposal

## Why

The baseline spec of `dynamic-translation` states behaviour the code does not have. A static audit of `openspec/specs/dynamic-translation/spec.md` against `packages/components/dynamic-translation` on `c9c196a9b` found five requirements whose wording the source contradicts; this change corrects them so the spec describes what ships.

## What Changes

- **Slot templates are registered by name**: slot names go into the marker pattern without escaping, so only an empty name was said to be special. A name with a regular-expression special character makes markers of other names disappear, keeps its own markers as text, or, with an unbalanced `(`, `)` or `[`, makes rendering throw a `SyntaxError`. The requirement now forbids such names and gains two scenarios that show the consequences.
- **Where a context ends**: the requirement said that every character of a context, parentheses included, reaches the template unchanged. A context in the list form reaches it as an array without the parentheses and commas; the list form is now excepted.
- **Unknown names and malformed markers stay text**: while no slot is registered, the marker pattern has an empty name, so `[[]]` and `[[:context]]` are removed from the output instead of staying as text. The exception is now stated and has a scenario.
- **Helper renders plain elements for markers**: an empty `content` falls back to the marker's context like a missing one, and a slot without `content` used in a marker without a context renders the text `null`, not the marker's context. Both are now stated, with a scenario for `null`.
- **Helper creates its elements once**: a marker that appears after the first render does get an element, the empty placeholder `span` the helper's template renders; only the `tag` element is never created. The description and the "Text changed after the first render" scenario now say so.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `dynamic-translation`: corrects the requirements "Slot templates are registered by name", "Where a context ends", "Unknown names and malformed markers stay text", "Helper renders plain elements for markers" and "Helper creates its elements once".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-dynamic-translation-baseline/` and, once archived, `openspec/specs/dynamic-translation/spec.md`. No source, test, documentation or public API changes.
