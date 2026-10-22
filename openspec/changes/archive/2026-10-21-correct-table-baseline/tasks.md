# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/table/spec.md`; all paths are under `packages/components/table/`.

## 1. Verify the corrections

- [ ] 1.1 "The pinned header publishes its height": verify in `table.component.ts` that the `effect()` in the constructor reads only the `stickyHeader` signal, that it takes the `<thead>` from `tHead` as a plain DOM read when it runs, and that nothing else re-runs it, so a `<thead>` added, removed or replaced while `stickyHeader` stays on is not observed until `stickyHeader` turns off and on again
- [ ] 1.2 "The height is published only while the header is pinned": verify in `table.component.ts` that the height is reset to `null` only when that `effect()` runs without `stickyHeader`, without a `<thead>` or off the browser platform, and that the subscription to the observed `<thead>` ends only in the effect's cleanup, so removing the `<thead>` while `stickyHeader` stays on leaves the property and the observation in place
- [ ] 1.3 Run `openspec validate correct-table-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirements into `openspec/specs/table/spec.md`.
