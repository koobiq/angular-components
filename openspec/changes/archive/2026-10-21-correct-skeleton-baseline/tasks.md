# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/skeleton/spec.md`.

## 1. Verify the corrections

- [ ] 1.1 "Styles load on their own": in `packages/components/skeleton/skeleton.ts`, verify that the constructor of `KbqSkeleton` is the only caller of `_CdkPrivateStyleLoader.load(SkeletonStyleLoader)`, whose `styleUrls` hold `skeleton-presets.scss`; in `skeleton-presets.ts`, verify that no layout preset host injects the loader, that `range()` gives no index for a count of 0, and that `kbq-skeleton-tabs` renders its `kbq-skeleton-typography` only as the fallback of `ng-content`
- [ ] 1.2 Run `openspec validate correct-skeleton-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirement into `openspec/specs/skeleton/spec.md`.
