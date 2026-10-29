# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/scrollbar/` (`scrollbar.ts`, the module, the styles that decide visibility, layout and stacking, the unit spec, `e2e.ts` and the Playwright spec), `kbqAnimationsDisabled` and `KBQ_ANIMATIONS_CONFIG` in `packages/components/core`, CDK's `CdkScrollable.scrollTo`, the `scrollbar.{en,ru}.mdx` pages, the docs examples under `packages/docs-examples/components/scrollbar/`, the dev app in `packages/components-dev/scrollbar/` and the API golden file `tools/public_api_guard/components/scrollbar.api.md`. Every claim in the spec was checked against the source. The nested `scrollbar/deprecated` entry point was not read beyond its file list.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the scrollbar, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when scrollbar behaviour changes later. The viewport directive is embedded by about fifteen components, so a change here reaches all of them.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: the private track and thumb classes, the content observer, measurement scheduling, zone handling and CSS structure.
- `@koobiq/components/scrollbar/deprecated` and the components that embed `kbqScrollbarViewport`.
- Changes to tests, docs or examples.

## Decisions

The general decisions follow the select baseline (`openspec/changes/archive/2026-10-21-document-select-baseline/design.md`): English, a flat capability path equal to the entry point, the spec describes what ships with its quirks, only confirmed behaviour goes in, and suspected defects stay in Findings. The scrollbar adds these:

1. **One capability for the whole entry point.** `kbq-scrollbar`, `kbqScrollbarViewport` and `kbqNativeScrollbar` share the modes, the options token, the track and the native-mode combination, so they are one `scrollbar` capability. A separate `native-scrollbar` capability was considered and rejected: the directive is small and is mostly specified through its combination with `native` mode.
2. **What counts as contract.** On top of the select list:
    - the `kbq-scrollbar-track` element and its `kbq-scrollbar-track_revealed` class, which the specs of autocomplete, dropdown, select, popover, modal, sidepanel, code block and file upload query;
    - the viewport classes `kbq-scrollbar-viewport` and `kbq-scrollbar-viewport_native-scrollbar-hidden`, and the native classes `kbq-native-scrollbar` and `kbq-native-scrollbar_descendants`;
    - the `kbq-scrollbar-viewport-` id prefix, because `aria-controls` points at it.

    The class names of bars and thumbs are not contract; the spec names them by axis and role.

3. **Pixel values come from the default tokens.** The 14 px thickness and the 38 px minimum thumb box appear in scenarios because the e2e spec asserts them. They follow `--kbq-scrollbar-track-size`, `--kbq-scrollbar-thumb-min-size` and `--kbq-scrollbar-thumb-gap`, so a token change updates those scenarios through a `MODIFIED` delta and nothing else.
4. **Chromium is the reference browser.** The e2e suite runs in Chromium, where `kbqNativeScrollbar` styles the WebKit scrollbar pseudo-elements. The Firefox fallback, which can only set `scrollbar-color`, is not specified.
5. **Timing is not contract.** The spec says a bar follows a content change "without a scroll or hover" and that an idle scrollbar schedules nothing. That measuring happens once per animation frame is an implementation detail. The hide delay is contract because it is an input.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/scrollbar` updates `openspec/specs/scrollbar/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:scrollbar` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Two quirks that look deliberate do go in: a partial options provider falls back to the library defaults, and an overflow of up to 1 % draws no bar.
- [Layout scenarios depend on rendering] → Geometry, stacking and native styling are backed by the Playwright spec, which runs only in Docker with exact baselines. jsdom cannot check them.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The overview says the component "supports mouse wheel, touch gestures, and keyboard controls". The scrollbar adds none of them: the content scrolls natively, the thumbs are not focusable, and the scrolling element gets no `tabindex`. A thumb cannot be dragged by touch, because only mouse events are handled.
2. The docs say `kbqScrollbarOptionsProvider` "sets the default mode", and its JSDoc says it "overrides the default scrollbar options within the given injector scope". Neither says that the keys left out are reset to the library defaults rather than inherited from an outer provider.
3. Neither docs page mentions `kbqScrollbarHideDelay` or the `hideDelay` option.
4. `structure.ts` declares an examples tab (`hasExamples: true`), but `examples.scrollbar.{en,ru}.mdx` only says the documentation is in progress.
5. The JSDoc of `scrollToElement` says it scrolls the target "into view". It always aligns the target with the top-left corner of the visible area, and moves the horizontal axis as well, even when the target is already visible.
6. The docs describe calling the methods through the `kbqScrollbar` export, and the virtual-scroll section points to `kbqScrollbarViewport`. They do not say that the directive has no export name, so its methods can only be reached through a query.
7. The docs say `flashScrollIndicators` "briefly reveals the scrollbar". That is visible only in `hover` mode: in `always` the track is already visible, and `native` and `hidden` have no track. The JSDoc of the directive says so; the component's JSDoc does not.
8. The docs say "the `behavior` parameter accepts `auto`, `instant`, and `smooth`". For `scrollToElement` and `scrollTo`, `behavior` is a key of the options object, not a parameter.

**Suspected defects (from reading the code, not reproduced)**

1. `kbqScrollbarMode` bound to `undefined` or `null` creates a track without the hover class, so the scrollbar behaves like `always` instead of falling back to the configured default.
2. `scrollToElement` and `scrollIntoView` sum `offsetTop`/`offsetLeft` up the `offsetParent` chain until they reach the scrolling element. On a `kbqScrollbarViewport` host that is not positioned, the chain skips the host and runs up to the page. The requested offset then includes the host's own position. `kbq-scrollbar` (`position: relative`) and `cdk-virtual-scroll-viewport` are positioned and not affected.
3. A selector passed to `scrollToElement` is matched inside the scrolling element, and the injected track is its first child. A generic selector such as `div` resolves to a bar when one is drawn.
4. The bars detect right-to-left from a bare `dir="rtl"` ancestor, but `scrollTo`, `scrollStart` and `scrollEnd` follow only CDK `Directionality`. Under a bare `dir="rtl"` without the `Dir` directive, `scrollEnd()` seems to request a positive `scrollLeft`, which a right-to-left element clamps to 0, so it does not move.
5. A bar is drawn only when the visible part is at most 99 % of the content. An overflow of up to 1 %, such as 10 px on a 1000 px viewport, scrolls without any bar.
6. A thumb drag or a bar press sets the inline `scroll-behavior` of the scrolling element to `auto` and then to an empty string. This wipes an inline `scroll-behavior` that the consumer set on that element.
7. A non-numeric `kbqScrollbarHideDelay` becomes `NaN`. The hide timer then fires on the next task, so a scroll barely reveals the track.
8. Any mouse button starts a thumb drag, the right button included; a unit test records this as current behaviour for a press on the bar.
9. The thumbs have `role="scrollbar"` but cannot be focused or operated from the keyboard, and the scrolling element gets no `tabindex`. A scrollable region without focusable content then depends on the browser making scroll containers focusable (axe `scrollable-region-focusable`). No axe test renders the scrollbar.

**Tests whose name and body disagree, or that cannot fail**

- "scrollToElement accepts a selector string resolved against the scrollbar" passes `'div'` and asserts only that `scrollTo` was called. A lookup in the whole document would pass too, and `div` can match the track's own bar.
- "scrollToElement accepts an HTMLElement target" asserts only that `scrollTo` was called, not the offsets.
- "sets aria-valuenow when the thumb is created" asserts only that the attribute is not `null`.
- "customizes the browser scrollbar when combined with KbqScrollbar in native mode" checks host classes only. jsdom loads no styles, so nothing about the scrollbar's look is asserted; the e2e spec covers that.

**Behaviour without a test.** The spec states these from the source:

- the 99 % threshold for drawing a bar;
- `kbqScrollbarHideDelay`, the `hideDelay` option, and the restart of the delay on each scroll (every test uses the 1000 ms default);
- a partial `kbqScrollbarOptionsProvider` in a nested injector falling back to the library defaults;
- the `hover`-mode track staying visible while a bar is pressed;
- a press on a bar not moving focus or starting a text selection;
- the instant scroll of a drag when the element has smooth `scroll-behavior`;
- `scrollTo` with `right`, `bottom`, `start` or `end`, and `scrollStart`/`scrollEnd` in a right-to-left layout;
- `flashScrollIndicators()` called on `kbqScrollbarViewport`, and its `flashes` stream;
- the `kbq-scrollbar-viewport-` prefix of the generated id;
- motion turned off by `prefers-reduced-motion` or by an `ANIMATION_MODULE_TYPE` of `NoopAnimations`;
- `hidden` mode keeping the content scrollable;
- re-measuring after a font loads, on hover and on focus;
- `kbqScrollbarViewport` leaving the host's overflow alone and having no export name (the latter is visible in the API golden file only);
- `KbqScrollbarModule`.
