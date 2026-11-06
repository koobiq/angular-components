# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/sidepanel/spec.md`.

## 1. Verify the corrections

- [ ] 1.1 "Header title truncation": in `packages/components/sidepanel/sidepanel-directives.ts`, verify that the title `div` carrying `kbq-title` has no `tabindex`, and in `packages/components/title/title.directive.ts` that the tooltip opens on `mouseenter` and on a keyboard focus reported by `focusMonitor.monitor(this.elementRef)` for the host alone
- [ ] 1.2 "Open sidepanels list": in `sidepanel.service.ts`, verify that `openSidepanel()` attaches the content before it subscribes to `afterClosed()`, and that this subscriber is the one that calls `removeOpenSidepanel()`
- [ ] 1.3 "Page scroll under a sidepanel": verify `resolveScrollStrategy()` and `restoreScrollBlock()` in `sidepanel.service.ts`, and in the overlay module chunk of the installed `@angular/cdk` that `BlockScrollStrategy._canBeEnabled()` returns `false` while the root element already carries the global scroll block class or the page does not overflow
- [ ] 1.4 "Escape closes the sidepanel": verify that `OverlayKeyboardDispatcher._keydownListener` in the same CDK file hands the key to the last attached overlay with keydown subscribers and stops, and that `dropdown-trigger.directive.ts` and `autocomplete-trigger.directive.ts` subscribe to `keydownEvents()` of their overlays without preventing the default action
- [ ] 1.5 "Clicking the strip closes the top panel": verify that `OverlayOutsideClickDispatcher._clickListener` emits to every overlay above the one containing the target before it stops, and that `isClickInsideSamePositionStack()` in `sidepanel-ref.ts` lets each sidepanel at the clicked position close
- [ ] 1.6 "Page hidden from assistive technology": in `sidepanel.service.ts`, verify that `hideContentFromAssistiveTechnology()` marks the siblings only when the first focus-trapping sidepanel opens
- [ ] 1.7 "Size presets": in `sidepanel.scss`, verify that the left and right positions set `max-width: 100%`, that `kbq-sidepanel_small` and `kbq-sidepanel_medium` replace it with their own width, and that `kbq-sidepanel_large` does not
- [ ] 1.8 Run `openspec validate correct-sidepanel-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirements into `openspec/specs/sidepanel/spec.md`.
