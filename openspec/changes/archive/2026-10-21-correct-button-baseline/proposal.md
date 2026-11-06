# Proposal

## Why

The baseline spec of `button` states behaviour the code does not have. A static audit of `openspec/specs/button/spec.md` against `packages/components/button` on `c9c196a9b` found six requirements whose wording contradicts the source, the unit tests or the Playwright baselines; this change corrects them so the spec describes what ships.

## What Changes

- **Disabled anchor**: the click is halted by a capture-phase listener on the host, so capture-phase listeners on its ancestors (such as the CDK overlay's outside-click handling) still receive it; it does not stop "any other click handler".
- **Disabled anchor ignores activation keys**: the same limit applies to the halted keydown.
- **Keyboard focus ring**: the button theme draws the focus outline only for the `filled`, `outline` and `transparent` styles; a custom style gets none from it, while the native outline is still removed.
- **Label truncation**: a label whose box directly holds an unmarked icon becomes a flex row and is clipped without an ellipsis.
- **Icons are centred**: for an icon wrapped in the consumer's own element the button centres only that element; the icon is centred inside it only if the element does so itself.
- **Right-to-left layout**: under `dir="rtl"` a horizontal group mirrors the order and the outer corners of its buttons, but the joining borders and the dividers of a `filled` `contrast-fade` group stay on their physical sides.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `button`: corrects the requirements "Disabled anchor", "Disabled anchor ignores activation keys", "Keyboard focus ring", "Label truncation", "Icons are centred" and "Right-to-left layout".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-button-baseline/` and, once archived, `openspec/specs/button/spec.md`. No source, test, documentation or public API changes.
