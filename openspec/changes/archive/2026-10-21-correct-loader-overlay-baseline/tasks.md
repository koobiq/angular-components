# Tasks

## 1. Verification

- [ ] 1.1 Re-read the evidence for "Projected indicator": `loader-overlay.component.ts` line 74 finds the marker with `contentChild(KbqLoaderOverlayIndicator)`, which searches descendants by default, and line 112 turns it into `isExternalIndicator`; `loader-overlay.component.html` lines 2-6 then drop the default spinner and project only `<ng-content select="[kbq-loader-overlay-indicator]" />`, which matches top-level content nodes alone. Verify the delta requires the directive and the top level, and states that a nested marker leaves no indicator
- [ ] 1.2 Re-read the evidence for "Projected text": `loader-overlay.component.ts` lines 75 and 115 and `loader-overlay.component.html` lines 8-16 follow the same pattern, so a nested marked text hides the bound `text` while nothing is projected. Verify the delta says no text is rendered in that case
- [ ] 1.3 Re-read the evidence for "Projected caption": `loader-overlay.component.ts` lines 76 and 118 and `loader-overlay.component.html` lines 18-26 follow the same pattern for `caption`. Verify the delta says no caption is rendered in that case
- [ ] 1.4 Re-read the evidence for "Only marked content is rendered": the template has no wildcard `ng-content`, its three selectors match an `ngProjectAs` as well as an attribute, and each sits inside an `@if` on the matching content query. Verify the delta names `ngProjectAs` and the dependence on the marker directive
- [ ] 1.5 Run `openspec validate correct-loader-overlay-baseline --strict` and verify it reports the change as valid

## Workflow follow-up

- Archive the change with /opsx:archive.
