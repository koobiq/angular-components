# Filter Bar Name Resolver Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add runtime localization of filter-bar pipe and built-in value names through stable `nameKey` metadata and a reactive resolver, without changing filter value shapes or persistence contracts.

**Architecture:** Keep `name` as a stable string fallback and add optional serializable `nameKey` metadata. Resolve labels only in views/computed searches through a per-bar input or DI fallback. Reuse the existing pipe instances and identity rules; do not put signals or translator functions into filter data.

**Tech Stack:** Angular 21, TypeScript, Angular signals, Vitest, Playwright, MDX, ng-packagr/API Extractor.

**Spec:** `docs/superpowers/specs/2026-11-12-filter-bar-name-resolver-design.md`

## Global Constraints

- Start execution in an isolated worktree from `main`, created through `superpowers:using-git-worktrees`. Keep `origin/feat/DS-5764` unchanged as a reference; do not merge its signal-backed API or persistence implementation.
- `KbqPipe.name`, `KbqSelectValue.name`, `KbqDateTimeValue.name`, and tree node `name` remain strings. Only optional `nameKey?: string` metadata is added.
- Do not change `KbqFilterBarState`, `filter.value` shapes, select/pipe/tree identity rules, or date preset selection by stable string `name`.
- No translation-library dependency, `Observable<string>` names, signal-backed names, new ids, or public serialization helper.
- A resolver is synchronous: `KbqFilterBarNameResolver = (context) => string | null | undefined`. Input overrides DI without chaining; nullish results use `fallback`; an empty string is valid.
- Translation-only updates must not replace filter/value objects, emit `filterChange`/`onChangePipe`, or set `changed`.
- Existing custom-template contexts remain unchanged. Captions and `KbqFilter.name` are not localized by this feature.
- Public symbols use `Kbq`/`kbq`/`KBQ_` prefixes and concrete documented types. Public inputs are declared `public`; components remain OnPush.
- Unit tests follow zoneless Vitest rules: explicit change detection/stability, no `fakeAsync`/`tick`, and real change detection after signal writes.
- Documentation pages and examples are updated in English and Russian with the same structure. No hand-editing generated API/docs files.
- Use conventional local commits with scope `filter-bar` and `(#DS-5764)` in the subject. Do not push, merge, publish, or commit directly to `main` without a separate explicit request.

## Review Focus

1. **Unkeyed legacy configuration:** an application with no `nameKey` must render exactly as before and must never invoke a custom resolver — pinned by Task 2 Step 1.
2. **Open panel during translation:** query, focus, selection, expansion, and open state must survive while labels and search results update — pinned by Task 3 Step 1, Task 4 Step 1, and Task 5 Step 1.
3. **Duplicate legacy identities:** zero or multiple matches must not borrow a key or choose a label by array order — pinned by Task 2 Step 1, Task 3 Step 1, and Task 5 Step 1.
4. **Resolver precedence and unusual results:** input beats DI, nullish results fall back, empty string remains empty, and resolver context identifies all five name kinds — pinned by Task 1 Step 1 and Task 2 Step 1.
5. **Restored keyed value without a current option:** JSON/snapshot restoration must still translate from the value's own `nameKey`; unkeyed values use only a unique same-pipe template match — pinned by Task 3 Step 1 and Task 5 Step 1.

---

### Task 1: Public key metadata and resolver infrastructure

**Files:**

- Create: `packages/components/filter-bar/filter-bar-name.ts`
- Create: `packages/components/filter-bar/filter-bar-name.spec.ts`
- Modify: `packages/components/filter-bar/filter-bar.types.ts:146-180,357-374`
- Modify: `packages/components/filter-bar/filter-bar.ts:18-33,96-137`
- Modify: `packages/components/filter-bar/pipes/base-pipe.ts:28-68`
- Modify: `packages/components/filter-bar/public-api.ts:1-25`

**Interfaces:**

- Consumes: existing `KbqPipe`, `KbqPipeTemplate`, `KbqSelectValue`, `KbqDateTimeValue`, `KbqTreeSelectNode`, and `KBQ_FILTER_BAR_HOST`.
- Produces:
    - `nameKey?: string` on all source types and `KbqTreeSelectFlatNode`.
    - `KbqFilterBarNameKind = 'pipe' | 'pipe-template' | 'select-option' | 'date-preset' | 'tree-node'`.
    - `KbqFilterBarNameContext`, `KbqFilterBarNameResolver`, `KBQ_FILTER_BAR_NAME_RESOLVER`, and `kbqFilterBarNameResolverProvider(resolver)`.
    - `KbqFilterBar.nameResolver = input<KbqFilterBarNameResolver | null>(null)`.
    - `KbqFilterBar.resolveName(context: KbqFilterBarNameContext): string` (`@docs-private`).
    - Optional `KbqFilterBarHost.resolveName?(context): string`, preserving external structural mocks.
    - `KbqBasePipe.resolveName(source, kind, nameKey?)` for Tasks 2-5.

- [ ] **Step 1: Write failing resolver contract tests**

Create `filter-bar-name.spec.ts` with an actual `KbqFilterBar`, a DI resolver, an input resolver, and a context whose `key` is `'filters.status'`, `fallback` is `'Status'`, and `kind`/`pipe`/`source` describe an active pipe. Assert:

```ts
expect(filterBar.resolveName(context)).toBe('Input status');
expect(inputResolver).toHaveBeenCalledWith(context);
expect(diResolver).not.toHaveBeenCalled();

inputResolver.mockReturnValue(undefined);
expect(filterBar.resolveName(context)).toBe('Status');
inputResolver.mockReturnValue('');
expect(filterBar.resolveName(context)).toBe('');
```

Remove the input and assert the DI result. Add a compile-time/context test for each of the five kinds; for `select-option`, `date-preset`, and `tree-node`, assert `context.pipe === currentPipe` and `context.source === originalValue`. For `pipe-template`, assert both are the template.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run packages/components/filter-bar/filter-bar-name.spec.ts`
Expected: FAIL because `resolveName`, the resolver token, and the public types do not exist.

- [ ] **Step 3: Implement the public contract and base resolution seam**

In `filter-bar-name.ts`, declare the public types exactly as in the spec, the token with a root default `({ fallback }) => fallback`, and the provider helper using `useValue`. Export only these public declarations through `public-api.ts`; do not export a general name-resolution helper for custom templates.

Add `nameKey?: string` to the source interfaces/class in `filter-bar.types.ts`. In `KbqFilterBar`, inject the token, add the input, and implement:

```ts
resolveName(context: KbqFilterBarNameContext): string;
```

The method selects `this.nameResolver() ?? injectedResolver` and returns `resolver(context) ?? context.fallback`.

Add the optional host seam. In `KbqBasePipe`, inject the DI resolver and add:

```ts
protected resolveName(
    source: Exclude<KbqFilterBarNameContext['source'], KbqPipeTemplate>,
    kind: Exclude<KbqFilterBarNameKind, 'pipe-template'>,
    nameKey: string | undefined = source.nameKey
): string;
```

It returns `source.name ?? ''` for an absent/empty key; otherwise it builds the context with `pipe: this.data`, calls the optional host method or DI fallback, and applies nullish fallback. It must not mutate `source` or emit events.

- [ ] **Step 4: Run the contract tests and type check**

Run:

```bash
npx vitest run packages/components/filter-bar/filter-bar-name.spec.ts
yarn check-spec-types
```

Expected: PASS; no new `any`/`unknown` in the public resolver declarations.

- [ ] **Step 5: Commit**

```bash
git add packages/components/filter-bar/filter-bar-name.ts packages/components/filter-bar/filter-bar-name.spec.ts packages/components/filter-bar/filter-bar.types.ts packages/components/filter-bar/filter-bar.ts packages/components/filter-bar/pipes/base-pipe.ts packages/components/filter-bar/public-api.ts
git commit -m "feat(filter-bar): add name resolver contract (#DS-5764)"
```

### Task 2: Resolve common pipe labels and add-pipe text

**Files:**

- Modify: `packages/components/filter-bar/pipes/base-pipe.ts:164-251`
- Modify: `packages/components/filter-bar/pipe-add.ts:31-61,103-139`
- Modify: `packages/components/filter-bar/pipes/pipe-input.ts:13-29`
- Modify: `packages/components/filter-bar/pipes/pipe-readonly.ts:16-31`
- Modify: `packages/components/filter-bar/pipes/pipe-text.html:1-44`
- Modify pipe-name bindings only in: `pipe-select.html`, `pipe-multi-select.html`, `pipe-tree-select.html`, `pipe-multi-tree-select.html`, `pipe-date.html`, and `pipe-datetime.html`
- Test: `packages/components/filter-bar/pipes/pipe-input.spec.ts`
- Test: `packages/components/filter-bar/pipe-add.spec.ts`
- Test: `packages/components/filter-bar/filter-bar.spec.ts`

**Interfaces:**

- Consumes: Task 1 `KbqBasePipe.resolveName`, `KbqFilterBar.resolveName`, and resolver context kinds.
- Produces: `KbqBasePipe.pipeName: string` getter for all built-in templates; `KbqPipeAdd.resolveTemplateName(template: KbqPipeTemplate): string` for menu options and announcements.

- [ ] **Step 1: Write failing common-label and legacy tests**

Use a signal-backed translation record and a resolver `({ key, fallback }) => translations()[key] ?? fallback`.

In `pipe-input.spec.ts`, assert a keyed pipe updates visible placeholder and `aria-label` after `translations.set(...)` without changing the filter or emitting events. Add an unkeyed pipe and assert `resolver` is never called and its original name remains. In `filter-bar.spec.ts`, pin these legacy lookup cases:

```ts
expect(pipeNameWithOwnKey).toBe('Translated own key');
expect(pipeNameWithUniqueTemplateKey).toBe('Translated template key');
expect(pipeNameWithDuplicateTemplateMatches).toBe('Stored fallback');
expect(pipeNameWithoutTemplateMatch).toBe('Stored fallback');
expect(automaticState.pipes).toEqual([{ id: 'status', value: null }]);
```

In `pipe-add.spec.ts`, assert menu text uses kind `pipe-template`, an added pipe uses kind `pipe`, the live announcement contains the translation captured at click time, and a later locale change alone produces no announcement.

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```bash
npx vitest run packages/components/filter-bar/pipes/pipe-input.spec.ts packages/components/filter-bar/pipe-add.spec.ts packages/components/filter-bar/filter-bar.spec.ts -t "name"
```

Expected: FAIL because raw `data.name`/`template.name` is still rendered and no unique template-key lookup exists.

- [ ] **Step 3: Implement common pipe-name resolution**

Add to `KbqBasePipe`:

```ts
protected get pipeName(): string;
protected pipeNameKey(): string | undefined;
```

`pipeNameKey()` returns the pipe's own nonempty key. Otherwise it examines only templates with the same `getId()` and `type`; exactly one match supplies its key, while zero/duplicate matches return `undefined`. `pipeName` delegates to Task 1 with kind `pipe`.

Replace all built-in pipe-name, tooltip-name, input placeholder/ARIA, date popover/list ARIA bindings with `pipeName`. Leave all value/name identity bindings untouched.

- [ ] **Step 4: Implement add-pipe resolution**

Add `resolveTemplateName(template)` to `KbqPipeAdd`, constructing kind `pipe-template` with `pipe` and `source` both equal to the template. Use it in menu content and the add announcement. Preserve the existing clear-then-set live-region behavior and one-shot `openPipe` command.

- [ ] **Step 5: Run common-label tests**

Run:

```bash
npx vitest run packages/components/filter-bar/pipes/pipe-input.spec.ts packages/components/filter-bar/pipe-add.spec.ts packages/components/filter-bar/filter-bar.spec.ts packages/components/filter-bar/filter-bar-name.spec.ts
```

Expected: PASS, including no custom resolver call for unkeyed data and no state shape change.

- [ ] **Step 6: Commit**

```bash
git add packages/components/filter-bar/pipes/base-pipe.ts packages/components/filter-bar/pipe-add.ts packages/components/filter-bar/pipe-add.spec.ts packages/components/filter-bar/pipes/pipe-input.ts packages/components/filter-bar/pipes/pipe-input.spec.ts packages/components/filter-bar/pipes/pipe-readonly.ts packages/components/filter-bar/pipes/pipe-text.html packages/components/filter-bar/pipes/pipe-select.html packages/components/filter-bar/pipes/pipe-multi-select.html packages/components/filter-bar/pipes/pipe-tree-select.html packages/components/filter-bar/pipes/pipe-multi-tree-select.html packages/components/filter-bar/pipes/pipe-date.html packages/components/filter-bar/pipes/pipe-datetime.html packages/components/filter-bar/filter-bar.spec.ts
git commit -m "feat(filter-bar): localize pipe labels (#DS-5764)"
```

### Task 3: Localize select and multiselect values

**Files:**

- Modify: `packages/components/filter-bar/pipes/select-pipe-search.ts`
- Modify: `packages/components/filter-bar/pipes/pipe-select.ts`
- Modify: `packages/components/filter-bar/pipes/pipe-select.html:50-87`
- Modify: `packages/components/filter-bar/pipes/pipe-multi-select.ts`
- Modify: `packages/components/filter-bar/pipes/pipe-multi-select.html:82-119`
- Test: `packages/components/filter-bar/pipes/pipe-select.spec.ts`
- Test: `packages/components/filter-bar/pipes/pipe-multi-select.spec.ts`
- Test: `packages/components/filter-bar/filter-bar.spec.ts`
- Test: `packages/components/filter-bar/filters.spec.ts`

**Interfaces:**

- Consumes: Task 1 `resolveName(source, 'select-option', nameKey)` and Task 2 `pipeName`.
- Produces:
    - `kbqFilterSelectValueNameKey(value: KbqSelectValue, values: KbqSelectValue[] | undefined): string | undefined`.
    - `kbqFilterSelectValuesBySearch(values, search, matchCaption, resolveName)` with `resolveName: (value: KbqSelectValue) => string`.
    - `optionName(item: KbqSelectValue): string`, `displayValues(select: KbqSelect): KbqSelectValue[]`, and `displayValue(select: KbqSelect): string` in both pipe components.

- [ ] **Step 1: Write failing select/multiselect and persistence tests**

In both pipe suites, cover single and multiple selection with assertions equivalent to:

```ts
expect(optionText()).toBe('Localized option');
expect(triggerText()).toBe('Localized option');
translations.set(nextLocale);
await fixture.whenStable();
expect(optionText()).toBe('Next-locale option');
expect(triggerText()).toBe('Next-locale option');
expect(component.data.value).toBe(originalValue);
expect(filterChange).not.toHaveBeenCalled();
expect(onChangePipe).not.toHaveBeenCalled();
```

Keep the panel open with a typed query and focused option; assert the new query results follow new labels while query/focus/selection remain. Cover locked values, select-all, custom comparators, and `selectedAllEqualsSelectedNothing` with identity assertions rather than labels.

Pin custom-template behavior: no key keeps the existing trigger; a key (including a uniquely borrowed legacy key) uses the resolved selected name while the custom option content remains application-owned.

In `filter-bar.spec.ts`/`filters.spec.ts`, round-trip keyed values through automatic JSON state, explicit snapshots, and application saved filters. Assert `JSON.stringify` contains no functions and a value missing from current options still resolves from its own key. For legacy values, assert only exactly one same-pipe id match lends a key; zero/duplicate matches preserve the stored fallback.

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```bash
npx vitest run packages/components/filter-bar/pipes/pipe-select.spec.ts packages/components/filter-bar/pipes/pipe-multi-select.spec.ts packages/components/filter-bar/filter-bar.spec.ts packages/components/filter-bar/filters.spec.ts -t "name|locale|persist|restore"
```

Expected: FAIL on unresolved value labels/search and legacy key borrowing; persistence production code remains unchanged.

- [ ] **Step 3: Implement option-name metadata and reactive search**

Add `kbqFilterSelectValueNameKey`: return a nonempty own key; otherwise find candidates in the supplied current pipe values with the same existing `id`. Return the candidate key only for exactly one candidate; return `undefined` for zero/duplicates or missing id.

Extend `kbqFilterSelectValuesBySearch` with the resolver callback and match resolved names plus the existing caption behavior.

In each component add:

```ts
protected optionName(item: KbqSelectValue): string;
protected displayValues(select: KbqSelect): KbqSelectValue[];
protected displayValue(select: KbqSelect): string;
```

Use the helper with `this.values` and Task 1 kind `select-option`. Replace option text, explicit `viewValue`, highlight input, trigger, and tooltip values accordingly. Without a key, preserve the existing custom-template trigger; with one, derive the trigger from the selected value's resolved name.

`displayValues()` normally returns the selected values from `select.triggerValues`. If the committed `data.value` contains any value with its own `nameKey`, return the committed value(s) instead (the array for multiselect, a one-element array for select), so a restored keyed value remains visible even when no current option matches it. `displayValue()` resolves the first entry or returns `''`. In the multiselect template, use `displayValues(select).length` for the single-value branch and badge count; do not show missing unkeyed legacy values that were invisible before.

Replace the RxJS-only filtered-option derivation with `computed` over `searchQuery`, a `templatesVersion` signal incremented after template updates, the effective resolver, and resolver-read translation signals. Do not replace option objects or clear the search control.

- [ ] **Step 4: Run select and persistence tests**

Run:

```bash
npx vitest run packages/components/filter-bar/pipes/pipe-select.spec.ts packages/components/filter-bar/pipes/pipe-multi-select.spec.ts packages/components/filter-bar/filter-bar.spec.ts packages/components/filter-bar/filters.spec.ts
yarn check-spec-types
```

Expected: PASS. `filter-bar.ts`, `filters.ts`, and `KbqFilterBarState` require no production edits.

- [ ] **Step 5: Commit**

```bash
git add packages/components/filter-bar/pipes/select-pipe-search.ts packages/components/filter-bar/pipes/pipe-select.ts packages/components/filter-bar/pipes/pipe-select.html packages/components/filter-bar/pipes/pipe-select.spec.ts packages/components/filter-bar/pipes/pipe-multi-select.ts packages/components/filter-bar/pipes/pipe-multi-select.html packages/components/filter-bar/pipes/pipe-multi-select.spec.ts packages/components/filter-bar/filter-bar.spec.ts packages/components/filter-bar/filters.spec.ts
git commit -m "feat(filter-bar): localize select values (#DS-5764)"
```

### Task 4: Localize tree and multi-tree nodes

**Files:**

- Modify: `packages/components/filter-bar/pipes/tree-select-pipe-base.ts:1-169`
- Modify: `packages/components/filter-bar/pipes/pipe-multi-tree-select.ts:169-196`
- Modify: `packages/components/filter-bar/pipes/pipe-tree-select.html:50-100`
- Modify: `packages/components/filter-bar/pipes/pipe-multi-tree-select.html:48-127`
- Test: `packages/components/filter-bar/pipes/pipe-tree-select.spec.ts`
- Test: `packages/components/filter-bar/pipes/pipe-multi-tree-select.spec.ts`

**Interfaces:**

- Consumes: Task 1 `resolveName(sourceNode, 'tree-node')`; Task 2 `pipeName`; existing `getSourceNode(node)` and `treeControl.compareValues`.
- Produces: resolved `treeControl.getViewValue(node)` and resolved single-value tree triggers without changing tree data/value contracts.

- [ ] **Step 1: Write failing tree reactivity tests**

For single and multi trees, select leaf values, expand specific branches, open the panel, set a search query, and change the translation signal. Assert:

```ts
expect(nodeText()).toBe('Next-locale node');
expect(triggerText()).toBe('Next-locale node');
expect(selectedValues()).toEqual(originalValues);
expect(expandedValues()).toEqual(originalExpandedValues);
expect(searchControl.value).toBe(originalQuery);
expect(dataSourceIdentity()).toBe(originalDataSource);
expect(filterChange).not.toHaveBeenCalled();
```

Assert search results use the new label, custom templates still receive the original source node with its `nameKey`, the multi-tree select-all row still uses `localeConfiguration().pipe.selectAll`, and no resolver is called for unkeyed nodes. Verify the DI resolver and input override through the open overlay.

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```bash
npx vitest run packages/components/filter-bar/pipes/pipe-tree-select.spec.ts packages/components/filter-bar/pipes/pipe-multi-tree-select.spec.ts -t "name|locale|search"
```

Expected: FAIL because flat nodes expose raw names and translation changes do not reapply tree filtering.

- [ ] **Step 3: Implement tree-name propagation and reactive filtering**

In the transformer, copy `flatNode.nameKey = node.nameKey`. Change base `getViewValue` to resolve the original source node from `getSourceNode(node)` with kind `tree-node`.

Use `toSignal(this.dataSource.flattenedData, { initialValue: [] })` and an `effect` that reads every current `getViewValue(node)` and then reapplies the existing query in `untracked`. Do not assign `dataSource.data` on translation.

In the multi-tree constructor, preserve the existing initialization-order rule by patching the instance accessor:

```ts
this.treeControl.getViewValue = (node) =>
    node.value === kbqTreeSelectAllValue ? this.localeConfiguration().pipe.selectAll : this.getViewValue(node);
```

Replace raw flat-node trigger names with `treeControl.getViewValue(...)`; keep selection, expansion, locked-node, and select-all comparisons value-based. Custom template contexts remain unchanged.

- [ ] **Step 4: Run tree tests**

Run:

```bash
npx vitest run packages/components/filter-bar/pipes/pipe-tree-select.spec.ts packages/components/filter-bar/pipes/pipe-multi-tree-select.spec.ts
yarn check-spec-types
```

Expected: PASS, including overlay resolution and unchanged data source identity.

- [ ] **Step 5: Commit**

```bash
git add packages/components/filter-bar/pipes/tree-select-pipe-base.ts packages/components/filter-bar/pipes/pipe-multi-tree-select.ts packages/components/filter-bar/pipes/pipe-tree-select.html packages/components/filter-bar/pipes/pipe-tree-select.spec.ts packages/components/filter-bar/pipes/pipe-multi-tree-select.html packages/components/filter-bar/pipes/pipe-multi-tree-select.spec.ts
git commit -m "feat(filter-bar): localize tree node names (#DS-5764)"
```

### Task 5: Localize date and datetime presets

**Files:**

- Modify: `packages/components/filter-bar/pipes/pipe-date-base.ts:223-230,352-359`
- Modify: `packages/components/filter-bar/pipes/pipe-date.html:28-51`
- Modify: `packages/components/filter-bar/pipes/pipe-datetime.html:28-51`
- Test: `packages/components/filter-bar/pipes/pipe-date.spec.ts`
- Test: `packages/components/filter-bar/pipes/pipe-datetime.spec.ts`
- Test: `packages/components/filter-bar/filter-bar.spec.ts`

**Interfaces:**

- Consumes: Task 1 `resolveName(preset, 'date-preset', nameKey)` and Task 2 `pipeName`.
- Produces: `kbqDatePresetNameKey(preset, presets)` and `presetName(preset)` for trigger/list rendering; existing `[value]="item.name"` selection identity remains unchanged.

- [ ] **Step 1: Write failing date/datetime tests**

For both pipe types, select a keyed preset, open the period list, and change locale. Assert trigger/list/tooltip labels update, `data.value` and its `name` stay identical, the selected list value remains `data.value?.name`, and no change event fires.

Pin custom ranges and resolver results:

```ts
expect(customRangeTrigger()).toBe(formatRange(start, end));
expect(dateResolver).not.toHaveBeenCalledWith(expect.objectContaining({ kind: 'date-preset' }));

presetResolver.mockReturnValue('');
expect(emptyClassApplied()).toBe(true);
```

Round-trip a keyed preset through automatic state and explicit snapshots; a preset absent from current values still translates from its own key. For an unkeyed legacy preset, only exactly one same-name preset in the same pipe lends its key; zero/duplicate names retain the stored fallback. A translated name is never used as list identity.

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```bash
npx vitest run packages/components/filter-bar/pipes/pipe-date.spec.ts packages/components/filter-bar/pipes/pipe-datetime.spec.ts packages/components/filter-bar/filter-bar.spec.ts -t "name|locale|persist|restore"
```

Expected: FAIL on raw preset names and legacy key lookup.

- [ ] **Step 3: Implement preset-name resolution**

Add:

```ts
const kbqDatePresetNameKey = (
    preset: KbqDateTimeValue,
    presets: KbqDateTimeValue[] | undefined
): string | undefined;

protected presetName(preset: KbqDateTimeValue): string;
```

The key helper returns the own nonempty key, otherwise a unique existing `name` match's key, and otherwise `undefined`. `formattedValue` keeps custom-range formatting first, then calls `presetName`. `isEmpty` uses the resolved preset name so an intentionally empty resolver result is respected. Replace only preset display bindings in both templates; keep `[ngModel]="data.value?.name"` and `[value]="item.name"` unchanged.

- [ ] **Step 4: Run date and persistence tests**

Run:

```bash
npx vitest run packages/components/filter-bar/pipes/pipe-date.spec.ts packages/components/filter-bar/pipes/pipe-datetime.spec.ts packages/components/filter-bar/filter-bar.spec.ts
yarn check-spec-types
```

Expected: PASS with no added date id and no persistence production changes.

- [ ] **Step 5: Commit**

```bash
git add packages/components/filter-bar/pipes/pipe-date-base.ts packages/components/filter-bar/pipes/pipe-date.html packages/components/filter-bar/pipes/pipe-date.spec.ts packages/components/filter-bar/pipes/pipe-datetime.html packages/components/filter-bar/pipes/pipe-datetime.spec.ts packages/components/filter-bar/filter-bar.spec.ts
git commit -m "feat(filter-bar): localize date preset names (#DS-5764)"
```

### Task 6: Update runtime-localization and saved-filter documentation

**Files:**

- Modify: `packages/docs-examples/components/filter-bar/filter-bar-localization/filter-bar-localization-example.ts`
- Modify: `packages/docs-examples/components/filter-bar/filter-bar-saved-filters/filter-bar-saved-filters-example.ts`
- Modify: `packages/components/filter-bar/filter-bar.en.mdx`
- Modify: `packages/components/filter-bar/filter-bar.ru.mdx`
- Modify: `apps/docs/src/app/structure.ts` (filter-bar item only)
- Generate: `apps/docs/src/app/seo-descriptions.ts`
- Generate: `apps/docs/src/llms.txt`

**Interfaces:**

- Consumes: public `KbqFilterBarNameResolver`, `KBQ_FILTER_BAR_NAME_RESOLVER`, `kbqFilterBarNameResolverProvider`, and `[nameResolver]` from Task 1.
- Produces: consumer-facing keyed localization examples; no new library API.

- [ ] **Step 1: Rewrite the examples around stable plain data**

In the localization example, create filters/templates once. Give every pipe, option, and preset a stable English `name` and `nameKey`; tree values use their existing `value`. Define the resolver once:

```ts
protected readonly nameResolver: KbqFilterBarNameResolver = ({ key, fallback }) =>
    translations()[key] ?? fallback;
```

Bind `[nameResolver]="nameResolver"` and switch only the locale signal. Remove locale-driven `linkedSignal` reconstruction and per-label signal creation. Keep a custom tree template that reads `option.nameKey` through application-owned translation code.

In saved-filters, use the same stable period/option model and ordinary `JSON.stringify`/`JSON.parse` or `structuredClone` round trips. Remove locale-derived filter rebuilding; equality compares stable data, so a locale change does not create a reset/changed state.

- [ ] **Step 2: Document the contract in both languages**

Update both overview MDX files with matching structure:

- `name` fallback versus `nameKey`, including stable date `name` identity.
- Input-over-DI precedence, no chaining, nullish fallback, and valid empty-string result.
- A DI `useFactory` example whose resolver closes over a reactive translation source, plus the provider helper for a static resolver function.
- Synchronous/pure resolver requirement; nonreactive `translate()` alone does not update views.
- Runtime search/open-panel/state preservation and custom-template ownership.
- Legacy unique-match lookup and fallback when no confident match exists.
- No special saved-filter serialization helper.

Set `isUpdated: expiresAt('2026-11-26')` as the filter-bar item's last property in `structure.ts`.

- [ ] **Step 3: Build examples and regenerate documentation metadata**

Run sequentially:

```bash
yarn build:docs-examples
npx ngc -p apps/docs/tsconfig.app.json --noEmit
yarn check-docs-pages
yarn docs:generate-seo-descriptions
yarn docs:generate-llms
yarn check-llms
yarn check-skills
```

Expected: PASS; both locales have identical block structure, and generated files change only through their generators.

- [ ] **Step 4: Commit**

```bash
git add packages/docs-examples/components/filter-bar/filter-bar-localization/filter-bar-localization-example.ts packages/docs-examples/components/filter-bar/filter-bar-saved-filters/filter-bar-saved-filters-example.ts packages/components/filter-bar/filter-bar.en.mdx packages/components/filter-bar/filter-bar.ru.mdx apps/docs/src/app/structure.ts apps/docs/src/app/seo-descriptions.ts apps/docs/src/llms.txt
git commit -m "docs(filter-bar): document runtime name resolution (#DS-5764)"
```

### Task 7: Approve public API and run delivery gates

**Files:**

- Generate: `tools/public_api_guard/components/filter-bar.api.md`
- Modify only if a real ratchet change requires it: `tools/check-api-docs/baseline.json`
- Verify all files changed by Tasks 1-6.

**Interfaces:**

- Consumes: the complete implementation and documentation.
- Produces: reviewed public API golden data and a verified deliverable; no additional runtime behavior.

- [ ] **Step 1: Build and approve the intended public API**

Run:

```bash
yarn build:components
yarn approve-api "components/filter-bar"
yarn check-api
yarn check-public-api-any
yarn docs:api-gen
yarn check-api-docs
yarn check-typings
```

Expected: PASS. The golden file contains only the approved `nameKey`/resolver additions, with no signal-name or serialization-helper API. If API-docs reports missing descriptions, document the declarations and regenerate; do not raise the undocumented baseline to hide missing JSDoc.

- [ ] **Step 2: Run unit, type, and lint gates**

Run sequentially:

```bash
yarn styles:build-all
yarn unit:components
yarn unit:tools
yarn check-spec-types
yarn check-e2e-types
yarn eslint
yarn prettier
yarn cspell
yarn check-docs-pages
```

Expected: PASS with zero warnings/errors and no unrelated edits. Keep generated test output out of the commit.

- [ ] **Step 3: Exercise component visuals in the Linux environment**

Run: `yarn e2e:docker yarn playwright test packages/components/filter-bar`
Expected: all filter-bar Playwright tests PASS with no screenshot baseline changes. Investigate any text/layout diff as a regression; do not approve snapshots merely because labels were intended to change.

- [ ] **Step 4: Build and smoke-test the documentation**

From the worktree, run the docs chain sequentially (no parallel heavy builds):

```bash
yarn build:components-experimental
yarn build:angular-luxon-adapter
yarn build:angular-moment-adapter
yarn build:tokens:data
yarn build:docs-examples-module
yarn build:package-docs-content
yarn build:docs-examples
yarn docs:build
yarn e2e:docs
```

Expected: production prerender and docs smoke tests PASS with no builder warnings.

- [ ] **Step 5: Verify the original DS-5764 scenario end to end**

Serve the filter-bar dev/docs example and, in the browser, select values in select, multiselect, tree/multi-tree, and date/datetime; open panels and enter searches before switching locale. Confirm labels translate without closing panels or clearing searches/selection, no new changed/reset state appears, and a JSON-saved filter restores the current translation. Stop the server after verification.

Expected: the original runtime-localization scenario passes without recreating `filter` or `pipeTemplates`.

- [ ] **Step 6: Review and record generated API changes**

Run:

```bash
git status --short
git diff --check
git diff --stat
```

Expected: only intended source/docs/generated files are present; no logs, test results, snapshots, or stale signal-name artifacts. Commit the API golden change separately if it is not already committed:

```bash
git add tools/public_api_guard/components/filter-bar.api.md
git commit -m "feat(filter-bar): record name resolver API (#DS-5764)"
```
