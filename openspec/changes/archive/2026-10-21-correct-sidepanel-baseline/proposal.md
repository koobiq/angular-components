# Proposal

## Why

The baseline spec of `sidepanel` states behaviour the code does not have. A static audit of `openspec/specs/sidepanel/spec.md` against `packages/components/sidepanel` and the CDK overlay it builds on, at `c9c196a9b`, found seven requirements that the source contradicts in some case.

## What Changes

- **Header title truncation**: the `kbq-title` tooltip of a cut title opens on hover, and on keyboard focus only of its own host, a `div` without a `tabindex` that focus never reaches. The requirement drops "or keyboard focus" and says that keyboard users get no tooltip.
- **Open sidepanels list**: the service removes a closed sidepanel from `openedSidepanels` in its own `afterClosed()` subscriber, made after the content was created, so a subscriber the content added in its constructor is notified while the sidepanel is still listed. The requirement now limits "gone by the time `afterClosed()` emits" to subscribers added after `open()` returned.
- **Page scroll under a sidepanel**: the CDK block strategy does not engage on a page that is already blocked, and when the lowest sidepanel with a backdrop closes, only the strategy of the next sidepanel with a backdrop is applied again. A sidepanel with a custom strategy there leaves the page scrollable under default ones above it. The requirement now describes this hand-over instead of "stays blocked while any of them stays open".
- **Escape closes the sidepanel**: CDK hands a key only to the last attached overlay that listens for keys, and the dropdown and autocomplete panels listen without preventing the default action. While one of them is open over the sidepanel, Escape does not reach the sidepanel. The requirement now names this third exception.
- **Clicking the strip closes the top panel**: a click on a sidepanel underneath reaches every overlay above it through the CDK outside-pointer stream, so it closes every sidepanel stacked above the clicked one at that position, not one. The requirement now says so.
- **Page hidden from assistive technology**: the page is hidden once, when the first sidepanel that traps focus opens; elements added to the page later stay reachable. The requirement now states this instead of an invariant over every child.
- **Size presets**: a `large` sidepanel keeps the `max-width: 100%` of its position and never gets wider than the viewport, unlike `small` and `medium`, which set their own `max-width`. The requirement now caps `large` at the viewport width.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `sidepanel`: corrects the requirements "Header title truncation", "Open sidepanels list", "Page scroll under a sidepanel", "Escape closes the sidepanel", "Clicking the strip closes the top panel", "Page hidden from assistive technology" and "Size presets" to match the code.

## Impact

Only OpenSpec files: `openspec/changes/correct-sidepanel-baseline/` now, and `openspec/specs/sidepanel/spec.md` once the change is archived. No source, test, example or documentation file changes.
