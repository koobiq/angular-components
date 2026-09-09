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

## Not fixed

- **`datepicker › scrolls back to the part the caret returns to`** — 1 occurrence in 99 CI runs, and it
  did not reproduce in 200 local repeats under 16 workers. No mechanism established, so nothing was
  changed. Left for the next occurrence, which will now be visible rather than absorbed.
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
- **91 `expect(await …)` reads** that take a computed style or geometry once, with no retry, right
  after an action that settles asynchronously. Concentrated in `list` (24) and `button-toggle` (18).
  None has been observed failing.

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

`PLAYWRIGHT_RETRIES` now overrides the config; the default is unchanged at `isCI ? 2 : 0`. See
[06-testing.md](guides/06-testing.md).

Keep CI at 2 until this has ridden a few weeks of real runs. Then run `PLAYWRIGHT_RETRIES=0` nightly,
where it fails loudly without blocking anyone, and move the default to 0 once that has been green for
a stretch.

## Reproducing this

```bash
PLAYWRIGHT_RETRIES=0 node tools/e2e/run.js \
  yarn playwright test packages/components --repeat-each=5 --trace=retain-on-failure
```

Traces have to be asked for explicitly: the config captures them `on-first-retry`, which never happens
when there are none. Failures leave `-actual.png`, `-expected.png`, `-diff.png` under `test-results/`.

Two things did most of the diagnostic work. The **pixel count** in `error-context.md` separates one
mechanism from another — a count that is identical across runs means a binary state rather than
rendering noise. And **`PLAYWRIGHT_WORKERS=16`** oversubscribes the machine enough to reproduce what
only CI had been seeing: `code-block` and `form-field` were both invisible at the default 8.
