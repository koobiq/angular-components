# Filter Bar Signal-Backed Names Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow every built-in filter-bar pipe and value name to be a string or `Signal<string>`, updating translations without replacing filter state.

**Architecture:** Resolve a shared `KbqFilterBarName` union at the reactive rendering boundary and keep stable ids separate from labels. Centralize signal-aware cloning, serialization and template-based value rehydration so automatic persistence, explicit snapshots and application-owned saved filters all follow the same rules.

**Tech Stack:** Angular 21 signals and templates, TypeScript, RxJS, Vitest/jsdom, MDX documentation.

**Spec:** `docs/superpowers/specs/2026-11-11-filter-bar-signal-names-design.md`

## Global Constraints

- Do not translate `KbqFilter.name`; it remains user-owned string data.
- A translation change updates only rendering: no filter/pipe/value replacement, `filterChange`, `onChangePipe`, or changed-flag update.
- Signal-named pipes, select values and date presets require stable `id: string | number`; tree identity remains node `value`.
- Keep string-name behavior backward compatible, including `getId()` falling back to a string pipe name.
- Do not add a translation-library dependency or accept `Observable<string>` directly.
- Public symbols use `Kbq`/`kbq` naming and JSDoc; keep published typings free of new `any`/`unknown` leaks.
- Run heavy builds sequentially. Update both English and Russian documentation.
- Do not commit, push or publish without explicit user authorization; the commit steps below are conditional on that authorization.

## Review Focus

- A selected option translated while filtered out by the current search must remain selected; Task 2 adds a regression test.
- A missing option during restoration must not discard the persisted business value; Task 5 adds a regression test.
- A locale-only signal write must not emit filter/value change events or alter saved/changed flags; Tasks 2–4 assert this per family.
- An open panel and its search/focus state must survive translation without exhaustive-check errors; Tasks 2–4 exercise translation with the panel open.
- A signal-named pipe/value without an id must fail before a function reaches persisted state or open-pipe matching; Tasks 1, 3 and 5 pin validation and serialization behavior.

---

### Task 1: Shared name type, resolver and pipe labels

**Files:**

- Create: `packages/components/filter-bar/filter-bar-name.ts`
- Modify: `packages/components/filter-bar/filter-bar.types.ts:1-205`
- Modify: `packages/components/filter-bar/public-api.ts`
- Modify: `packages/components/filter-bar/pipes/base-pipe.ts:28-34`
- Modify: `packages/components/filter-bar/pipe-add.ts`
- Modify: `packages/components/filter-bar/pipes/pipe-input.ts`
- Modify: `packages/components/filter-bar/pipes/pipe-readonly.ts`
- Modify: all built-in `packages/components/filter-bar/pipes/*.{ts,html}` that render `data.name`
- Test: `packages/components/filter-bar/pipes/pipe-text.spec.ts`
- Test: `packages/components/filter-bar/pipes/pipe-input.spec.ts`
- Test: `packages/components/filter-bar/pipe-add.spec.ts`

**Interfaces:**

- Produces: `type KbqFilterBarName = string | Signal<string>` in `filter-bar.types.ts`.
- Produces: `kbqResolveFilterBarName(name: KbqFilterBarName | null | undefined): string`; strings pass through, nullish values become `''`, signals are read.
- Produces: existing `getId(item: KbqPipeTemplate): KbqPipeType | string | number` keeps `id ?? name` for strings and throws a descriptive `Error` for a signal name without `id`.
- Consumes: Angular `Signal`/`isSignal`; no translation service.

- [ ] **Step 1: Write failing pipe-label tests**

Add tests using `signal('Статус')`: assert a text pipe trigger and tooltip rerender after `name.set('Status')` and `fixture.detectChanges()`, an input pipe updates both `placeholder` and `aria-label`, and `kbq-pipe-add` renders/translates the option and uses the current resolved name in its live announcement. Assert the filter object and `changed` flag are unchanged and no change output fires.

- [ ] **Step 2: Write the failing identity test**

Assert `getId({ name: signal('Status'), ... })` throws an error mentioning a stable `id`; assert `{ id: 'status', name: signal('Status') }` returns `'status'` and a string name without id retains the legacy fallback.

- [ ] **Step 3: Run the focused tests to verify they fail**

Run: `npx vitest run packages/components/filter-bar/pipes/pipe-text.spec.ts packages/components/filter-bar/pipes/pipe-input.spec.ts packages/components/filter-bar/pipe-add.spec.ts`
Expected: FAIL because signals render as functions/objects and signal-only identity is unsupported.

- [ ] **Step 4: Implement the shared type and resolver**

Define `KbqFilterBarName` and `kbqResolveFilterBarName` with public JSDoc, export the resolver through `public-api.ts`, and widen only the pipe `name` fields covered by this task. Keep `KbqFilter.name: string`.

- [ ] **Step 5: Resolve every built-in pipe label reactively**

Use the resolver in trigger/tooltip/popover/ARIA/input/add-pipe rendering and announcements. Validate identity centrally in `getId()`; do not resolve a signal into a translated identity.

- [ ] **Step 6: Run the focused tests to verify they pass**

Run the Step 3 command. Expected: PASS with no console errors/warnings.

- [ ] **Step 7: Commit only if explicitly authorized**

```bash
git add packages/components/filter-bar
git commit -m "feat(filter-bar): support signal pipe names (#DS-5764)"
```

### Task 2: Select and multiselect value names

**Files:**

- Modify: `packages/components/filter-bar/filter-bar.types.ts:152-163`
- Modify: `packages/components/filter-bar/pipes/select-pipe-search.ts`
- Modify: `packages/components/filter-bar/pipes/pipe-select.ts`
- Modify: `packages/components/filter-bar/pipes/pipe-select.html`
- Modify: `packages/components/filter-bar/pipes/pipe-multi-select.ts`
- Modify: `packages/components/filter-bar/pipes/pipe-multi-select.html`
- Test: `packages/components/filter-bar/pipes/pipe-select.spec.ts`
- Test: `packages/components/filter-bar/pipes/pipe-multi-select.spec.ts`

**Interfaces:**

- Consumes: `KbqFilterBarName` and `kbqResolveFilterBarName` from Task 1.
- Produces: `KbqSelectValue.name: KbqFilterBarName`; existing `id`, `compareWith`, locked-value and select-all contracts are unchanged.
- Produces: `kbqFilterSelectValuesBySearch(...)` matches resolved names and reacts to name-signal changes through its callers.

- [ ] **Step 1: Write failing select/multiselect translation tests**

For each pipe, select `{ id: 'active', name: signal('Активен'), value: 'active' }`, open the panel, then set `'Active'`. Assert trigger, selected option, tooltip and search use the new label while the value object, filter identity, selected id, query and open state remain unchanged and no change event fires.

- [ ] **Step 2: Add search and selection edge tests**

Assert a query matching the new translation filters correctly, a selected option hidden by that query remains selected, multiselect locked values remain locked, and select-all/`selectedAllEqualsSelectedNothing` results are unchanged by translation. Keep a custom `compareWith` test and a custom `valueTemplate` test that calls the public resolver. Assert a signal-named select value without `id` fails explicitly when its identity is required.

- [ ] **Step 3: Run the focused tests to verify they fail**

Run: `npx vitest run packages/components/filter-bar/pipes/pipe-select.spec.ts packages/components/filter-bar/pipes/pipe-multi-select.spec.ts`
Expected: FAIL on translated option/search/trigger assertions.

- [ ] **Step 4: Implement reactive flat-option labels**

Widen `KbqSelectValue.name`; resolve it in option content, caption-aware `viewValue`, search and custom-template documentation context. Replace one-time observable-only filtering with a signal/computed derivation that tracks template emissions, the query and option-name signals without replacing option objects.

- [ ] **Step 5: Run the focused tests to verify they pass**

Run the Step 3 command. Expected: PASS, including existing locked-value/custom-comparator suites.

- [ ] **Step 6: Commit only if explicitly authorized**

```bash
git add packages/components/filter-bar
git commit -m "feat(filter-bar): localize select values with signals (#DS-5764)"
```

### Task 3: Date and datetime preset names

**Files:**

- Modify: `packages/components/filter-bar/filter-bar.types.ts:146-150`
- Modify: `packages/components/filter-bar/pipes/pipe-date-base.ts`
- Modify: `packages/components/filter-bar/pipes/pipe-date.html`
- Modify: `packages/components/filter-bar/pipes/pipe-datetime.html`
- Test: `packages/components/filter-bar/pipes/pipe-date.spec.ts`
- Test: `packages/components/filter-bar/pipes/pipe-datetime.spec.ts`

**Interfaces:**

- Consumes: Task 1 name union/resolver.
- Produces: `KbqDateTimeValue.name?: KbqFilterBarName` and `KbqDateTimeValue.id?: string | number`.
- Produces: internal date-preset identity returns `id` when present and retains name-based behavior only for string presets; signal presets without id throw the same descriptive class of error as `getId()`.

- [ ] **Step 1: Write failing preset translation tests**

Select a preset with `{ id: 'last-day', name: signal('Последние сутки'), start: { hours: -24 } }`; translate it with the popover open. Assert list selection, trigger and tooltip use the new text, the exact value/filter identities and changed flags remain intact, and no change event fires. Repeat for date and datetime.

- [ ] **Step 2: Add custom-range and validation tests**

Assert a custom `{ start, end }` range remains formatted identically after unrelated preset translations, a string-only preset keeps legacy selection behavior, and a signal-named preset without id throws when its identity is required.

- [ ] **Step 3: Run the focused tests to verify they fail**

Run: `npx vitest run packages/components/filter-bar/pipes/pipe-date.spec.ts packages/components/filter-bar/pipes/pipe-datetime.spec.ts`
Expected: FAIL because date list selection and formatted value treat names as strings.

- [ ] **Step 4: Implement stable preset identity and resolved rendering**

Use ids for signal-backed list values/selection, resolve preset labels in `formattedValue`, emptiness checks, list content and ARIA text, and preserve custom-range behavior. Do not replace `data.value` on a translation change.

- [ ] **Step 5: Run the focused tests to verify they pass**

Run the Step 3 command. Expected: PASS with existing date bounds/validation suites green.

- [ ] **Step 6: Commit only if explicitly authorized**

```bash
git add packages/components/filter-bar
git commit -m "feat(filter-bar): localize date presets with signals (#DS-5764)"
```

### Task 4: Tree and multi-tree value names

**Files:**

- Modify: `packages/components/filter-bar/filter-bar.types.ts:350-367`
- Modify: `packages/components/filter-bar/pipes/tree-select-pipe-base.ts`
- Modify: `packages/components/filter-bar/pipes/pipe-tree-select.html`
- Modify: `packages/components/filter-bar/pipes/pipe-multi-tree-select.ts`
- Modify: `packages/components/filter-bar/pipes/pipe-multi-tree-select.html`
- Test: `packages/components/filter-bar/pipes/pipe-tree-select.spec.ts`
- Test: `packages/components/filter-bar/pipes/pipe-multi-tree-select.spec.ts`

**Interfaces:**

- Consumes: Task 1 name union/resolver.
- Produces: `KbqTreeSelectNode.name` and `KbqTreeSelectFlatNode.name` accept `KbqFilterBarName`; `value` remains the selection identity.
- Produces: `treeControl.getViewValue(node): string` resolves the current node name, including the existing localized select-all sentinel.

- [ ] **Step 1: Write failing tree translation tests**

Select a leaf in each tree pipe, expand a known branch, open the panel and translate root/leaf signals. Assert node content, trigger and tooltip use the new labels while selected `value`, expanded branches, filter identity and change events remain unchanged.

- [ ] **Step 2: Add tree search/custom-template tests**

Assert the active search is reapplied to translated view values, selected hidden leaves stay selected, locked subtrees/select-all remain correct, and a custom value template can render `kbqResolveFilterBarName(option.name)`.

- [ ] **Step 3: Run the focused tests to verify they fail**

Run: `npx vitest run packages/components/filter-bar/pipes/pipe-tree-select.spec.ts packages/components/filter-bar/pipes/pipe-multi-tree-select.spec.ts`
Expected: FAIL on current flattened string-name and trigger assertions.

- [ ] **Step 4: Implement signal-preserving flattening and reactive filtering**

Carry the name union into flat nodes, resolve it in `getViewValue()` and both trigger templates, and reapply the current filter when any node-name signal changes. Preserve the multi-tree instance patching required by constructor initialization order.

- [ ] **Step 5: Run the focused tests to verify they pass**

Run the Step 3 command. Expected: PASS with existing expansion/locked-node suites green.

- [ ] **Step 6: Commit only if explicitly authorized**

```bash
git add packages/components/filter-bar
git commit -m "feat(filter-bar): localize tree values with signals (#DS-5764)"
```

### Task 5: Serialization, snapshots and saved-filter rehydration

**Files:**

- Create: `packages/components/filter-bar/filter-bar-value.ts`
- Modify: `packages/components/filter-bar/public-api.ts`
- Modify: `packages/components/filter-bar/filter-bar.ts:294-433`
- Modify: `packages/components/filter-bar/filters.ts:179-193`
- Modify: `packages/components/filter-bar/pipe-add.ts:103-123`
- Test: `packages/components/filter-bar/filter-bar.spec.ts`
- Test: `packages/components/filter-bar/filters.spec.ts`
- Test: `packages/components/filter-bar/pipe-add.spec.ts`

**Interfaces:**

- Produces public: `kbqFilterBarToSerializableFilter(filter: KbqFilter): KbqFilter`; recursively resolves signal names to current strings and returns a JSON/`structuredClone`-safe copy without mutating the source.
- Produces internal: `cloneFilterBarFilter(filter: KbqFilter | null): KbqFilter | null`; clones built-in structures while retaining signal references instead of cloning signal functions.
- Produces internal: `rehydrateFilterBarFilter(filter: KbqFilter, templates: KbqPipeTemplate[]): KbqFilter`; replaces persisted select/multiselect/date values with current signal-named options/presets matched by id, leaving unmatched business values and all other values intact.
- Consumes: all name unions and stable ids from Tasks 1–4.

- [ ] **Step 1: Write failing serialization and snapshot tests**

Assert the serializable helper leaves the live filter untouched, emits current strings for every signal name, and survives both `JSON.stringify` and `structuredClone`. Assert `saveFilterState()`/`restoreFilterState()`, automatic persistence and `KbqPipeAdd.filterTemplate` do not throw `DataCloneError` for built-in signal names.

- [ ] **Step 2: Write failing rehydration tests**

Round-trip select, multiselect and date values to plain data, change the locale, and restore/select the saved filter. Assert current template signal labels are recovered by id, value identity is not used as a label key, and no change event is caused solely by rehydration. Assert an unmatched option retains its persisted business value and late-arriving templates keep the existing pending-state behavior.

- [ ] **Step 3: Run the focused tests to verify they fail**

Run: `npx vitest run packages/components/filter-bar/filter-bar.spec.ts packages/components/filter-bar/filters.spec.ts packages/components/filter-bar/pipe-add.spec.ts`
Expected: FAIL on signal cloning, serializable output and date/value rehydration.

- [ ] **Step 4: Implement the shared value boundary helpers**

Implement recursive plain-array/object handling for signal resolution and signal-preserving clones; delegate non-plain custom payloads to the existing `structuredClone` restrictions. Rehydrate only built-in select/multiselect/date values by stable id and never translate `KbqFilter.name`.

- [ ] **Step 5: Wire every persistence and cloning path to the helpers**

Use serializable values in automatic `persistState`, rehydrate automatic and explicit restores against current templates, clone `filterTemplate` with the shared clone helper, and rehydrate application-owned filters in `KbqFilters.selectFilter`. Export only the intended public serialization helper through `public-api.ts`.

- [ ] **Step 6: Run the focused tests to verify they pass**

Run the Step 3 command plus all pipe specs from Tasks 2–4. Expected: PASS with no new API runtime errors.

- [ ] **Step 7: Commit only if explicitly authorized**

```bash
git add packages/components/filter-bar
git commit -m "feat(filter-bar): preserve localized values across saved state (#DS-5764)"
```

### Task 6: Documentation, examples and release gates

**Files:**

- Modify: `packages/docs-examples/components/filter-bar/filter-bar-localization/filter-bar-localization-example.ts`
- Modify: `packages/docs-examples/components/filter-bar/filter-bar-saved-filters/filter-bar-saved-filters-example.ts`
- Modify: `packages/components/filter-bar/filter-bar.en.mdx`
- Modify: `packages/components/filter-bar/filter-bar.ru.mdx`
- Modify: `apps/docs/src/app/structure.ts`
- Modify: generated API/docs artifacts through repository commands
- Test: `packages/components/filter-bar/filter-bar.spec.ts` and pipe suites as regression coverage

**Interfaces:**

- Consumes: public resolver and `kbqFilterBarToSerializableFilter` from Tasks 1 and 5.
- Produces: EN/RU guidance and live examples for stable ids, runtime signal translation, custom-template resolution and application-owned serialization.

- [ ] **Step 1: Update the localization example without rebuilding state**

Create filter/templates once with stable ids and `computed()` labels driven by `KbqLocaleService.localeId()`. Include select, multiselect, tree/multi-tree and date/datetime values, keep locale switching independent of `filter.set`, and keep the shared `localized-data.ts` unchanged.

- [ ] **Step 2: Update saved-filter serialization and both documentation locales**

Use `kbqFilterBarToSerializableFilter` before application JSON/`structuredClone`, explain rehydration by id and raw `structuredClone(filter)`'s function-value limitation, and document custom-template name resolution. Replace the obsolete instruction to rebuild filters for runtime localization and add `isUpdated: expiresAt('2026-11-25')` to the filter-bar structure item.

- [ ] **Step 3: Verify the examples compile**

Run: `yarn run build:docs-examples`
Expected: PASS with strict Angular template checking and no stale generated example registration.

- [ ] **Step 4: Run component and type checks**

Run sequentially:
`yarn run styles:build-all`
`npx vitest run packages/components/filter-bar`
`yarn run check-spec-types`
`yarn run build:components`
`yarn run check-typings`
Expected: all PASS.

- [ ] **Step 5: Update and verify public API artifacts**

Run sequentially:
`yarn run approve-api "components/filter-bar"`
`yarn run check-api`
`yarn run check-public-api-any`
`yarn run docs:api-gen`
`yarn run check-api-docs`
Expected: API snapshots contain only the approved name/date-id/resolver/serialization additions; all checks PASS. If a ratchet count legitimately decreased, use its documented approval command and inspect the diff.

- [ ] **Step 6: Regenerate and check agent documentation**

Run: `yarn run docs:generate-llms` then `yarn run check-llms`.
Expected: PASS; committed generated files reflect the EN/RU page changes.

- [ ] **Step 7: Run formatting and lint checks on the final diff**

Run: `yarn run prettier:fix`, `yarn run eslint:fix`, `yarn run stylelint:fix`, then `yarn run cspell` for changed Markdown if the repository script requires an explicit path.
Expected: no remaining errors/warnings; inspect automatic fixes rather than accepting unrelated churn.

- [ ] **Step 8: Review the delivered diff and working tree**

Run: `git diff --check`, `git status --short`, and inspect the final diff for the six tasks. Delete only logs/artifacts created by this work that are not deliverables. Expected: no whitespace errors, unrelated edits or temporary files.

- [ ] **Step 9: Commit only if explicitly authorized**

```bash
git add packages/components/filter-bar packages/docs-examples/components/filter-bar apps/docs/src/app/structure.ts apps/docs/src/llms.txt tools/public_api_guard docs/superpowers
git commit -m "docs(filter-bar): document runtime signal localization (#DS-5764)"
```
