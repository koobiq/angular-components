# Proposal

## Why

The baseline spec of `modal` states behaviour the code does not have. A static audit of `openspec/specs/modal/spec.md` against `packages/components/modal` at `c9c196a9b` found eight requirements that contradict the source in some case.

## What Changes

- **Motion**: with animations disabled, `afterOpen` and `afterClose` wait for a render only when the dialog is opened before its view exists; otherwise they emit on the next microtask, before the new state is rendered. The requirement no longer says they emit "as soon as the new state has been rendered".
- **Teardown of a service dialog**: the overlay is created with `disposeOnNavigation`, which the CDK ties to `Location.subscribe()`, fed only by the browser's history events. Going back or forward in history tears the dialog down; `routerLink` and `Router.navigate()` do not. The requirement no longer says "when the router navigates".
- **Tracking open dialogs**: a declarative dialog registers once, on init, and is unregistered when it first finishes closing, so it is missing from `openModals`, `closeAll()` and `afterAllClose` on every later opening. The requirement and its scenario now say so.
- **Confirm layout**: `kbqFooter` is not rendered, but it still keeps `kbq-modal_no-footer` off the dialog element, so it is not ignored. Only the layout's own header and close button are left out; a content component can still compose one.
- **One dim layer for stacked dialogs**: the hand-over reads the registry, so a declarative dialog shown again after its first close keeps its dim layer under a service dialog. The requirement and its scenario now say so.
- **Page behind the dialog is inert**: the background is computed only when a dialog is shown or hidden. A declarative dialog shown from its first render is checked while it is still in its template, so the page around it stays reachable and an existing overlay container is marked `inert`. The requirement now states both.
- **Explicit width** and **CSS unit pipe**: the pipe converts with unary plus, so an empty or blank string becomes `0px` instead of being returned unchanged. Both requirements now say so, and the pipe gets a scenario for it.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `modal`: corrects the requirements "Motion", "Teardown of a service dialog", "Tracking open dialogs", "Confirm layout", "One dim layer for stacked dialogs", "Page behind the dialog is inert", "Explicit width" and "CSS unit pipe" to match the code.

## Impact

Only OpenSpec files: `openspec/changes/correct-modal-baseline/` now, and `openspec/specs/modal/spec.md` once the change is archived. No source, test, example or documentation file changes.
