# Proposal

## Why

The baseline spec of `split-button` states behaviour the code does not have. A static audit of `openspec/specs/split-button/spec.md` against `packages/components/split-button` and the dropdown it configures, on `c9c196a9b`, found two requirements about the menu that hold only in some layouts or configurations; this change corrects them so the spec describes what ships.

## What Changes

- **Menu opens toward the start**: the menu opens from the trigger's start edge toward the end only when it also fits that way. When it fits neither way, the overlay keeps whichever side has more room, which can be the start.
- **Menu width follows the trigger by default**: the floor of the trigger width and `panelMinWidth` applies only with the dropdown's default `panelWidth` or `panelWidth="auto"`. An explicit `panelWidth` is the exact width of the menu, with neither floor.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `split-button`: corrects the requirements "Menu opens toward the start" and "Menu width follows the trigger by default".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-split-button-baseline/` and, once archived, `openspec/specs/split-button/spec.md`. No source, test, documentation or public API changes.
