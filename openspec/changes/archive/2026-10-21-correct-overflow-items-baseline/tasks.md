# Tasks

## 1. Verification

- [ ] 1.1 Re-read the evidence for "Hiding overflowing items from the end": `hasOverflown` in `overflow-items.ts` line 361 returns the cross-axis check alone when `wrap` is `'wrap'`, and the e2e test "should render all items if fit in cross axis" (`e2e.playwright-spec.ts` lines 50-56, fixture `overflowItems_wrapFit` in `e2e.ts` line 141) expects no hidden item for twenty 50 px items in a 500 px container; verify the delta limits the main-axis rule to `wrap` other than `'wrap'`
- [ ] 1.2 Re-read the evidence for "Always-visible items": the recalculation triggers in `overflow-items.ts` lines 270-275 do not include `alwaysVisible`, and an item's hidden state changes only in `hide()` and `show()` (lines 61-76, 119-124) called from `getHiddenItems` (lines 316-327); verify the delta scopes the guarantee to a recalculation
- [ ] 1.3 Re-read the evidence for "Vertical orientation": the vertical `isCrossAxisExceeded` in `overflow-items.ts` line 246 compares `scrollWidth` with `clientWidth`, and line 361 uses it instead of the height measurement when `wrap` is `'wrap'`; verify the delta states both cases
- [ ] 1.4 Run `openspec validate correct-overflow-items-baseline --strict` and verify it reports the change as valid

## Workflow follow-up

- Archive the change with /opsx:archive.
