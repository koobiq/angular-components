# DS-2183: новый API фильтрации дерева — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Задеприкейтить `FlatTreeControl.filterNodes` и `filterValue`, добавить `applyFilter`/`resetFilter`, перевести `KbqTreeFlatDataSource` и внутренних потребителей на `filterModel`/`filterQuery`.

**Architecture:** `applyFilter(value)` прогоняет существующий пайплайн `FlatTreeControlFilter`, выставляет `expansionModel` и **последним** обновляет `filterModel` — эмиссия `filterModel.changed` становится триггером перерисовки data source. Пустой запрос (`''`/`null`) приравнен к сбросу. `filterValue` (BehaviorSubject) сохраняется как deprecated: `applyFilter` продолжает в него публиковать, чтобы шаблоны консьюмеров работали до v22.

**Tech Stack:** Angular 20+, TypeScript, Vitest, RxJS, @angular/cdk SelectionModel.

**Spec:** `docs/superpowers/specs/2026-11-06-tree-filtering-api-design.md` (утверждён).

## Global Constraints

- ESLint и stylelint в CI с `--max-warnings=0` — предупреждений быть не должно; библиотечный код не должен использовать задеприкейшенное API.
- Prettier: 120 колонок, 4 пробела, одинарные кавычки, без trailing comma — отдать форматирование ему.
- Новые публичные члены — с JSDoc-описанием (`check-api-docs` — ратчет на недокументированные публичные члены).
- Публичные символы: префиксы `Kbq`/`kbq`/`KBQ_`; без `any` в публичных декларациях (`check-public-api-any`).
- Коммиты: conventional commits `type(scope): subject (#DS-2183)`, скоупы `tree`, `filter-bar`, `docs-examples`, `dev`. Длина заголовка ≤ 120.
- Тесты: `npx vitest run "<path>"`; юнит-спеки живут рядом с кодом (`*.spec.ts`).
- Депрекейшн-формулировка (конвенция репозитория): `@deprecated Use \`X\` instead. Will be removed in 22.0.0.`

## Review Focus

- Повторный `applyFilter` при уже активном фильтре: expansion-состояние сохраняется один раз (при первом применении) и не затирается повторным — иначе `resetFilter` восстановит не то. Тест в Task 1.
- Порядок эмиссий: `expansionModel` обновляется до `filterModel` — иначе `expansionHandler` data source перезатрёт отфильтрованные данные. Тест в Task 3.
- `expand()`/`toggle()`/`collapse()` — no-op при активном фильтре (guard теперь по `filterModel.selected.length`). Тест в Task 2.
- Прямая манипуляция `filterModel` консьюмером (custom-filtering example) без `applyFilter` должна перерисовывать data source. Тест в Task 3.
- BC `filterValue`: после `applyFilter('draft')` шаблоны со старым `filterValue.value` продолжают получать запрос. Тест в Task 1.
- `selectAll` при активном фильтре действует только на отрисованные узлы — существующие тесты tree-selection (Task 4) продолжают проходить.

---

### Task 1: FlatTreeControl — applyFilter/resetFilter/filterQuery, filterNodes deprecated

**Files:**

- Modify: `packages/components/tree/control/flat-tree-control.ts`
- Test: `packages/components/tree/control/flat-tree-control.spec.ts`

**Interfaces:**

- Consumes: существующие `filters` пайплайна (`FlatTreeControlFilter.handle`), `expandedItemsBeforeFiltration`, `expansionModel`, `filterModel`, `filterValue` (BC).
- Produces:
    - `filterQuery: string | null` — публичное свойство, строка запроса последнего `applyFilter`; `null` когда фильтр не активен.
    - `applyFilter(value: string | null = null): void` — непустой `value`: сохранить expansion (только если фильтр ещё не активен), прогнать пайплайн, выставить `expansionModel` по результату, записать `filterQuery`, обновить `filterModel` последним, опубликовать `value` в `filterValue`; пустой/`null`: делегировать в `resetFilter()`.
    - `resetFilter(): void` — если фильтр активен (`filterModel.selected.length > 0`): восстановить `expandedItemsBeforeFiltration`; `filterModel.clear()`; `filterQuery = null`; опубликовать `null` в `filterValue`. Восстановление expansion — в микротаске (`Promise.resolve().then`), guard — по `filterModel.selected.length`.
    - `filterNodes(value: string | null = null): void` — `@deprecated Use \`applyFilter\` instead. Will be removed in 22.0.0.`, тело — делегация в `applyFilter`.

- [ ] **Step 1: Написать failing-тесты в `flat-tree-control.spec.ts`**

Рядом с `describe('filterNodes')` (строка ~247) добавить `describe('applyFilter')` и `describe('resetFilter')` на том же фикстурном дереве:

```ts
describe('applyFilter', () => {
    it('should keep the matches together with their ancestors', () => {
        control.applyFilter('draft');
        expect(control.filterModel.selected.map((node) => node.name)).toEqual(['root', 'documents', 'specs', 'draft']);
        expect(control.filterQuery).toBe('draft');
    });

    it('should not overwrite the remembered expansion state on a second application', () => {
        control.expand(byName(nodes, 'images'));
        control.applyFilter('draft');
        control.applyFilter('specs');
        expect(control.expandedItemsBeforeFiltration.map((node) => node.name)).toEqual(['images']);
    });

    it('should treat an empty query as a reset', async () => {
        control.expand(byName(nodes, 'images'));
        control.applyFilter('draft');
        await Promise.resolve();
        control.applyFilter('');
        expect(control.filterModel.selected).toEqual([]);
        expect(control.filterQuery).toBeNull();
        await Promise.resolve();
        expect(control.expansionModel.selected.map((node) => node.name)).toEqual(['images']);
    });

    it('should publish the query on the deprecated filterValue for compatibility', async () => {
        control.applyFilter('draft');
        await Promise.resolve();
        expect(control.filterValue.value).toBe('draft');
    });
});

describe('resetFilter', () => {
    it('should clear the filter and restore the expansion state', async () => {
        control.expand(byName(nodes, 'images'));
        control.applyFilter('draft');
        await Promise.resolve();
        control.resetFilter();
        expect(control.filterModel.selected).toEqual([]);
        expect(control.filterQuery).toBeNull();
        await Promise.resolve();
        expect(control.expansionModel.selected.map((node) => node.name)).toEqual(['images']);
    });
});

describe('filterNodes (deprecated)', () => {
    it('should delegate to applyFilter', () => {
        const spy = vi.spyOn(control, 'applyFilter');
        control.filterNodes('draft');
        expect(spy).toHaveBeenCalledWith('draft');
        expect(control.filterQuery).toBe('draft');
    });
});
```

Существующий тест `should publish the query on filterValue` (строка ~269) оставить как есть — он продолжает проходить через BC-публикацию.

- [ ] **Step 2: Запустить — убедиться, что падает**

Run: `npx vitest run packages/components/tree/control/flat-tree-control.spec.ts`
Expected: FAIL — `control.applyFilter is not a function`.

- [ ] **Step 3: Реализовать в `flat-tree-control.ts`**

По спецификации Interfaces выше. Порядок в `applyFilter` (непустой запрос): `saveExpansionState()` (guard заменить с `filterValue.value` на `!this.filterModel.selected.length`) → пайплайн → `expansionModel.setSelection(...expandable из result)` → `this.filterQuery = value` → `filterModel.clear(); filterModel.select(...result)` → `filterValue.next(value)` (в микротаске, как сейчас `updateFilterValue`) → микротаск `restoreExpansionState()` (guard по `filterModel.selected.length`). `filterNodes` — однострочная делегация с JSDoc `@deprecated`.

- [ ] **Step 4: Запустить — убедиться, что проходит**

Run: `npx vitest run packages/components/tree/control/flat-tree-control.spec.ts`
Expected: PASS (весь файл).

- [ ] **Step 5: Commit**

```bash
git add packages/components/tree/control/flat-tree-control.ts packages/components/tree/control/flat-tree-control.spec.ts
git commit -m "feat(tree): add applyFilter and resetFilter, deprecate filterNodes (#DS-2183)"
```

### Task 2: BaseTreeControl — guard'ы expansion по filterModel

**Files:**

- Modify: `packages/components/tree/control/base-tree-control.ts:43-67` (`toggle`, `expand`, `collapse`)
- Test: `packages/components/tree/control/flat-tree-control.spec.ts`

**Interfaces:**

- Consumes: `filterModel.selected.length` как признак активного фильтра.
- Produces: ничего нового; guard `if (this.filterModel.selected.length) { return; }` в трёх методах вместо `filterValue.value?.length`.

- [ ] **Step 1: Failing-тест** — в `flat-tree-control.spec.ts`, внутри `describe('applyFilter')`:

```ts
it('should ignore expand and collapse while a filter is active', () => {
    control.applyFilter('draft');
    control.expand(byName(nodes, 'images'));
    expect(control.isExpanded(byName(nodes, 'images'))).toBe(false);
});
```

- [ ] **Step 2: Запустить — убедиться, что падает**

Run: `npx vitest run packages/components/tree/control/flat-tree-control.spec.ts -t "should ignore expand and collapse"`
Expected: FAIL — `isExpanded` вернёт true (guard всё ещё по `filterValue`, который заполнится только в микротаске).

- [ ] **Step 3: Реализовать** — заменить guard в `toggle`/`expand`/`collapse` на `if (this.filterModel.selected.length) { return; }`.

- [ ] **Step 4: Запустить — PASS**

Run: `npx vitest run packages/components/tree/control/flat-tree-control.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/components/tree/control/base-tree-control.ts packages/components/tree/control/flat-tree-control.spec.ts
git commit -m "refactor(tree): base expansion guards read the filter state from filterModel (#DS-2183)"
```

### Task 3: KbqTreeFlatDataSource — перерисовка по filterModel.changed

**Files:**

- Modify: `packages/components/tree/data-source/flat-data-source.ts:183-204` (`connect`)
- Test: `packages/components/tree/data-source/flat-data-source.spec.ts`

**Interfaces:**

- Consumes: `filterModel.changed: Observable<SelectionChange<T>>` (CDK SelectionModel).
- Produces: `connect()` мержит `filterModel.changed` вместо `filterValue`; эмиссия с непустой выборкой → `filterHandler()`, с пустой → `expansionHandler()`. `KbqTreeDataSourceChangeTypes.Filter` переиспользовать.

- [ ] **Step 1: Failing-тест** — в `flat-data-source.spec.ts` рядом с существующими фильтр-тестами (~строки 250–280): мигрировать их с `filterNodes` на `applyFilter` и добавить:

```ts
it('should re-render when the consumer mutates filterModel directly', () => {
    // без applyFilter: data source должен отреагировать на filterModel.changed
    control.filterModel.select(...someNodes);
    // connect-стрим эмитит отфильтрованные данные
});
```

(Точные ассерты — по образцу соседних тестов файла: подписка на `connect(viewer)` и проверка эмитов.) Плюс тест, что после `applyFilter` стрим эмитит отфильтрованные узлы, а после `resetFilter` — развёрнутые.

- [ ] **Step 2: Запустить — FAIL** (прямая манипуляция `filterModel` не вызывает перерисовку: `filterValue` не меняется).
      Run: `npx vitest run packages/components/tree/data-source/flat-data-source.spec.ts`
      Expected: FAIL нового теста.

- [ ] **Step 3: Реализовать** — в `connect()` заменить `this.treeControl.filterValue.pipe(...)` на `this.treeControl.filterModel.changed.pipe(map(() => ({ type: Filter, value: this.treeControl.filterModel.selected })))`; ветка `changeObj.type === Filter`: `value.length > 0` → `filterHandler()`, иначе → `expansionHandler(changeObj.value)`.

- [ ] **Step 4: Запустить — PASS.**
      Run: `npx vitest run packages/components/tree/data-source/flat-data-source.spec.ts`

- [ ] **Step 5: Commit**

```bash
git add packages/components/tree/data-source/flat-data-source.ts packages/components/tree/data-source/flat-data-source.spec.ts
git commit -m "feat(tree): flat data source re-renders on filterModel changes (#DS-2183)"
```

### Task 4: KbqTreeSelection и toggle — признак активного фильтра по filterModel

**Files:**

- Modify: `packages/components/tree/tree-selection.component.ts:516` (`selectAllTargets`)
- Modify: `packages/components/tree/toggle.ts:36-39` (`filterDisabled`)
- Test: `packages/components/tree/tree-selection.component.spec.ts`, `packages/components/tree/toggle.spec.ts`

**Interfaces:**

- Consumes: `filterModel.selected.length` (Task 1–2), `filterModel.changed` (Task 3).
- Produces: ничего нового.

- [ ] **Step 1: Мигрировать вызовы в тестах** — в `tree-selection.component.spec.ts` и `toggle.spec.ts` заменить вызовы `filterNodes(` на `applyFilter(` (все вхождения). Тест про observers (`toggle.spec.ts:193-199`) пока не трогать. Запустить: `npx vitest run packages/components/tree/tree-selection.component.spec.ts packages/components/tree/toggle.spec.ts` — зелёно (поведение не менялось).

- [ ] **Step 2: Реализовать** — `selectAllTargets`: `this.treeControl.filterModel.selected.length ? ... : ...`; `filterDisabled`: `this.tree.treeControl.filterModel.changed.pipe(map(() => this.tree.treeControl.filterModel.selected.length > 0))`.

- [ ] **Step 3: Переписать тест про observers и запустить — PASS.** В `toggle.spec.ts` тест observers переписать с `filterValue` на `filterModel`: после destroy подписок на `filterModel.changed` не остаётся.
      Run: `npx vitest run packages/components/tree/tree-selection.component.spec.ts packages/components/tree/toggle.spec.ts`

- [ ] **Step 4: Commit**

```bash
git add packages/components/tree/tree-selection.component.ts packages/components/tree/toggle.ts packages/components/tree/tree-selection.component.spec.ts packages/components/tree/toggle.spec.ts
git commit -m "refactor(tree): selection and toggle read the filter state from filterModel (#DS-2183)"
```

### Task 5: filter-bar — пайпы на applyFilter/filterQuery

**Files:**

- Modify: `packages/components/filter-bar/pipes/tree-select-pipe-base.ts:72` (`filterNodes(` → `applyFilter(`)
- Modify: `packages/components/filter-bar/pipes/pipe-tree-select.html` (2 вхождения `treeControl.filterValue.value` → `treeControl.filterQuery`)
- Modify: `packages/components/filter-bar/pipes/pipe-multi-tree-select.html` (3 вхождения)
- Test: `packages/components/filter-bar/pipes/pipe-tree-select.spec.ts:674-679`, `pipe-multi-tree-select.spec.ts:1179-1184` (spy с `filterNodes` на `applyFilter`; все `filterNodes(` в спеках → `applyFilter(`)

**Interfaces:**

- Consumes: `applyFilter` (Task 1), `filterQuery` (Task 1).
- Produces: шаблоны пайпов больше не трогают `filterValue`.

- [ ] **Step 1: Мигрировать спеки** (spy и вызовы), запустить — зелёно: `npx vitest run packages/components/filter-bar/pipes/pipe-tree-select.spec.ts packages/components/filter-bar/pipes/pipe-multi-tree-select.spec.ts`.
- [ ] **Step 2: Реализовать** изменения в `tree-select-pipe-base.ts` и двух html.
- [ ] **Step 3: Запустить — PASS** (те же спеки, плюс `npx vitest run packages/components/filter-bar` если есть смежные затронутые спеки).
- [ ] **Step 4: Commit**

```bash
git add packages/components/filter-bar
git commit -m "refactor(filter-bar): tree pipes use applyFilter and filterQuery (#DS-2183)"
```

### Task 6: dev-apps на новом API

**Files:**

- Modify: `packages/components-dev/tree/module.ts:214,262` (`filterNodes(` → `applyFilter(`), `packages/components-dev/tree/template.html:69,83,107,121` (`treeControl.filterValue.value` → `treeControl.filterQuery`)
- Modify: `packages/components-dev/tree-select/module.ts:129`, `template.html` (9 вхождений `filterValue.value`)
- Modify: `packages/components-dev/form-field/template.html` (4 вхождения)

**Interfaces:**

- Consumes: `applyFilter`, `filterQuery` (Task 1).
- Produces: ничего.

- [ ] **Step 1: Заменить вызовы и биндинги** во всех перечисленных файлах (в `tree/module.ts` локальное свойство `filterValue: string` примера не трогать — это поле инпута, оно остаётся).
- [ ] **Step 2: Проверка типов/линт изменённых файлов:** `npx eslint packages/components-dev/tree packages/components-dev/tree-select packages/components-dev/form-field` — без ошибок.
- [ ] **Step 3: Commit**

```bash
git add packages/components-dev/tree packages/components-dev/tree-select packages/components-dev/form-field
git commit -m "refactor(dev): tree dev apps use applyFilter and filterQuery (#DS-2183)"
```

### Task 7: docs-examples на новом API

**Files:**

- Modify: `packages/docs-examples/components/tree/tree-filtering/tree-filtering-example.ts` (вывод `applyFilter`, 2 биндинга)
- Modify: `packages/docs-examples/components/tree/tree-checked-filtering/tree-checked-filtering-example.ts` (2 биндинга)
- Modify: `packages/docs-examples/components/tree/tree-descendants-subcategories/tree-descendants-subcategories-example.ts` (2 биндинга)
- Modify: `packages/docs-examples/components/tree/tree-custom-filtering/tree-custom-filtering-example.ts` — биндинги, а также убрать re-emit через `filterValue.next(...)` (~строки 245, 336): прямые `filterModel.clear()/select(...)` сами эмитят `filterModel.changed`, data source перерисовывается (Task 3); локальную подписку на `filterValue` (~строка 209) заменить чтением собственного поля запроса
- Modify: `packages/docs-examples/components/tree-select/tree-select-search-overview/tree-select-search-overview-example.ts` (вывод + 2 биндинга)
- Modify: `packages/docs-examples/components/tree-select/tree-select-search-smart/tree-select-search-smart-example.ts:189` (`filterNodes(` → `applyFilter(`)

**Interfaces:**

- Consumes: `applyFilter`, `filterQuery`, `filterModel.changed` (Task 1, 3).
- Produces: примеры не используют задеприкейченное API.

- [ ] **Step 1: Внести правки** во все шесть файлов по списку выше; поведение примеров (подсветка, фильтрация, состояние дерева) сохранить.
- [ ] **Step 2: Проверка:** `npx eslint packages/docs-examples/components/tree packages/docs-examples/components/tree-select` — без ошибок.
- [ ] **Step 3: Commit**

```bash
git add packages/docs-examples/components/tree packages/docs-examples/components/tree-select
git commit -m "docs(examples): tree filtering examples use applyFilter and filterQuery (#DS-2183)"
```

### Task 8: @deprecated на filterValue

**Files:**

- Modify: `packages/components/tree/control/base-tree-control.ts:22` (свойство `filterValue`)
- Modify: `packages/components/tree/control/tree-control.ts:27` (член интерфейса)

**Interfaces:**

- Consumes: всё внутреннее использование уже мигрировано (Tasks 1–7).
- Produces: JSDoc `@deprecated Use \`filterQuery\` for the query string and \`filterModel\` for the filter state. Will be removed in 22.0.0.` на обоих объявлениях.

- [ ] **Step 1: Добавить JSDoc** на оба объявления по формулировке выше (английский, конвенция репозитория).
- [ ] **Step 2: Проверка, что в библиотеке не осталось использований:** `grep -rn "filterValue" packages/components --include=*.ts --include=*.html` — ожидаются только объявления, BC-публикация в `flat-tree-control.ts` и тест BC-совместимости.
- [ ] **Step 3: Запустить юнит-спеки дерева целиком — PASS:** `npx vitest run packages/components/tree packages/components/tree-select`.
- [ ] **Step 4: Commit**

```bash
git add packages/components/tree/control/base-tree-control.ts packages/components/tree/control/tree-control.ts
git commit -m "deprecate(tree): mark filterValue for removal in 22.0.0 (#DS-2183)"
```

### Task 9: сборка и ворота

**Files:**

- Modify (генерируемые): `tools/public_api_guard/components/tree.api.md` и прочие golden-файлы, `packages/mcp/data/history.json`, `apps/docs/src/llms.txt` — только через перечисленные команды.

- [ ] **Step 1: Сборка:** `yarn run build:components` — успех без ошибок.
- [ ] **Step 2: API-ворота:** `yarn run approve-api` затем `yarn run check-api` — PASS; `yarn run check-public-api-any` — PASS (без новых `any`).
- [ ] **Step 3: Документация API:** у `applyFilter`/`resetFilter`/`filterQuery` есть JSDoc; `yarn run docs:api-gen` затем `yarn run approve-api-docs` (если счётчики изменились), `yarn run check-api-docs` — PASS.
- [ ] **Step 4: MCP-данные:** `yarn run build:mcp:data` — обновляет `packages/mcp/data/history.json` (applyFilter/resetFilter/filterQuery добавлены); `yarn run check-mcp-data` — PASS.
- [ ] **Step 5: Линт:** `yarn run eslint` и `yarn run prettier` — без ошибок и диффов (при необходимости `yarn run prettier:fix`).
- [ ] **Step 6: Юнит-ворота по затронутым пакетам:** `npx vitest run packages/components/tree packages/components/tree-select packages/components/filter-bar` — PASS.
- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: approve api and mcp data for tree filtering changes (#DS-2183)"
```
