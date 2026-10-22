# E2E flakiness: audit and fixes

Measured 2026-09-01 against `main` at `0c38a652e`, with `@playwright/test` 1.62.1.

## What was wrong

`playwright.config.ts` retried a failing test twice on CI, so a test that passed on a retry was
reported as flaky and did not fail the run. The suite was therefore almost always green while being
measurably unstable.

| Source                                                                        | Size              | Result                                                                                                       |
| ----------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------ |
| CI history — every `e2e.yml` run still within log retention                   | 99 runs           | **43 runs (43 %)** contained at least one test that passed only on a retry. 28 distinct tests, 8 spec files. |
| Local — full suite, `PLAYWRIGHT_RETRIES=0 --repeat-each=5`, Docker, 8 workers | 2810 test results | **27 failures** across 6 tests.                                                                              |

The same local run after the fixes below: **2810 passed, 0 failures.**

**Every red e2e run in the CI window was caused by one of these files.** In 99 runs there was not a
single failure attributable to a genuine regression. **No test ever timed out** — every failure was a
screenshot comparison.

Nine components were affected: `form-field`, `sidepanel`, `code-block`, `dropdown`, `popover`,
`file-upload`, `notification-center`, `datepicker`, `content-panel`.

## The shape of the fix

Almost every failure was a screenshot taken before the state it captures had settled. So the fix is
one idea applied consistently: **assert the settled state, then take the shot.** No component
behaviour was changed, and the tests that assert the transient states on purpose were left alone.

## Cause 1 — the scrollbar reveal window

Four components, seven tests. The diff images showed it directly: the only thing differing between
baseline and run was the **scrollbar thumb**.

`KbqScrollbarTrack.revealed` (`packages/components/scrollbar/scrollbar.ts`) reveals the track for
`hideDelay` — 1000 ms by default — after a scroll or a `flashScrollIndicators()`, then hides it. Three
properties made that a flake generator:

1. **Playwright cannot freeze it.** `animations: 'disabled'` fast-forwards CSS animations and
   transitions; this is a `timer()` in TypeScript driving a class binding.
2. **It is one-way.** Once the timer fires nothing reveals the track again, so the assertion was
   waiting for a state that was already gone rather than one that had yet to arrive. That is why
   retries never rescued this class.
3. **Nothing decided where a baseline landed.** The committed baselines disagreed with each other:
   `content-panel`'s held the revealed track, `sidepanel`'s the faded one.

**Fix.** `e2eWaitForSettledScrollbars` in `packages/e2e/utils/scrollbar.ts`, called before the shot
in `sidepanel` and `content-panel`. It waits for the expected number of tracks to exist and then for
none of them to be revealed. Both halves are load-bearing: "nothing is revealed" is equally true of a
viewport whose track has not been created yet, so waiting only for the second returns before the
window it exists to sit out.

The settled state is the only one that stays reachable, so that is what it waits for. Three baselines
had been recorded inside the window and were regenerated: `content-panel/01-light.png`,
`content-panel/01-dark.png`, `popover/01-light.png`.

**Verified by removing it.** With the helper stubbed to a no-op and the regenerated baselines kept, a
×20 run at 16 workers fails 95 times — 20/20 in `content-panel` and 18–20/20 across `sidepanel`'s
four tests. `popover` and `notification-center` stayed at 0.

**`popover` was under-sampled, not exempt.** That 0/20 was read as "the track is never revealed on
this route", and the baseline regeneration was credited to `toHaveScreenshot`'s own retry outliving
`hideDelay`. Run [33794993473](https://github.com/koobiq/angular-components/actions/runs/33794993473)
disproves both halves: `popover/01-light.png` failed with 10848 px confined to the two track bands,
and the received image is byte-identical to the baseline `08ff1fff4` first committed — the revealed
one. The retry does not outlive the window either. Timed from that run's traces, the assertions
resolve in 188–725 ms:

```
select   toHaveScreenshot(02-light.png)   188ms
select   toHaveScreenshot(02-dark.png)    725ms
popover  toHaveScreenshot(01-light.png)   605ms
```

`toHaveScreenshot` re-shoots only until two consecutive frames are identical, then compares once. Two
frames a few hundred milliseconds apart are identical well inside a 1000 ms window, so the assertion
returns without ever reaching the settled state — the 5 s expect timeout is never spent. A settled
baseline is therefore not self-healing; it just fails in the other direction.

`popover` now carries the wait. `notification-center` still does not: that route was investigated
separately and the scrollbar attribution disproved on its own evidence.

**Three more routes were landing inside the window on purpose.** `autocomplete`, `timezone` and
`inline-edit` open a panel into a body-level overlay and shoot it straight away, and none of them
appears in the CI window above. That is the `popover` finding read from the other side: the assertion
resolves in a few hundred milliseconds, so it captured the revealed track on every run, and the
baselines were recorded agreeing with it. Consistency is not stability here — the margin is the whole
of `hideDelay`, and a run that spends it between the open and the shot flips the capture to the
settled state, with nothing in the test to say which of the two it meant. All three now carry the
wait, page-scoped because the panel is not a descendant of the screenshot target. Five more baselines
were regenerated: `autocomplete/01-light.png`, `autocomplete/01-dark.png`, `inline-edit/06-light.png`,
`inline-edit/06-dark.png`, `timezone/02-light.png`.

**`select` supplied the timing above and never got the wait.** Two of the three rows in that table were
measured on its multi-select route, which was read as evidence and left unchanged. Run
[33849484989](https://github.com/koobiq/angular-components/actions/runs/33849484989) is what that cost:
`02-dark.png` failed with 7453 px, three attempts in a row, on a branch whose previous commit had just
regenerated both `02` baselines. That is "fails in the other direction" observed in the wild — the
baseline held the settled state and CI captured the revealed one. All six states routes now carry the
wait, page-scoped and one track each. The panel is not a descendant of the screenshot target on any of
them, but the revealed track falls entirely inside the shot region on all six, measured route by route.
`E2eSelectSelectAllStates` briefly holds two tracks while the panel before it tears down, which the
count assertion waits out. One baseline was regenerated: `select/02-light.png`.

**Only one of the six was failing, which is not a reason to fix only that one.** With the helper stubbed
to a no-op, a ×20 Docker run at `PLAYWRIGHT_RETRIES=0` fails 20/20 on `E2eMultiSelectStates` — both its
baselines, every repeat — and 0/20 on the other five; with the wait, 120/120 pass. The five are the
`autocomplete` case rather than the `notification-center` one: the reveal is measured on every route, so
all that separates them is how long `toHaveScreenshot` happens to take, and `02-light` is the fastest
assertion in the table at 188 ms.

## Cause 2 — `code-block` captured mid-load

8 CI runs, and the only failure with a different signature: the **image size** changed, `1556x3540`
expected against `1556x3232` received.

Measured on the fixture, the component is **1616 px** tall at first paint and **1770 px** once
settled — at `deviceScaleFactor: 2` exactly the 3232-against-3540 image CI reported. The difference is
highlight.js and its line-numbers plugin, which arrive through a dynamic import
(`code-block-highlight.ts`) and restructure the `lineNumbers` blocks into numbered rows (0 → 254
rows). `page.goto` resolving says nothing about any of it.

A second, smaller effect sat behind the first. The fixture scrolls one block to its end
(`code-block/e2e.ts`, the `afterNextRender` scroll), and `KbqCodeBlock.scrollTo` defers that until highlighting reports itself
done — but the scroll range keeps growing afterwards, from 150 px to 180 px. In about one run in
thirty the block rests one pixel short of the bottom and stays there, which shifts the whole code area
by one CSS pixel.

**Fix.** The spec waits for the line-numbers plugin to have rebuilt its rows, then re-scrolls to the
end itself. The order matters: scrolling first and measuring the remainder would satisfy the check
with its own side effect and gate nothing, since `scrollTo` updates `scrollTop` synchronously. The
remainder is compared with a tolerance rather than to zero, because `scrollHeight` and `clientHeight`
are rounded to integers by the layout API while `scrollTop` is a double — the same reason `notification-center` carries
`SCROLLED_TO_BOTTOM_TOLERANCE`.

**Verified:** 40/40 repeats under 16 workers, against 5/30 failing with only a highlight gate and
20/20 with none.

The one-pixel short rest is a defect in the component, not the test — a consumer scrolling a code
block to its end right after load can hit it with no way to notice. Filed separately.

## Cause 3 — `form-field` autofill screenshots

The most frequent CI flake: 16 runs for `e2eControlMatrix under forced autofill`, 8 for
`e2eStateMatrix`. Reproduced locally once in 800 repeats under 16 workers, which is what made it
diagnosable.

The differing pixels are **anti-aliased edges of the autofill tint**, with deltas of single digits per
channel — `rgba(174,185,208)` against `rgba(179,189,211)`, and so on. 226 raw differing pixels, 86 by
Playwright's own count. All five occurrences ever observed measured 8, 29, 33 or 86 pixels.

These are the only screenshots in the suite taken with `animations: 'allow'`
(the `screenshot` options in `form-field/e2e.playwright-spec.ts`), which is deliberate and must stay: the 600000 s
`background-color` transition that suppresses Chrome's autofill background would otherwise be
fast-forwarded, and the controls would paint Chrome's raw blue. The cost is that Playwright never
stabilizes these shots.

**Fix.** `threshold: 0.05` on those two screenshots. A magnitude knob, because the noise is a
magnitude — about 2 % of the YIQ range on edge pixels. `maxDiffPixels` would have been the wrong
shape: it admits a fixed number of _fully_ wrong pixels, and the seam this block exists to catch is
one pixel wide, so a count large enough for the noise would also be large enough to hide it.

The third `form-field` test, `the :hover variant carries no declarations of its own`, read a computed
style once immediately after `hover()`. It now waits until the control actually matches `:hover` and
then reads once. Polling the paint instead would defeat the test: a poll passes on the first sample
equal to the pre-hover value, and that is the frame `hover()` returns on.

**Verified:** 800/800 repeats under 16 workers.

## Cause 4 — `dropdown`'s serial mode was an amplifier

`test.describe.configure({ mode: 'serial' })` meant one root failure re-ran and marked the whole file.
Measured over the CI window: the file flaked in **4 runs**, and each time all **16** of its tests were
reported flaky. Serial mode also skips the remaining tests on a failure, so one flake cost the whole
file's coverage.

**Fix.** Removed. The directive's stated reason was that pixel-exact CDK overlay positioning flakes in
parallel browser contexts; **verified** against that claim with 320 tests in parallel contexts, 0
failures. The root failure it was hiding — `E2eDropdownItemAction › states`, 324 px — did not
reproduce in 320 repeats either.

## Cause 5 — `file-upload`'s fixture finished after the shot

2 CI runs each for the single- and multiple-upload matrices, 250 px and 518 px. The fixture paints the
hover and focus states on after the first render, and re-applies the single-file ones in a
`setTimeout` because the component clears them first (the `setTimeout` in `file-upload/e2e.ts`).

**Fix.** The fixture sets a `data-e2e-decorated` marker as the last thing it does, and the spec waits
for that. A count of undecorated elements cannot serve: it is zero before the classes are applied at
all, and again in the window after the component's focus monitor has cleared them, so it cannot tell
any of the three states apart. **Verified:** 0 failures in 10 repeats.

## Follow-up, 2026-09-15

Measured against `main` at `b89f329d6`. Sixteen red `E2E tests` runs were still in log retention;
after discarding the ones that were not flakes at all — `splitter` has no committed baselines and
fails on every branch that carries its new test, `textarea` failed only on the branch rewriting the
textarea scrollbar, and one run was a `@koobiq/design-tokens` bump changing ten baselines legitimately
— three tests remained. Two are causes from the audit above reappearing in files it did not reach.

### `modal › renders the same header layout as a modal created by the service`

Cause 1 again, in a component the original sweep missed: the whole diff is the **scrollbar thumb**,
a 16×64 px block at `x[776..791] y[174..237]`, and the count was identical — 932 by Playwright's
reckoning, 990 raw — in all six occurrences.

The test did gate on the scrollbar, but only once and on the wrong side of the shot: it asserted
`opacity: 0` before `04-light.png` and nothing before `04-dark.png`. `toHaveScreenshot` scrolls its
target into view before **every** shot, and that scroll re-reveals the track for `hideDelay`, so the
dark shot raced the timer. This is why only `04-dark.png` ever failed.

**Fix.** `e2eWaitForSettledScrollbars` — the helper Cause 1 introduced — before both shots. The
baseline had been recorded inside the reveal window and was regenerated: `modal/04-dark.png`.

**Verified:** with the gate in place the shot is byte-identical across repeats (two independent
repeats diffed to 0 px), and it failed 5/5 against the stale baseline before regeneration, which is
the fix proving itself.

### `form-field › e2eControlMatrix under forced autofill`

Cause 3 reappearing: `threshold: 0.05` absorbed most of the noise but not all of it. Four
occurrences at 1, 9, 210 and 219 pixels.

Measured with pixelmatch's own YIQ metric, the worst pixel in the 9-pixel occurrence needs
`threshold > 0.139` — nearly three times what the block sets — and sits on the focused column's
border, not on the autofill tint. `animations: 'allow'` is what lets it move: it is there to preserve
the parked 600000 s `background-color` transition, but it equally leaves the focus border's own color
transition running, so the shot lands at an arbitrary point along it.

**Fix.** `expectSettledAnimations`, which polls until the only running animations under the matrix are
the parked suppressions, called before both shots. Gating rather than widening `threshold`, for the
reason Cause 3 already gives: the seam these shots exist to catch is one pixel wide, so a tolerance
loose enough for the noise would also be loose enough to hide it. No baseline moved.

**Verified:** 5/5 repeats at 16 workers, both matrices, light and dark.

## Follow-up, 2026-09-16

### `file-upload › KbqSingleFileUploadComponent truncates a long file name without horizontal scroll`

Every cause above is a shot taken before the page settled; this one is a shot of a page that settled
on the wrong thing, because **the split point is chosen from whichever font happened to be active
when the row was measured**.

Four occurrences among the runs still in log retention, all **97 pixels** by Playwright's count — the
binary-state signature Cause 1 established — and the whole diff is where the name was cut: the
baseline keeps `контейнер.pdf` in the tail, CI captured `-контейнер.pdf`.

`KbqEllipsisCenterDirective.refresh()` derives the slice index in a `setTimeout` scheduled as the row
is attached, from two inputs that are both webfont-dependent: `textWidth / length` for the name, and
the row's `clientWidth`, which the icon in front of it — a webfont glyph of its own — takes a share
of.

Neither can be ready in time: Inter is served as unicode-range subsets, so the Cyrillic one is
requested only once a Cyrillic glyph is laid out, and on this route that glyph is the row itself —
the request starts in the same frame the measurement is queued from.

The gap is worth one character here: measured on macOS, a Latin-metric fallback averages 7.19 px per
character where Inter averages 7.64, though the fallback a CI container picks is a different face
again, so the size of the shift is a property of the machine rather than a constant.

Nothing reliably takes it back: the only other trigger is the `SharedResizeObserver` subscription,
guarded by `clientWidth !== lastMeasuredWidth`, so the correction comes only because the icon beside
the name swaps in too and moves the row's width, one `debounceTime(50)` late.

Sleeping instead is no substitute, however tempting a `waitForTimeout` looks: the correction lands
about 60 ms after the font does, and the font lands when the network says — measured 1560 ms after
the row appeared, under a 1.5 s stall.

The spec's own gate, a tail matching `/\.pdf$/`, is satisfied by both splits, so it returns inside
that window and `toHaveScreenshot`'s two identical frames 100 ms apart are two shots of the pre-swap
one.

Playwright's `waiting for fonts to load` before each shot settles what the page paints, not what the
directive already decided — which is why it sits in the call log of every failure looking like a gate
that should have held.

**Fix.** `e2eWaitForFonts` in `packages/e2e/utils/fonts.ts`, and the two long-name rows moved behind a
trigger in the fixture, so the spec puts the faces in the page and only then asks for the rows — which
makes the first measurement the final one; no baseline moved.

Ordering the fonts ahead of the row rather than waiting for the settled split afterwards, because here
that split is reachable only as a side effect of the icon swapping in beside the name — the mirror
image of Cause 1, where the settled state was the only reachable one.

The helper loads every face the page declares, rather than waiting on `document.fonts.status` or
`document.fonts.ready`: both report the set as settled whenever nothing is _pending_, which includes
every moment before a needed unicode-range subset has been requested at all — measured under the same
6 s stall, that check passes in 4 ms with the fallback split on screen. Naming the faces instead would
mean naming their weights too, and the subset each route happens to render.

Nothing about this is specific to `file-upload`, which is why the helper is shared: any measurement
taken once at render time is exposed the same way.

**The directive's half is a defect, not a test artifact, and is filed separately:** the tail cannot
shrink (`flex: 1 0 auto`) and the host clips (`overflow: hidden`), so on a cold font cache a fallback
face narrower than the real one can leave the extension outside the box — exactly what the
`Math.max(charWidth, textWidth / length)` guard in `refresh()` was added to prevent.

**Verified:** 90/90 repeats in Docker — the whole `file-upload` spec ×5, twice — with the baselines
untouched, and from the other side, under a 6 s font stall the spec as it stood reproduces CI's
received image exactly where the helper holds the Inter split 6 times out of 6.

## Follow-up, 2026-09-29

### `form-field › e2eControlMatrix under forced autofill`, again

Still the most frequent flake after the 2026-09-15 fix: 16 of the 36 red `E2E tests` runs between
2026-09-16 and 2026-09-29, three of them on `main`. It only ever failed in three shapes —
`05-light.png` at 9 pixels, `05-dark.png` at 1, `04-light.png` at 2 — and the received images are
byte-identical from one run to the next. A binary state, then, and one chosen per shot rather than per
machine: in the runs where `05-dark.png` failed, `05-light.png` had matched a moment earlier.

The diff is anti-aliasing on the rounded corners and nothing else — the border, the tint and the focus
ring; every straight edge is identical. 226 raw pixels in the light shot, of which only the 9 in the
focused column's corners exceed `threshold: 0.05`: the ring is where the contrast is highest.

**The 2026-09-15 explanation does not hold.** Nothing in either matrix animates but the parked
suppressions, 8 and 14 of them, before the theme swap or after it (`getAnimations({ subtree: true })`),
so `expectSettledAnimations` returned at once and never gated anything.

**Cause: partial raster.** The parked `background-color` transition repaints every autofilled control
on every frame — a 500 ms trace holds some 30 paints of each of the 14 fields and 130 raster tasks —
and only the invalidated part of each tile is rasterized again. The anti-aliased edge of a curve
comes out a few percent off when the raster that last touched it covered only part of the tile — the
baselines are the whole-tile rendering — so the corners keep whichever rendering that raster left,
and timing decides which it was. `toHaveScreenshot` hides most of it: when the first capture misses,
it shoots again until two frames agree, and locally the later frames usually return to the baseline
rendering. In CI they stayed on the other one.

- In Docker at 6 workers, a `locator.screenshot()` taken 250 ms after the gate reproduces CI's
  received image byte for byte in 8 of 10 light shots and 2 of 10 dark ones. With
  `--disable-partial-raster`, 20 of 20 match the baseline.
- `--disable-features=CompositeBGColorAnimation` changes nothing: the transition runs on the main
  thread.
- It is also what Cause 3 measured. Without the flag, the shots compared at threshold 0 fail 18 of 50
  repeats, at 8, 29, 33 and 86 pixels — the counts recorded there. `threshold: 0.05` absorbed most of
  it, `expectSettledAnimations` none of it.

**Fix.** `test.use({ launchOptions: { args: ['--disable-partial-raster'] } })` at the top of
`form-field/e2e.playwright-spec.ts` — top-level, because a launch option cannot be scoped to a
describe — and `threshold: 0.05` removed, so the two matrices are compared at the project's 0 again.
`expectSettledAnimations` stays, as the guard against a transition added later, with its comment
corrected. No baseline moved.

Not applied to the whole suite: every other shot is taken with `animations: 'disabled'`, which stops
what would keep repainting through it, and the flag is Chromium's while the same project launches
WebKit for `sidepanel` and `scrollbar/deprecated`.

The repaint itself is not a test artifact. The same transition runs wherever a field is really
autofilled, so an autofilled field has its page repainted and partly rasterized again on every frame
for as long as it stays filled. That is the cost of the suppression technique, left for a separate
change.

**Verified:** at threshold 0, in Docker at 6 workers — the whole `form-field` spec ×3 (156/156) and
the two autofill shots ×25 (50/50).

## Follow-up, 2026-10-08

### `actions-panel › items overflow and dropdown`

1 occurrence in a full local Docker run, 23709 px (ratio 0.05) on `2-light.png`: the first item of the
overflow dropdown, `Action 5`, rendered in its hover/focus state, where the baseline has no item
highlighted. It did not come back in about 80 further runs of the test, among them the whole suite ×3
and the spec ×60 alone and ×15 at 64 workers.

The test set the container to 650 px and clicked the overflow button straight away. The overflow follows
the width through a `ResizeObserver`, and at the fixture's 400 px four actions are hidden rather than
two, so a slow recalculation lets the dropdown open while it still lists `Action 3` to `Action 6` and
lose two items while open. That race is the only asynchronous step between the runs. The highlight
itself is not explained: a probe that opened the panel before the recalculation left no item focused,
and the pointer, resting on the button, stays below the panel in both states, so it is not a hover.

**Fix:** the test waits until exactly the two actions that no longer fit are hidden before it opens
the dropdown, then asserts the two items and that none of them is focused before the screenshot, so a
recurrence fails on a named state instead of a pixel count. **Verified:** the spec ×30 in Docker
(240/240).

**Recurred in CI on 2026-10-11**, same 23709 px, after both assertions had passed. The trace has the item
`cdk-focused cdk-mouse-focused` only in the snapshot of `toHaveScreenshot`, so a `mouseenter` reached it
during the capture. The page is 234 px tall in a 200 px viewport, and the target, 202 px with its
border, does not fit either: Chromium captures it by growing the viewport, the page stops being scrolled
and moves down under the pointer resting on the overflow button. A probe that grew the viewport to
240 px focused `Action 6`, to 260 px `Action 5`, and to 300 px flipped the dropdown below the trigger;
whether and how far the capture grows it is what varied between runs.

**Fix:** the viewport is 240 px tall, so the page fits, nothing scrolls and the capture moves nothing.
The dropdown, no longer offset by the scroll, lands on another fraction of a pixel, so `2-light.png` was
re-recorded in Docker (58 px of corner anti-aliasing). **Verified:** the spec ×30 in Docker (240/240).

## Follow-up, 2026-10-19

### `docs app › renders the examples that cannot render on the server once the page is hydrated`

1 occurrence in CI (`e2e:docs`, 4 workers): `ag-grid-angular` not found within the default 5 s. The trace
has the examples chunk loaded 0.5 s after the network went idle, then no request for 2.3 s while the main thread
evaluated it and rendered the grids; the first grid initialized 3 s into the wait and the assertion still
ran out. The test took 5.0 to 10.3 s across recent CI runs, main included (6.7, 6.9, 7.6, 8.5 s), against
2.4 s locally, so the wait was always close to the limit rather than broken by a change.

**Fix:** both waits for the client-only examples take 15 s, within the 30 s test timeout of the docs
config. **Verified:** the test ×12 at 6 workers locally.

### `migration guide filter › hides the steps outside the picked range`

1 occurrence in CI, on the next run: every step still shown. The test counted the visible steps once,
right after `waitForHydration`, which waits for the network to go idle; the guide applies the range of the
URL after that, so a single count could see the prerendered page with every step. **Fix:** both bounds are
polled. **Verified:** the filter tests ×8 at 6 workers locally (48/48).

## Follow-up, 2026-10-21

### `docs app › shows the import of the core API tab reached by a link on another one`

7 occurrences in the 31 `e2e:docs` runs of 2026-10-20 and 2026-10-21, 5 of them on `main`: `Test timeout of
30000ms exceeded`, the test reported at 31.8–34.1 s. In the runs that passed it took 16.9–30.0 s (median 22 s),
against 2.2–4.6 s for its `tooltip` twin, which makes the same navigation to a tab of 11 entries. Not a race:
the trace of run 39592727535 has the core API tab fully rendered when the time ran out, with `toHaveURL`
blocked for 8 s on a main thread that was still busy 23 s after the click. The time is the render itself.

The test navigates in the app from the select API tab to the core one, the only entry point without an import
that another tab links to (`link` and `scrollbar` have none either, their modules being `@docs-private`, but
no tab links to them). The core tab is the largest by far: 484 entries and 376 members, 506 code blocks and
some 40,000 DOM nodes, against 11 entries and 13 blocks for `tooltip`. Its code blocks are `@defer (on
immediate; hydrate on hover)` blocks, so after a navigation in the app every one of them renders at once.

Measured on `main` at `997656544`, with a CDP trace of the navigation on a 16-core desktop: the import block
of the previous tab goes away 3.0 s after the click and the main thread settles after 4.5–6.2 s; at a 4× CPU
throttle, about what four workers on four vCPUs cost (see [e2e-performance.md](e2e-performance.md)), after
17.5 s and 19.3 s. The test itself took 7.3 s locally. Where the 5 s go, without throttling:

- Creating the page, one task of 2.0 s. More than half of it is the 847 blocks of JSDoc HTML that
  `docs-api-text` binds through `[innerHTML]`: 750 ms of `readystatechange` and `DOMContentLoaded` events
  dispatched on the inert documents the sanitizer parses them into, and 540 ms of parsing. The rest is change
  detection.
- 631 forced layouts, 1.8 s, from `kbq-title` on the 493 links of the anchors list. Each instance measures its
  text when its `ResizeObserver` first fires, debounced in a timer of its own, and the measurement appends a
  probe span to the container and reads it back: a write and a read per anchor, so each is a layout of the
  whole page.
- Highlighting the 506 blocks once highlight.js has loaded, 0.4 s, and the change detection after it, 0.6 s,
  with 86 more forced layouts from the scrollbar track of each block measuring its viewport.

**Fix.** `test.slow()` for the core case, which triples its budget to 90 s: the assertion needs this tab,
since nothing smaller proves that the dehydrated import block of the previous tab goes away whole, and the
30 s of the docs config were sized for hydration plus one example chunk, not for a tab of this size. Nothing
in the page changed. **Verified:** the docs suite once, 42/42 with the core case at 8.1 s while the whole suite ran in
parallel on the 16-core desktop, and the two cases ×5 (10/10, core at 5.0–5.9 s), against the 90 s budget.

**`kbq-title` fixed in the same change.** The directive measured on the report its `ResizeObserver` makes for
an element it starts observing, that is once per instance on creation, and again on every resize and content
change, while nothing reads the verdict before `handleElementEnter` measures afresh and `hideTooltip` disables
the tooltip on leave. It now measures only while the pointer or the keyboard focus is on the host, both tracked
separately: a click on a hovered host reports a mouse focus origin, which hides the tooltip while the pointer
stays where it was, and the gate is re-checked when the debounce fires, since the pointer may have left in
between. Measured the same way, **with every block still rendering** (that is, before the follow-up below), forced
layouts went from 726 (2.35 s) to 95 (0.64 s, the scrollbar tracks of the 506 blocks), the main-thread time of
the navigation from 6.9 s to 4.9–5.0 s, and the test from 5.0–5.9 s to 3.6–4.9 s locally. Not enough to drop
`test.slow()`: at the 3–4.5× of a CI worker that is still 13–22 s.

**Follow-up, the same day: the code blocks render as they come into view.** The signature blocks and the code
blocks of the JSDoc are `@defer (on viewport; hydrate on hover)` blocks now, each with a placeholder that the
block's own classes lay out (`DocsApiCodePlaceholder` in `api-page.ts`, down to the table the line numbers
plugin wraps a file of several lines in), so that the page is as tall before a block renders as after and a link
to a heading lands on it; the import block stays `on immediate`. The server renders every block as before, and a
block that came from the server still hydrates on hover: the prerendered pages differ by one empty anchor comment
per block. After the navigation to the core tab 3 blocks render instead of 506, and the page has 22,500 nodes
instead of 40,800. Measured as above, on the same desktop and the same day: the main thread settles after
3.3–3.4 s instead of 4.7 s, and the import block of the previous tab goes away after 2.3 s instead of 2.8 s; at
the 4× throttle, whose runs vary widely, the main thread settles after 19–34 s in four runs (three of them
within 19–23 s) instead of 26–81 s in three, while the import block goes away after 14–24 s instead of 14–17 s.
Measured **before the `kbq-title` change above**, so its 720 forced layouts (2.4 s) are still in these numbers.
The two changes ship together and neither was measured with the other in place, so the figures of this entry
bound the committed state from either side rather than describing it: the next measurement starts from the
commit, not from these numbers. What is left is the sanitizer: the 2.1 s task that creates the page, 1.2 s of it
the sanitizer running at every visit over HTML the build generated from the repository's own JSDoc, is what the
import test waits for, and a change of its own, left for later. `test.slow()` stays until it lands.

**The trade-off of `on viewport`.** A block nobody scrolls to never renders, so an API tab reached in the app
prints its unseen blocks as the placeholder: the code is there, as text in the placeholder, without the
highlighting and the block chrome. A server-rendered visit is unaffected, and the alternative — a second
trigger such as `on idle` — would render all 506 blocks again a moment after the navigation, which is the cost
this change removes. Left as is deliberately; revisit it together with the sanitizer. **Verified:** the docs
suite once, 43/43 with the core case at 8.0 s in parallel on the 16-core desktop, and the API tab tests ×5
(30/30, core at 6.6–9.0 s), plus a test that reaches the tooltip API tab from its overview, scrolls the
signature of its enum into view and compares the height of the block with that of its placeholder.

## Follow-up, 2026-10-22

Measured against `main` at `85314215f`. Every `E2E tests` run of 2026-10-01 to 2026-10-22 (400) and the
logs of every failed job: discarding the jobs with more than ten failures (design-tokens bumps, branches
rewriting a component), a flake is a test that failed on `main` or on unrelated branches. After the switch
to zoneless change detection (`75ef67281`, 2026-10-19) the share of red runs on `main` went from 6 of 56 to
14 of 41. Eight of the fourteen were the docs `core API tab` case of the 2026-10-21 entry, which has not
failed since its fix landed (0 of 27 runs).

### The render that lands after the read

The e2e app renders without zone.js since `75ef67281`: what an action changes reaches the DOM with the change
detection the scheduler runs a task or a frame later, so a value read once right after the action is the one
from before it. Four tests failed that way, and nothing about the load reproduced it: CDP CPU throttling at
6× under 16 to 64 workers passed 480 runs of the originals, since it slows every task without changing their
order. What reproduces CI 10 times out of 10, with its exact errors, is an init script that holds back
zero-delay timers and animation frames by 100 ms once the page is set up, which pushes the change detection
past Playwright's next command. With it the originals failed 10/10 and the fixes passed 10/10.

- `scrollbar › E2eScrollbarContentChanges › … nothing reported`, both hosts, `toHaveCount(1)` received 0:
  the test scrolled before the class carrying the transform was applied, when there was nothing to scroll,
  and the bar measures again only on a scroll — so it never came. The test now waits for the class, polls
  that the viewport overflows, scrolls and polls `scrollTop` before counting.
- `textarea › should shrink…` and `should grow to maxRows…` (`150 < 150`, `90 > 90`): one `boundingBox()`
  right after the paste, while the height is written by an effect and `asapScheduler`. The height is now
  polled against the one before the paste, and the maxRows tests wait for
  `kbq-textarea_max-row-limit-reached`.
- `app-switcher › the clear button restores the full list…` (`22 < 11`): the list was counted once, on the
  render after the first typed letter. The counts are web-first assertions now.
- docs `migration guide filter › reproduces a filtered URL on reload…` (33 against 2): the steps were
  counted once after hydration, before the guide applied the range. The tests wait for
  `docs-migration-guide_ready`, which the guide sets in the task that filters.

**The guard.** ESLint now rejects `expect(await …)` in the specs and in `packages/e2e/utils`, and the 109
remaining reads were rewritten into web-first assertions or `expect.poll`; where a poll would pass on its
first sample — nothing changed, nothing arrived — the test first waits for a sign that the action landed and
then reads once into a constant. That pass found more of the same, none of them seen failing yet: the drop
indicator of `list` and the term width and `aria-valuemin` of `dl` read before the render a drag causes,
`modal`'s layout read before the scrollbar track a content change brings, `button-toggle` measuring icons
before the click had re-laid them out, `sidepanel` (WebKit) tabbing before the initial focus had landed, and
`tree-select` pressing arrow keys before the panel focused its first option.

`expect.soft(await …)` and `expect((await …).x)` still slip past the selector — 24 reads in 10 files, all
taken right after the page loads.

### `tabs › E2eTabsStates › states` — explained

Nine occurrences, three of them on `main` on 2026-10-22 and one on `20.4.x`. The two paginated strips whose
selected tab is the last one measure that label once, in the selection's `scrollCorrection` 100 ms after
the first render, and Inter 500 and the kbq-icons font are requested only by that first layout — 284 to
427 ms in the CI traces. A strip measured in the fallback faces rests at 326 px instead of 377: 35 px of
label offset, 12 of label width and 4 of the arrow, whose glyph is 4 px narrower before its font arrives,
which is why the audit above found that 51 px matched no constant. One face late gives 352. Holding the
fonts back with `page.route` reproduces CI's received image byte for byte, and the per-strip combinations
reproduce every recurring count exactly: 326 + 326 = 18746, 326 + 377 = 9379, 352 + 377 = 6529,
326 + 352 = 15896. Nothing measured again once the fonts loaded: the `ResizeObserver` watches the
fixed-width box, and content changes compare the text.

**Fix.** `KbqPaginatedTabHeader` repeats its last scroll correction and re-checks pagination on
`document.fonts` `loadingdone`, unless the user has moved the strip since — a press, the wheel or an arrow
drops the request. The scenario renders behind a trigger the spec presses after `e2eWaitForFonts`, and the
spec asserts where each paginated strip rests before the shot, so a recurrence fails on a named position.
The committed baselines already held the 377 px rest; none moved. **Verified:** 150/150 at 16 workers, and
the late-font probe now settles on the baseline.

### `datepicker` — keys faster than the timers

Two more occurrences of `scrolls back to the part the caret returns to`, now as a corrupted value:
`31.12.024` for `24.01.2024`. A digit is parsed, and the next part selected, on timers; when keys arrive
before them, `2`, `4` and `0` all go into the day (clamped to 31) and the year is left with three digits. A
scanner, an autotype or a busy page does the same to a user. The `pendingCaret` fix of the arrow keys
covered one timer of several. **Fix:** every timer a key starts goes through one queue, and a keydown first
runs what is still waiting, so each key acts on what a slow typist's would; `pendingCaret` is gone. A unit
spec types the whole date in one task (it got `31.01.2020` before the fix), and the e2e test types part by
part, polling the selection in between. `KbqTimepicker` has the same race and was left for a change of its
own.

### `input` — a step before the commit

`KbqNumberInput keyboard › should step by step and bigStep from the keyboard` got `1,5` for `10,5`, once on
`main`: typing commits the value on a timer, and ArrowUp stepped from the last committed one. In a unit spec
"10" and an immediate ArrowUp gave `0,5`. **Fix:** a step first commits a reformat still pending.

### Burn-in

A pull request now runs the specs it adds, edits or reaches through its component ten times over after
the full run (`tools/e2e/changed-specs.mjs`, at most five specs), so a test that passes only most of the
time fails on the pull request that brings it. See [06-testing.md](guides/06-testing.md).

### Unit tests

None of the 24 red `Unit tests` runs of the same window was a flake: each failed the same way on every run
of its branch. Locally the suite times out under load instead: with three runs at once, 16 to 21 tests per
run exceeded 2 s, and 291 of the 300 tests over 2 s were the first of their file, which pays the file's cold
start — the TypeScript program of a schematic, the first render. `testTimeout` is therefore 2 s on CI and
10 s locally; under the same load that gives 0 timeouts.

## Not fixed

- **`datepicker › scrolls back to the part the caret returns to`** — 1 occurrence in 99 CI runs, and it
  did not reproduce in 200 local repeats under 16 workers. The second occurrence (2026-10-08, the
  selection stuck on the month, `3,5` instead of `0,2`) gave the mechanism: an arrow key reads the
  input's `selectionStart` and sets the new selection on a timer, so a second key that arrives before
  that timer runs moves on from the old selection and lands on the same part again. Fixed in the
  input: a key moves on from the part the previous one is about to select. A unit spec presses both
  keys in one task. That fix covered one timer of several: see the 2026-10-22 follow-up.
- **`notification-center › states`** — 1 occurrence, 3831 px. Initially attributed to the scrollbar
  reveal and gated accordingly; that was wrong. A `MutationObserver` running from first paint records
  no reveal on this route at all, and `scrollToBottom()` is reachable only from a `loadingMore`
  transition the static fixture never triggers. The gate was removed rather than left in place looking
  like coverage. The real mechanism is still unknown.
- **`{projectName}` in the snapshot path template.** `sidepanel` and `scrollbar/deprecated` opt into
  WebKit with `test.use({ browserName: 'webkit' })`, but `playwright.config.ts`'s `pathTemplate` carries neither
  `{projectName}` nor `{platform}`, so 8 baselines share a flat namespace with the Chrome ones and
  inherit the `Desktop Chrome HiDPI` descriptor. `TestProject` supports both `expect` and
  `snapshotPathTemplate`, so the fix is a separate WebKit project — but that moves those baselines
  _and_ re-renders them under a Safari descriptor, which would confound the verification of the
  sidepanel fix. Separate change.

## Incidental

- `actions-panel/e2e.playwright-spec.ts` was missing an `await` on a `click()`, racing the
  screenshot that followed. Fixed.
- Three `waitForTimeout` calls were dead weight given `reducedMotion: 'reduce'` and
  `animations: 'disabled'` — `progress-bar`, `progress-spinner`, `content-panel`. Removed and verified.
- `e2eDisableResizeObserver` returned a `Promise<Disposable>` from a signature declaring
  `Promise<void>`. Nothing type-checks these files — `playwright.config.ts` only compiles them,
  without checking — so
  it compiled and failed `tsc --noEmit`. Fixed.

## Retry policy

The default is 0 everywhere, CI included: a flake fails the run and gets named rather than absorbed.
`PLAYWRIGHT_RETRIES` overrides that for a run that has to be nursed through a known flake. See
[06-testing.md](guides/06-testing.md).

This audit recommended getting there in stages: hold CI at 2, run `PLAYWRIGHT_RETRIES=0` nightly
where it fails loudly without blocking anyone, and flip the default once that had been green for a
stretch. The default was flipped directly instead, on the strength of the ×5 run above — 2810
results, 0 failures. The nightly soak never ran, so the first evidence from CI will be the pull
requests themselves.

## Reproducing this

```bash
node tools/e2e/run.js yarn playwright test packages/components --repeat-each=5
```

Retries and traces no longer need passing: the config runs at 0 retries and records
`retain-on-failure`. Failures leave the trace plus `-actual.png`, `-expected.png`, `-diff.png` under
`test-results/`.

Two things did most of the diagnostic work. The **pixel count** in `error-context.md` separates one
mechanism from another — a count that is identical across runs means a binary state rather than
rendering noise. And **`PLAYWRIGHT_WORKERS=16`** oversubscribes the machine enough to reproduce what
only CI had been seeing: `code-block` and `form-field` were both invisible at the default 8.
