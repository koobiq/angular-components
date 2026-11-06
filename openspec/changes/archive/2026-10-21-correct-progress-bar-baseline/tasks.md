# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/progress-bar/spec.md`.

## 1. Verify the corrections

- [ ] 1.1 "Indeterminate fill sweeps across the track": in `packages/components/progress-bar/progress-bar.scss`, verify that the `kbq-progress-bar-indeterminate` keyframes go from `translateX(-100%) scaleX(1)` to `translateX(400%) scaleX(1.6)`, that the fill is `25%` wide with `transform-origin: top left`, and that no rule depends on the text direction; in `e2e.playwright-spec.ts`, verify that the sweep test samples a left-to-right page only
- [ ] 1.2 Run `openspec validate correct-progress-bar-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirement into `openspec/specs/progress-bar/spec.md`.
