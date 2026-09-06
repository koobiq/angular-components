# sidepanel-non-modal-behavior

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `21.0.0-0`). Reports what the sidepanel review changed about the panel's effect on the
page around it. It never writes to the tree.

## Background

The non-modal mode is documented as "without page blocking", but every sidepanel got CDK's
`BlockScrollStrategy`, which pins the document with `position: fixed`. The strategy follows the
modality now, and `KbqSidepanelConfig` gained a `scrollStrategy` factory for the cases that want
something else.

| Change                                           | Before                          | After                                             |
| ------------------------------------------------ | ------------------------------- | ------------------------------------------------- |
| Scroll strategy                                  | `block()` for every panel       | `block()` with a backdrop, `reposition()` without |
| `trapFocusAutoCapture` default                   | `!!hasBackdrop`                 | `true`                                            |
| Container ARIA                                   | none                            | `role="dialog"`, `aria-modal`, `aria-labelledby`  |
| Rest of the page while a modal sidepanel is open | reachable by the virtual cursor | `aria-hidden="true"`                              |
| `FocusTrapFactory` override                      | on `KbqSidepanelModule`         | scoped to `KbqSidepanelContainerComponent`        |
| `kbq-sidepanel-overlay` on the overlay host      | added, styled by nothing        | not added                                         |
| Click inside a sidepanel at another edge         | closed this one                 | only the same-position stack closes               |

The `FocusTrapFactory` entry is the one with the widest reach. It was an unscoped override of a
`providedIn: 'root'` CDK service, so importing the sidepanel module changed the focus-trap
implementation used by every trapping component in the application — modal, dropdown, popover — not
just sidepanels. Nothing in the package needed the configurable variant.

## What it does _not_ do

Nothing is rewritten. Whether a given non-modal panel wanted the page frozen, and whether an
application had come to depend on the leaked focus-trap implementation, are decisions the schematic
cannot make.

| Pattern                                                      | Manual migration                                                                                   |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `{ hasBackdrop: false }`                                     | Pass `scrollStrategy` to keep the page frozen, `trapFocusAutoCapture: false` to keep focus outside |
| `config.hasBackdrop = …` after open                          | Decide the backdrop when opening; only `disableClose` is re-read                                   |
| `overlayRef.backdropElement`                                 | `null` for a panel opened without a backdrop — the `!` only silenced the compiler                  |
| `.kbq-sidepanel-overlay` in a stylesheet                     | Tag the overlay pane with `overlayPanelClass` instead                                              |
| `host: { class: 'layout-column flex' }` on sidepanel content | Delete it; the package styles the portal host                                                      |

## Notes with no call site to point at

- `KbqSidepanelService` is `providedIn: 'root'`. `KbqSidepanelModule` still provides it, so existing
  per-module instances are unchanged, and a component-provided service now closes the sidepanels it
  opened when it is destroyed instead of leaking them.
- `KbqSidepanelAnimationState` and `kbqSidepanelAnimations` are exported from the entry point.
- `KbqSidepanelClose` injects `KbqSidepanelRef` non-optionally; the `setTimeout` fallback that looked
  the ref up by container id is gone.

## Running it manually

```
ng generate @koobiq/components:sidepanel-non-modal-behavior --project my-app
```
