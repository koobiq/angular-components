# Proposal

## Why

The baseline spec of `actions-panel` states behaviour the code does not have. A static audit of `openspec/specs/actions-panel/spec.md` against `packages/components/actions-panel` at `c9c196a9b` found six requirements that hold only in some configurations, while the spec states them without that condition.

## What Changes

- **Closing only once**: `KbqActionsPanelRef.close()` ignores a later call only once it has itself run, since it is the only place that lets go of the container. History navigation and `Dialog.closeAll()` close the panel without it, and a later `close()` on the reference then still emits `beforeClosed`, after `afterClosed`. The requirement is now scoped to closes made through the reference and names that case.
- **Close button**: the button calls `close()` on the `KbqActionsPanel` that the panel's injector resolves, not on the instance that opened the panel. When the `injector` option resolves another instance, the click closes that instance's panel, if any, and leaves this one open. The requirement now says which instance it closes.
- **Escape closes the panel**: Escape goes through the same `close()` as the close button, and the `keydown.escape` listener does not match a keydown with Alt, Control, Meta or Shift held. The requirement now names the instance, the modifier keys and the two exceptions other requirements already state.
- **Pop-ups of the content are not scoped to the element**: "placed as for a trigger outside the panel" does not hold under an enclosing `kbqOverlayLayer`: the layer takes the dropdown of a trigger elsewhere in it, but leaves the dropdown of a trigger inside the panel in the application-wide container. The requirement now says the content's overlays stay in the application-wide container in both cases.
- **Size options**: the cap at the container's width comes from the `max-width: 100%` CDK gives the overlay pane, and a larger `minWidth` wins over it. The requirement now states that exception.
- **Text direction**: the `'ltr'` default is a field of `KbqActionsPanelConfig`, so it holds only with the built-in default configuration. A provided default configuration without `direction` leaves the overlay to the application's `Directionality`, without the RTL class. The requirement now states both.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `actions-panel`: corrects the requirements "Closing only once", "Close button", "Escape closes the panel", "Pop-ups of the content are not scoped to the element", "Size options" and "Text direction" to match the code.

## Impact

Only OpenSpec files: `openspec/changes/correct-actions-panel-baseline/` now, and `openspec/specs/actions-panel/spec.md` once the change is archived. No source, test, example or documentation file changes.
