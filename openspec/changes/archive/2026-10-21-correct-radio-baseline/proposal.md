# Proposal

## Why

The baseline spec of `radio` states behaviour the code does not have. A static audit of `openspec/specs/radio/spec.md` against `packages/components/radio` and the shared pieces of `packages/components/core` it relies on, on `c9c196a9b`, found six requirements whose wording contradicts the source; this change corrects them so the spec describes what ships.

## What Changes

- **Button height**: the height of one text line holds only for a button without a hint whose label, if any, fits on one line; a projected `kbq-hint` or a wrapping label, as in the multiline docs example, makes the button taller.
- **Selected button of a group**: `selected` holds the checked button, and writing `null` to it leaves it `null`, only in a group whose buttons all have a value other than `null`. A button without a `value` has `null`, which equals the default group value, so it is checked on init without becoming `selected`, and it is checked and becomes `selected` when the selection is cleared.
- **Checked state of a button**: unchecking the selected button in code leaves no button checked and `selected` at `null` only in such a group; otherwise the button without a value is checked and becomes `selected`.
- **Native form submission**: the form data holds the checked button's value under the name of its native input, which is the button's own `name` when it sets one, not always the group's name.
- **Focusing a group**: `focus()` reaches the selected button only while that button is enabled; a disabled selected button stays the target, so focus does not move.
- **Exports**: `KbqRadioGroup` is a standalone directive, not a component; only `KbqRadioButton` is a component.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `radio`: corrects the requirements "Button height", "Selected button of a group", "Checked state of a button", "Native form submission", "Focusing a group" and "Exports".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-radio-baseline/` and, once archived, `openspec/specs/radio/spec.md`. No source, test, documentation or public API changes.
