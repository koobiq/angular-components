# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/content-panel/spec.md`; component paths are under `packages/components/content-panel/`, state saving paths under `packages/components/core/state-saving/`.

## 1. Verify the corrections

- [ ] 1.1 "Main content makes room for the panel": in `content-panel.ts`, verify that `contentMargin` adds 16 px (`SizeL`) to `widthState()`, which follows the `width` input unclamped and is clamped only by `handleResizerSizeChange()` and `restoreState()`, while `minWidth` and `maxWidth` reach the panel only as its inline `min-width` and `max-width`
- [ ] 1.2 "State saving is on by default": in `state-saving.ts`, verify that `read()` and `writeState()` return early unless `KbqStateSavingService.isEnabled()` and `useStateSaving()` are both `true`, that `read()` sets the read key only past that check, and that `writeState()` refuses a key other than the one read; in `content-panel.ts`, verify that `restoreState()` runs only from `ngOnInit()` and from `keyChanges`
- [ ] 1.3 "Key changes": in `state-saving.ts`, verify that the `keyChanges` effect tracks only `stateSavingKey()`, and in `content-panel.ts` that `restoreState()` returns before reading while `useStateSaving()` is `false` or the host is not connected, leaving the previous read key in place
- [ ] 1.4 "Registration with the state saving service": in `state-saving.ts`, verify that `key` returns the read key or an empty string and that `enabled` returns `useStateSaving()` alone, and in `content-panel.ts` that the private `persists` getter also requires `host.isConnected`
- [ ] 1.5 "Overflow shadows": in `packages/components/core/overflow-shadow/overflow-shadow.ts`, verify that `checkOverflow()` runs only from `afterNextRender`, from the host's `scroll` events and from the `SharedResizeObserver` of the scroll element, and that nothing in `content-panel.ts` calls it
- [ ] 1.6 Run `openspec validate correct-content-panel-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirements into `openspec/specs/content-panel/spec.md`.
