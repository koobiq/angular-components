# Tasks

## 1. Verification

- [ ] 1.1 Re-read the evidence for "One hidden line is shown instead of a toggle": in `clamped-text.ts` the resize subscription (lines 153-160) is the only caller of `updateToggleVisibilityState` (lines 181-184), the only writer of `hasToggleState`, while `rows` (line 90) only feeds the line clamp (line 54) and the comparison; verify the delta ties the rule to the latest measurement and says a change of `rows` or of the content that keeps the box size is not measured
- [ ] 1.2 Re-read the evidence for "Collapsed state of the clamped text": `collapsedState` (lines 130-134) is `hasToggle() && collapsed` once measured, so with `isCollapsed` unset text whose `rows` drops without a resize keeps the state of the previous measurement; verify the delta describes the default as collapsed whenever the latest measurement found the content overflowing
- [ ] 1.3 Run `openspec validate correct-clamped-text-baseline --strict` and verify it reports the change as valid

## Workflow follow-up

- Archive the change with /opsx:archive.
