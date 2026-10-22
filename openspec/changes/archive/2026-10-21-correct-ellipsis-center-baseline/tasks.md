# Tasks

## 1. Verification

- [ ] 1.1 Re-read the evidence for "Tail length follows the host width and the glyph width": `refresh()` in `ellipsis-center.directive.ts` lines 206-220 takes `g` as `Math.max(charWidth, textWidth / length)`, rounds `W / 2 / g` and clamps the split index to `[1, length - 1]`, so `charWidth` `14` against a 150 px host and a 60-character, 420 px text gives a 5-character tail and `7.1` gives the same 11 as the measurement; verify the delta states the rounding and clamp and carries the worked scenarios
- [ ] 1.2 Re-read the evidence for "Tooltip does not capture the pointer by default": `ignoreTooltipPointerEvents` in `ellipsis-center.directive.ts` line 76 defaults to `true`, `createOverlay` in `tooltip.component.ts` lines 1154-1161 computes the panel classes of lines 1227-1240 only while no overlay exists, and `createOverlay` and `detach` in `pop-up-trigger.ts` lines 548-551 and 521-544 reuse the detached overlay; verify the delta states that the value is read once and carries the two new scenarios
- [ ] 1.3 Re-read the evidence for "Full text stays available to assistive technology": `describeTrigger` in `tooltip.component.ts` lines 1249-1262 skips the host only when `describesHostText` in lines 1293-1295 finds the trimmed content equal to the host's trimmed `textContent`, while `refresh()` in `ellipsis-center.directive.ts` lines 168-183 and 235-236 keeps other children of the host beside the halves; verify the delta adds that condition and its new scenario
- [ ] 1.4 Run `openspec validate correct-ellipsis-center-baseline --strict` and verify it reports the change as valid

## Workflow follow-up

- Archive the change with /opsx:archive.
