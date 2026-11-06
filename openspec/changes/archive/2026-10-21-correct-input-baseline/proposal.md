# Proposal

## Why

The baseline spec of `input` (`openspec/specs/input/spec.md`, written from the code on `c9c196a9b` and never checked) states behaviour the code does not have. A static audit of every requirement against `packages/components/input`, the parts of `core` it relies on and their tests found six requirements with at least one wrong statement; this change corrects them so the spec describes what ships.

## What Changes

- **Fraction separator**: `.` is accepted as the fraction separator only in the locales that group with a space and use `,` for fractions; in `pt-BR` a typed `.` is read as the group separator.
- **Paste**: without a locale service, or when the active locale is not shipped, a paste is parsed with the shipped locales in their fixed order, `en-US` first, not with the locale the field renders in; overrides are ignored. The scenarios now name the locale service they rely on.
- **Stepping from the keyboard**: a step reports its result at once and even when it equals the current value, as at a bound, unlike a typed change.
- **Caret position after a reformat**: the caret moves one position whenever the reformat changes the length of the text by two, wherever the separator lands, so it stays next to the typed digit only when the separator lands before the caret.
- **Separators follow the locale**: the rendered group separator is the section's `viewGroupSeparator` or the one `Intl.NumberFormat` uses for the active locale id, not the parsing `groupSeparator` of the section.
- **Rendering for es-LA**: only the locale id handed to `Intl.NumberFormat` is replaced by `ru-RU`; the `es-LA` section still applies, and with no grouping threshold it groups values that `ru-RU` leaves ungrouped.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `input`: six requirements corrected to match the code: Fraction separator, Paste, Stepping from the keyboard, Caret position after a reformat, Separators follow the locale and Rendering for es-LA.

## Impact

Only OpenSpec files: this change and, once archived, `openspec/specs/input/spec.md`. No source, test or documentation file changes.
