# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/accordion/spec.md`.

## 1. Verify the corrections

- [ ] 1.1 "Controlled value": in `packages/components/accordion/accordion.ts`, verify that `valueArray` keeps only the first non-empty value outside multiple mode and that the `valueInput` effect notifies it only when the binding changes; then verify that `restoreState(false)`, run from `ngAfterContentChecked` after a key change, returns the bound value from `initialValue()` and notifies it again
- [ ] 1.2 "Unusable saved payloads": in `normalizeAccordionState()` in `accordion.ts`, verify that an array keeps its string entries and is rejected only when none is a string and it is not empty, and that an object is accepted when at least one entry has a boolean `expanded` and a string `value`, the other entries being dropped
- [ ] 1.3 "Changing the state saving key": in `accordion.ts`, verify that `initialValue()` returns the bound value before it reads the saved state, so with `value` bound a key change neither restores the new key's state nor keeps the items as the user left them
- [ ] 1.4 Run `openspec validate correct-accordion-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirements into `openspec/specs/accordion/spec.md`.
