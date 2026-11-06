# filter-bar-value-template Example Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show `valueTemplate` in all four filter-bar pipe types (`select`, `multiselect`, `tree-select`, `multi-tree-select`) in one renamed, searchable example, and align the `tree-select` template context with `multi-tree-select`.

**Architecture:** Two family templates in the renamed example `filter-bar-value-template`: a flat one for `select`/`multiselect` (no `search` in their context, no highlight) and the existing rich tree one for `tree-select`/`multi-tree-select` (source node + `search`). The single `tree-select` pipe is taught to pass the same context as `multi-tree-select` — this API is new in this PR and unreleased, so the change is safe.

**Tech Stack:** Angular standalone components, Vitest, Yarn 4, generated docs-examples loader/module.

**Spec:** `docs/superpowers/specs/2026-11-05-filter-bar-value-template-example-design.md`

## Global Constraints

- Conventional commits, scope `filter-bar`, tracker `(#DS-5454)` in the subject, header ≤ 120 chars.
- Prettier: 120 columns, 4-space indent, single quotes, no trailing commas; run ESLint/Prettier on changed files.
- Never hand-edit `packages/docs-examples/example-module.ts` or `packages/docs-examples/loader/index.ts` — regenerate with `yarn run build:docs-examples-module`.
- With a `valueTemplate`, search matches only `name` (existing behavior; keep it and keep it documented).
- The dev app does NOT reference this example (`components-dev/filter-bar/module.ts` has no `value-template` selector) — do not touch it; manual verification is on the docs site or by adding the example locally without committing.

## Review Focus

- `search` is `null` on first open: the tree template must render the plain name without a `<mark>` — pinned by Task 1, step 1 test (second assertion).
- Branch (expandable) nodes also go through the value template: `getSourceNode` must resolve for parents, not only leaves — pinned by Task 1, step 1 test (branch assertion).
- `tree-select` options keep `viewValue` = `node.name` after the context change (trigger and type-ahead unaffected) — pinned by the existing `should keep the caption out of the trigger and type-ahead label` test, rerun in Task 1, step 4.
- A caption-only query with a `valueTemplate` returns nothing (documented behavior) — covered by the existing `should let valueTemplate own the node content and hide the caption from search` test, rerun in Task 1, step 4.
- The generated loader must contain the new example id or the docs page fails only at runtime — pinned by Task 2, step 4 (`Grep` for `filter-bar-value-template` in `packages/docs-examples/loader/index.ts` and `example-module.ts`).

---

### Task 1: Align the `tree-select` value-template context

**Files:**

- Modify: `packages/components/filter-bar/pipes/pipe-tree-select.html` (the `@if (isTemplateRef(valueTemplate))` branch of `#nodeContent`)
- Test: `packages/components/filter-bar/pipes/pipe-tree-select.spec.ts`

**Interfaces:**

- Consumes: `getSourceNode(node)` and `searchControl` from `KbqTreeSelectPipeBase` (`tree-select-pipe-base.ts:121,29`).
- Produces: value-template context `{ $implicit: KbqPipeTreeSelectComponent, option: KbqTreeSelectNode, search: string | null }` — same shape as `KbqMultiTreeSelectValueTemplateContext` (`pipe-multi-tree-select.ts:197`). The example in Task 2 relies on `option` being the SOURCE node (custom fields) and on `search`.

- [ ] **Step 1: Extend the failing test**

In `pipe-tree-select.spec.ts`, in the `option content` describe: add a custom field to the `threat` node of `CAPTIONED_TREE_DATA` (declare the array with a local interface extending `KbqTreeSelectNode` with `badge?: string`) and extend the test component's `optionTemplate` to print it and the query:

```html
<ng-template #optionTemplate let-option="option" let-pipe let-search="search">
    <span class="custom-tree-option">{{ option.name }} / {{ option.caption }} / {{ pipe.data.id }}</span>
    <span class="custom-tree-option__badge">{{ option.badge }}</span>
    <span class="custom-tree-option__search">{{ search }}</span>
</ng-template>
```

In `should let valueTemplate own the node content and hide the caption from search`, after the existing assertions add:

```ts
expect(option.getHostElement().querySelector('.custom-tree-option__badge')!.textContent).toBe('B1');

// No query yet: the search context is null and renders empty.
expect(option.getHostElement().querySelector('.custom-tree-option__search')!.textContent).toBe('');

getPipeComponent().searchControl.setValue('Threat');
await vi.runOnlyPendingTimersAsync();
fixture.detectChanges();

expect(getOption('threat').getHostElement().querySelector('.custom-tree-option__search')!.textContent).toBe('Threat');

// The branch node also receives the source node and the query.
expect(getOption('events').getHostElement().querySelector('.custom-tree-option__search')!.textContent).toBe('Threat');
```

(with `badge: 'B1'` on the `threat` node; keep the existing caption-search assertion at the end).

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run packages/components/filter-bar/pipes/pipe-tree-select.spec.ts -t "should let valueTemplate own"`
Expected: FAIL — badge and search render empty (flat node has no `badge`, context has no `search`).

- [ ] **Step 3: Implement the context change**

In `pipe-tree-select.html`, `#nodeContent`, the value-template outlet becomes:

```html
<ng-container
    [ngTemplateOutlet]="$any(valueTemplate)"
    [ngTemplateOutletContext]="{ $implicit: this, option: getSourceNode(node), search: searchControl.value }"
/>
```

- [ ] **Step 4: Run the whole spec**

Run: `npx vitest run packages/components/filter-bar/pipes/pipe-tree-select.spec.ts packages/components/filter-bar/pipes/pipe-multi-tree-select.spec.ts`
Expected: all PASS, including `should keep the caption out of the trigger and type-ahead label` and the caption-search tests.

- [ ] **Step 5: Commit**

```bash
git add packages/components/filter-bar/pipes/pipe-tree-select.html packages/components/filter-bar/pipes/pipe-tree-select.spec.ts
git commit -m "fix(filter-bar): align tree-select value template context with multi-tree-select (#DS-5454)"
```

### Task 2: Rename and expand the example

**Files:**

- Rename: `packages/docs-examples/components/filter-bar/filter-bar-multi-tree-select-value-template/` → `packages/docs-examples/components/filter-bar/filter-bar-value-template/` (`git mv`, both files)
- Modify: `filter-bar-value-template-example.ts`, `filter-bar-value-template-example.scss` (renamed from `...-multi-tree-select-...`)
- Modify: `packages/docs-examples/components/filter-bar/index.ts` (import + module arrays, 3 spots)
- Regenerate: `packages/docs-examples/example-module.ts`, `packages/docs-examples/loader/index.ts`

**Interfaces:**

- Consumes: Task 1's context (`option` = source node, `search`) for the tree template. Flat pipes (`select`/`multiselect`) pass `{ $implicit, option: KbqSelectValue }` with custom fields intact and no `search`.
- Produces: example id `filter-bar-value-template`, class `FilterBarValueTemplateExample`, selector `filter-bar-value-template-example` — used by Task 3's mdx.

- [ ] **Step 1: Rename the folder and files**

```bash
git mv packages/docs-examples/components/filter-bar/filter-bar-multi-tree-select-value-template packages/docs-examples/components/filter-bar/filter-bar-value-template
git mv packages/docs-examples/components/filter-bar/filter-bar-value-template/filter-bar-multi-tree-select-value-template-example.ts packages/docs-examples/components/filter-bar/filter-bar-value-template/filter-bar-value-template-example.ts
git mv packages/docs-examples/components/filter-bar/filter-bar-value-template/filter-bar-multi-tree-select-value-template-example.scss packages/docs-examples/components/filter-bar/filter-bar-value-template/filter-bar-value-template-example.scss
```

- [ ] **Step 2: Rewrite the example component**

In `filter-bar-value-template-example.ts`: class `FilterBarValueTemplateExample`, selector and `@title` `filter-bar-value-template`, `styleUrls: ['filter-bar-value-template-example.scss']`. Four pipes, all with `search: true`, `cleanable: false, removable: false, disabled: false`:

- `Select` (`KbqPipeTypes.Select`) and `MultiSelect` (`KbqPipeTypes.MultiSelect`): `values` = flat agent-state values (`KbqSelectValue` with `icon?`, `color?`, `count?` — same domain as the tree data: installed versions and errors), `valueTemplate: this.flatOptionTemplate()`.
- `Tree` (`KbqPipeTypes.TreeSelect`) and `Multi tree` (`KbqPipeTypes.MultiTreeSelect`): existing `values`, `valueTemplate: this.optionTemplate()`, `multilineOptions: true` (keep `panelMaxHeight: 480` on multi tree).
- `activeFilter.pipes` mirrors the four with `value: null` (`value: []` for multi select), `search: true`, `selectAll: true` only on multi tree (as today).

Templates: keep the existing tree `#optionTemplate` (icon/color/name with `kbqHighlightBackground: search`/count) and add a flat one without highlight:

```html
<ng-template #flatOptionTemplate let-option="option">
    <div class="example-tree-node">
        @if (option.icon) {
        <i class="example-tree-node__icon" aria-hidden="true" [kbq-icon]="option.icon" [color]="option.color"></i>
        }
        <span class="example-tree-node__name">{{ option.name }}</span>
        @if (option.count !== undefined) {
        <span class="example-tree-node__count">{{ option.count }}</span>
        }
    </div>
</ng-template>
```

Add `readonly flatOptionTemplate = viewChild<TemplateRef<any>>('flatOptionTemplate');`. Reuse the existing SCSS classes; rename them only if the builder prefers `example-option` over `example-tree-node` (update both templates then).

- [ ] **Step 3: Update `packages/docs-examples/components/filter-bar/index.ts`**

Replace the `FilterBarMultiTreeSelectValueTemplateExample` import path/name and its occurrences in the module arrays with `FilterBarValueTemplateExample` from `./filter-bar-value-template/filter-bar-value-template-example`.

- [ ] **Step 4: Regenerate and verify**

```bash
yarn run build:docs-examples-module
yarn run build:docs-examples
```

Expected: both succeed; `filter-bar-value-template` is present in `packages/docs-examples/loader/index.ts` and `example-module.ts`, the old id is gone.

- [ ] **Step 5: Commit**

```bash
git add packages/docs-examples
git commit -m "feat(examples): demonstrate valueTemplate in all select pipes (#DS-5454)"
```

### Task 3: Documentation and final verification

**Files:**

- Modify: `packages/components/filter-bar/filter-bar.en.mdx:48-54` and the matching block in `filter-bar.ru.mdx`
- Possibly regenerate: `apps/docs/src/llms.txt` and `dist/docs-llms` via `docs:generate-llms`

**Interfaces:**

- Consumes: example id `filter-bar-value-template` from Task 2.

- [ ] **Step 1: Rewrite the mdx section (en + ru)**

Section title «Custom option content» / «Кастомное содержимое опций». Body, one short paragraph + one context paragraph, e.g. en:

> For `select`, `multiselect`, `tree-select` and `multi-tree-select`, set `valueTemplate` to customize option content. Flat pipes receive the source value as `option`; tree pipes receive the source node as `option` and the current query as `search`. Use them to render icons, multiline text, counters or other Angular content.
>
> Filtering still uses only `name`. Tree templates highlight matches with `kbqHighlightBackground` applied to `option.name` and `search`; flat templates have no query in their context. Select-all, selected values and the text-only trigger keep their standard behavior. Set `multilineOptions` to wrap long names instead of truncating them. Multiline rows are taller than 32px, so fewer of them fit under `panelMaxHeight`.

Russian mirrors this wording. Replace `<Example id="filter-bar-multi-tree-select-value-template" />` with `<Example id="filter-bar-value-template" />`. Keep the «Caption in options» note about name-only search as is.

- [ ] **Step 2: Docs checks**

```bash
yarn run docs:generate-llms
yarn run check-llms
npx cspell --no-progress packages/components/filter-bar/filter-bar.en.mdx packages/components/filter-bar/filter-bar.ru.mdx
```

Expected: all pass; commit regenerated files if any changed.

- [ ] **Step 3: Full verification**

```bash
yarn run unit:components
yarn run check-spec-types
npx eslint packages/components/filter-bar/pipes/pipe-tree-select.html packages/components/filter-bar/pipes/pipe-tree-select.spec.ts packages/docs-examples/components/filter-bar --max-warnings=0
npx prettier --check packages/components/filter-bar/filter-bar.en.mdx packages/components/filter-bar/filter-bar.ru.mdx packages/docs-examples/components/filter-bar
```

Expected: all green.

- [ ] **Step 4: Commit**

```bash
git add packages/components/filter-bar/filter-bar.en.mdx packages/components/filter-bar/filter-bar.ru.mdx apps/docs/src/llms.txt docs/superpowers
git commit -m "docs(filter-bar): describe valueTemplate for all select pipes (#DS-5454)"
```

- [ ] **Step 5: Manual check with the user**

Serve the example (docs dev or a temporary local mount), confirm: search filters all four pipes; tree pipes highlight the query in the custom template; icons/counters render in all four; trigger shows names only. Do not commit any temporary mounting code.
