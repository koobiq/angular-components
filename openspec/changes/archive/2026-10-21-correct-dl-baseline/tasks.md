# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/dl/spec.md`; all paths are under `packages/components/` unless stated otherwise.

## 1. Verify the corrections

- [ ] 1.1 "Terms and descriptions": in `dl/dl.scss`, verify that `.kbq-dd` spans `2 / span 3` next to its term only outside `.kbq-dl_vertical`, whose rule puts every `.kbq-dt` and `.kbq-dd` in column 1, so a description sits under its term in the vertical layout
- [ ] 1.2 "Default column ratio": in `dl/dl.scss`, verify that `.kbq-dl_resizable:not(.kbq-dl_resized):not(.kbq-dl_vertical)` replaces `repeat(4, 1fr)` with a first track bounded below by `var(--kbq-description-list-dt-min-width)` and three tracks that share the rest, and in `dl/dl.component.ts` that the host binds that variable to `normalizedDtMinWidth()`
- [ ] 1.3 "Wide layout": in `dl/dl.scss`, verify that inside `.kbq-dl_wide` the resting resizable rule bounds the first of its two tracks below by `var(--kbq-description-list-dt-min-width)` and the `.kbq-dl_resized` rule sizes it with `var(--kbq-description-list-dt-width)`, so the halves are equal only without a term width and with a minimum that fits in one half
- [ ] 1.4 "Resizable term column": in `dl/dl.component.ts`, verify that the resize track binds `max-width` and `min-width` to the bounds once `dtWidth` is not `null`, and in `resizer/resizer.ts` that `updateSize()` writes the raw pointer width onto the track, so the separator at the track's end can sit away from the term column border
- [ ] 1.5 "Minimum column widths": in `dl/dl.component.ts`, verify that `maxDtWidth` never drops below `normalizedDtMinWidth()`, that `setDtWidth()` clamps every key, drag and first double-click to that range, and that a resting column is sized by the grid, not by `dtWidth`, so the first write moves it to the minimum
- [ ] 1.6 "Separator cursor": in `dl/dl.component.ts`, verify that `resizeCursor` starts as `col-resize`, that `updateResizeCursor()` runs only from `setDtWidth()`, `updateLayout()` and the minimum effect, and that the second branch of `handleResizeDblClick()` sets `col-resize` without checking the bounds
- [ ] 1.7 "Resizing with the keyboard": in `dl/dl.component.ts`, verify that `handleResizeKeydown()` starts the arrow keys from `currentDtWidth`, the rounded `clientWidth` of the resize track that `aria-valuenow` also binds
- [ ] 1.8 "Right-to-left direction": in `dl/dl.component.ts`, verify that `updateResizeDirection()` reads the injected `Directionality` and only sets `resizeDirection`, which the drag and the keys read at once while the cursor waits for `updateResizeCursor()`; in the directionality code of `@angular/cdk` under `node_modules`, verify that the root `Directionality` reads the document's `dir` once and never emits `change`
- [ ] 1.9 "Separator semantics": in `dl/dl.component.ts`, verify that `aria-valuenow` binds `currentDtWidth`, that the track's `max-width` and `min-width` hold it between the bounds while the grid column takes `--kbq-description-list-dt-width` unclamped, and that the minimum effect tracks only `dtMinWidth` and `ddMinWidth`, so a bound `dtWidth` is clamped only at the next measurement or minimum change
- [ ] 1.10 "Localized strings": in `core/locales/locale-overrides.directive.ts`, verify that each carrier injects its parent carrier with `skipSelf` and merges the parent's `resolvedOverrides()`, so a nested `kbq-dl` inherits the `[localeOverrides]` of the list around it
- [ ] 1.11 Run `openspec validate correct-dl-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirements into `openspec/specs/dl/spec.md`.
