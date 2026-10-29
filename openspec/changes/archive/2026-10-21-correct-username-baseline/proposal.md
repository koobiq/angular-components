# Proposal

## Why

The baseline spec of `username` states behaviour the code does not have. A static audit of `openspec/specs/username/spec.md` against `packages/components/username` and the shared locale helpers in `packages/components/core` on `c9c196a9b` found three requirements that state for every mode what holds only outside compact mode; this change corrects them so the spec describes what ships.

## What Changes

- **Default view of a profile**: the login as the secondary part with the site hint inside it is the layout outside compact mode only; in compact mode the login and the site go into the single primary part.
- **Nothing to render**: only a missing profile renders no part in every mode. In compact mode a profile with neither a name nor a login still gets the primary part, empty, or holding the site when the profile has one.
- **Visual styles**: in compact mode a login shown for lack of a name sits in the primary part and takes the color of the name, not the secondary text color of the `default` style.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `username`: corrects the requirements "Default view of a profile", "Nothing to render" and "Visual styles".

## Impact

Only OpenSpec files: the delta under `openspec/changes/correct-username-baseline/` and, once archived, `openspec/specs/username/spec.md`. No source, test, documentation or public API changes.
