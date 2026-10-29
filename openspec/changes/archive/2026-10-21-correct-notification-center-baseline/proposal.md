# Proposal

## Why

The baseline spec of `notification-center` states behaviour the code does not have. A static audit of `openspec/specs/notification-center/spec.md` against `packages/components/notification-center` and the pieces of `packages/components/core` and `@angular/cdk` it relies on, at `c9c196a9b`, found eight requirements with a statement that the source contradicts in some case.

## What Changes

- **Overlay pane classes**: the overlay is created on the first open and reused, and `kbqNotificationCenterPanelClass` is read only then, so a value bound later never reaches the pane. The requirement now promises the class bound at the first open.
- **Side placement by default**: the panel takes the first of the centred, bottom-aligned and top-aligned positions that fits the viewport, and otherwise the one leaving the most of it visible, pushed into the viewport. With the default height of `100vh` none fits unless the trigger is centred in the viewport, so the panel is not centred on the trigger. The requirement and its scenario now say so.
- **Placement change output**: the CDK position strategy reports a position only when it differs from the last one applied or the scroll visibility has changed, so re-applying the same position on a resize or a scroll of the list emits nothing. The requirement no longer says "each time the overlay applies a position".
- **Outside click closes the panel**: only an overlay that listens for outside clicks itself, such as the silent-mode menu, keeps a click inside it from closing the panel. The toast stack does not listen, so a click on a toast stacked above the panel closes it. The requirement is now scoped accordingly.
- **Bottom rows are scrolled into view**: the list scrolls when `loadingMore` or `loadMoreErrorMode` turns on, not when a bottom row appears; the error row uncovered when `loadingMore` turns off while `loadMoreErrorMode` stays on does not scroll it. The requirement now names the flag transitions.
- **Focus after deletion**: the target is computed from the delete button that has focus when the deletion starts, not from the activated one; a pointer activation that does not focus its button sends focus to the list. The requirement and its scenario now say so.
- **Popover mode**: the panel is pushed back into the viewport when no position below the trigger fits, which the default height causes for a trigger below the navbar, and then covers the trigger. The requirement no longer promises a panel below the trigger in every case.
- **Test ids**: the panel element itself has no `data-testid`; only its parts and rows have one. The requirement no longer lists the panel among the elements that carry one.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `notification-center`: corrects the requirements "Overlay pane classes", "Side placement by default", "Placement change output", "Outside click closes the panel", "Bottom rows are scrolled into view", "Focus after deletion", "Popover mode" and "Test ids" to match the code.

## Impact

Only OpenSpec files: `openspec/changes/correct-notification-center-baseline/` now, and `openspec/specs/notification-center/spec.md` once the change is archived. No source, test, example or documentation file changes.
