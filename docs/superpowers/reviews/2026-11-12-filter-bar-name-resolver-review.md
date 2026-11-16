# Review — PR #2371 `feat(filter-bar): add nameKey and name resolver for runtime localization (#DS-5764)`

- **Area:** `packages/components/filter-bar`, docs examples, API golden
- **Base / head:** `21cb5d3e3` (main) → `cfcae043e`
- **Diff:** 40 files, +3681/−240 (5290 diff lines)
- **Verdict:** Request changes
- **Method:** high-effort review. 10 named finder agents (6 territory chunks + issue-fidelity + cross-file + test-coverage + build-tests); 3 agents required `resume` after `Allocated quota exceeded`. Verification and reverse-audit performed inline by the orchestrator (quota-constrained deviation).

## Findings

### P2

#### F-1 — Non-localized `aria-label` in the datetime pipe (a11y)

- **confidence:** high (3 independent agents + orchestrator re-read)
- **locations:** `packages/components/filter-bar/pipes/pipe-datetime.html:35` (cf. `pipe-date.html:35`)
- **failureScenario:** screen reader opens the datetime preset list → announces raw `data.name` instead of localized `pipeName`.
- **evidence:** `pipe-date.html:35` is `[attr.aria-label]="pipeName"`; `pipe-datetime.html:35` is still `[attr.aria-label]="data.name"`.
- **fix:** replace with `[attr.aria-label]="pipeName"`.

#### F-2 — `displayValues` in multi-select leaks stale unkeyed values

- **confidence:** high
- **locations:** `packages/components/filter-bar/pipes/pipe-multi-select.ts:311-318`
- **failureScenario:** restored filter holds `[unkeyedStale, keyedRestored]` where `unkeyedStale` has no current option → `committed.some(v => v.nameKey)` is true → entire committed array is returned → trigger/badge show a value whose option disappeared. Contradicts the JSDoc "Missing unkeyed legacy values stay invisible".
- **evidence:** `return committed;` on any-keyed; single-select (`pipe-select.ts:140-146`) returns committed only when `committed?.nameKey`.
- **fix:** show keyed committed values plus only those unkeyed values still present in `select.triggerValues`.

### P3

#### F-3 — `pipeNameKey()` borrows a key on duplicate id+type

- **confidence:** high
- **locations:** `packages/components/filter-bar/pipes/base-pipe.ts:390-394`
- **failureScenario:** two templates share `getId()`+`type`, one with `nameKey`, one without → `withKey.length === 1` → key borrowed although the JSDoc promises "duplicate matches return undefined".
- **evidence:** `matches` captures both duplicates; `withKey = matches.filter(t => t.nameKey)` drops the empty one before the uniqueness check.
- **fix:** `return matches.length === 1 ? matches[0].nameKey : undefined;`.

#### F-4 — select-all sentinel branch in multi-tree-select untested

- **confidence:** high
- **locations:** `packages/components/filter-bar/pipes/pipe-multi-tree-select.ts:197-201`; `pipe-multi-tree-select.spec.ts`
- **failureScenario:** breakage of the `node.value === kbqTreeSelectAllValue` guard is not caught — no test creates a `selectAll: true` template.

#### F-5 — dead `#treeOption` template in the localization example

- **confidence:** high
- **locations:** `packages/docs-examples/components/filter-bar/filter-bar-localization/filter-bar-localization-example.ts:68-71` (declared), `:199-218` (tree pipes without `valueTemplate`)
- **failureScenario:** the custom tree template that demonstrates `option.nameKey` is never rendered.

#### F-6 — `resolveTemplateName` early-return untested

- **confidence:** medium
- **locations:** `packages/components/filter-bar/pipe-add.ts:160-164`; `pipe-add.spec.ts:598-713`
- **failureScenario:** regression in `if (!nameKey) return fallback` is not caught — all pipe-add name tests use keyed templates.

### P4 (hygiene)

- JSDoc "Optional key" vs required `key: string` — `filter-bar-name.ts:22-23`.
- DI fallback in pipes is unreachable with a real `KbqFilterBar` (defensive `??`, by design).
- Triple `KBQ_FILTER_BAR_NAME_RESOLVER` injection — `base-pipe.ts:59`, `pipe-add.ts:75`, `filter-bar.ts:158`.
- `computed filteredOptions` tracks only `templatesVersion`, not `this.values` — `pipe-select.ts:82-91`.
- Empty-string key inconsistency: `kbqFilterSelectValueNameKey` can return `""` while `displayValue` treats it as "no key" — `select-pipe-search.ts:19` / `pipe-select.ts:155`.
- Tree `effect` reads `getViewValue` not via `treeControl.getViewValue` — `tree-select-pipe-base.ts:80-84`.
- O(n) resolver calls per `flatNodes` emission — accepted in the design ("no per-key caching/memoization initially").
- `displayValues` called up to 3× per CD; double scan of `values` in `displayValue`.
- `defaultFilter` in saved-filters example became a getter (allocation per access) — `filter-bar-saved-filters-example.ts:176-178`.

## Tests / build

- `npx vitest run packages/components/filter-bar` — 757/757 passed (14 files), no regression.
- `yarn check-spec-types` — fails on **pre-existing** errors in `packages/components/core/formatters/date/` (TS2344/TS2554, outside the diff; likely from #DS-1229 on main). Not a PR regression.
- `yarn check-api` — skipped (`dist/components/types` absent in the main checkout; no build run).

## Not verified

Playwright visual (`e2e:docker`), `docs:build`/`e2e:docs`, manual locale-switch scenario, full `unit:components`.
