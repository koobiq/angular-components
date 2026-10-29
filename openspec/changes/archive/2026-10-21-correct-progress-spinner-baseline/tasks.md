# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/progress-spinner/spec.md`.

## 1. Verify the corrections

- [ ] 1.1 "Determinate arc follows the value": in `packages/components/progress-spinner/progress-spinner.component.html`, verify that the circle binds `stroke-dashoffset` straight from `dashOffsetPercent()`; in `progress-spinner.scss`, verify that `.kbq-progress-spinner__circle` declares `transition: stroke-dashoffset 0.3s`, which only the `kbq-animations-off()` mixin removes
- [ ] 1.2 "Non-numeric values read as zero": in `progress-spinner.component.ts`, verify that the `value` transform is `numberAttribute(value, 0)`, and in the bundled source of `@angular/core` that `numberAttribute` returns `Number(value)` whenever both `parseFloat(value)` and `Number(value)` are numbers, which holds for `[40]` and fails for `{}`
- [ ] 1.3 "Indeterminate arc ignores the value": in `progress-spinner.scss`, verify that the rotation of `.kbq-progress-spinner_indeterminate .kbq-progress-spinner__inner` is dropped by `kbq-animations-off()` (the `kbq-animations-disabled` class bound from `kbqAnimationsDisabled()`, and `prefers-reduced-motion: reduce`), while its `stroke-dashoffset: 80%` stays
- [ ] 1.4 "Text and caption next to the circle": in `progress-spinner.component.html`, verify that the only `ng-content` slots are `[kbq-progress-spinner-text]` and `[kbq-progress-spinner-caption]`, with no catch-all slot, and in the `controlFlowPreventingContentProjection` diagnostic of `@angular/compiler-cli` that a control-flow block with several root nodes is not projected into a specific slot
- [ ] 1.5 Run `openspec validate correct-progress-spinner-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirements into `openspec/specs/progress-spinner/spec.md`.
