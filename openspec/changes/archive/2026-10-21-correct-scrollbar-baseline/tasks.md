# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/scrollbar/spec.md`.

## 1. Verify the corrections

- [ ] 1.1 "No bar for an axis the user cannot scroll": in `packages/components/scrollbar/scrollbar.ts`, verify that `KbqScrollbarContentObserver` observes mutations of the scrolling element and its subtree only, that `scrollbars` reads the computed `overflowX`/`overflowY` when it re-measures, and that pointer-enter, `focusin` and `scrollChanges` events re-measure; in `e2e.ts`, verify that the lock in `E2eScrollbarContentChanges` toggles a class on the viewport itself
- [ ] 1.2 "Bars follow content changes": in `scrollbar.ts`, verify the sources merged into `KbqScrollbarContentObserver.changes` (resize of the scrolling element, mutations, resize of the boxes returned by `getContentBoxes()`, the font set's loading-done event, `load`, transition-end and animation-end events, pointer-enter, `focusin`, `flashes`) and the JSDoc above the class that names the outside style growing only an inline element's content as a change that escapes
- [ ] 1.3 "Scrolling to offsets" and "Scrolling to the horizontal edges": verify that `scrollStart()` and `scrollEnd()` in `scrollbar.ts` call `scrollTo({ start: 0 })` and `scrollTo({ end: 0 })`, that `CdkScrollable.scrollTo` in `@angular/cdk/scrolling` resolves `start` and `end` from `this.dir` only, and that the root `Directionality` reads the `dir` of `body` or `html` once, in its constructor
- [ ] 1.4 "Scrolling to an element" and "Centering an element": verify that `getElementOffset()` in `scrollbar.ts` sums `offsetTop` and `offsetLeft` along `offsetParent` until it meets the scrolling element, that `scrollbar.scss` gives `kbq-scrollbar` `position: relative`, that the CDK styles give `cdk-virtual-scroll-viewport` `position: relative`, and that nothing positions a `kbqScrollbarViewport` host
- [ ] 1.5 "Bar gestures do not click the content": in `onBarPointerDown()` of `scrollbar.ts`, verify that the click listener is added only after the next mouse-up event on the window and dropped by `timer(0)` after it, and that nothing ends the wait for that mouse-up event except the destruction of the track
- [ ] 1.6 "Thumb size and position": in `scrollbar.ts`, verify that `getCompensation()` divides the minimum thumb box by `clientHeight`/`clientWidth`, and in `scrollbar-track.scss` that a bar is shortened by `--kbq-scrollbar-track-size` when the other bar is drawn, on top of the track being one pixel smaller than the client size
- [ ] 1.7 "Track covers the visible area without taking space": verify that `applyGeometry()` in `scrollbar.ts` sizes the track one pixel smaller than the client size, as the unit test "mirrors the viewport clientHeight into block-size/margin-block-end, one pixel short" asserts, and that `scrollbar-track.scss` keeps the track in flow (`position: sticky`) as the first child of the scrolling element
- [ ] 1.8 "Track stacking": verify the `--kbq-scrollbar-track-z-index` default in `scrollbar-tokens.scss`, the `isolation: isolate` of `.kbq-scrollbar-viewport` in `scrollbar-viewport.scss` and of `.kbq-scrollbar__content` in `scrollbar.scss`, and that a `kbqScrollbarViewport` host has no content wrapper
- [ ] 1.9 Run `openspec validate correct-scrollbar-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirements into `openspec/specs/scrollbar/spec.md`.
