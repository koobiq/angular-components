# Tasks

## 1. Verification

- [ ] 1.1 Re-read the evidence for "Menu opens toward the start": the `before` entry of `xPositions` in `dropdown-trigger.directive.ts` lines 110-112 and the four positions it passes in lines 805-830, the position strategy built without `withFlexibleDimensions(false)` in lines 729-740, and the flexible-fit selection in the `_overlay-module-chunk.mjs` bundle of `@angular/cdk` 21.2.14, lines 1094, 1146-1203 and 1404-1414, where a position that fits only flexibly can win over the fallback; check `__screenshots__/05-light.png`, where the fallback fits and is taken; verify the delta's scenario requires the menu to fit toward the end
- [ ] 1.2 Re-read the evidence for "Menu width follows the trigger by default": `kbqResolvePanelWidth` in `core/overlay/panel-width.ts` lines 104-117 (an explicit `panelWidth` returns that width with an empty `minWidth`), `panelMinWidthToken` in `dropdown.component.ts` lines 260-266 (`0px` for an explicit width) and the panel `min-width` rule in `dropdown.scss` line 43; check the unit test "should fall back to the default minimum when panelAutoWidth is false" still matches the "Narrow trigger" scenario; verify the delta limits the floor to the default and `'auto'` `panelWidth`
- [ ] 1.3 Run `openspec validate correct-split-button-baseline --strict` and verify it reports the change as valid

## Workflow follow-up

- Archive the change with /opsx:archive.
