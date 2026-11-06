# DS-2183: новый API фильтрации в дереве — дизайн

Дата: 2026-11-06. Статус: на утверждении.

## Зачем

DS-2105 добавил механизм внешних фильтров (`FlatTreeControlFilter`: `FilterByViewValue`, `FilterParentsForNodes`, `FilterByValues`), но публичный интерфейс остался старым. Техдолг (DS-2183): привести API в порядок.

## Цели

- Задеприкейтить `FlatTreeControl.filterNodes`, добавить `applyFilter` и `resetFilter`.
- Увести `KbqTreeFlatDataSource` с `filterValue` на `filterModel` (перерисовка по `filterModel.changed`).
- Задеприкейтить `filterValue`; удаление — в v22 (решение: не ломать 21.x, конвенция репозитория — как `canLoad` в code-block).

## Не-цели

- Удаление `filterValue` сейчас (отдельная задача на v22).
- Изменение поведения фильтров-пайплайна и дефолтных фильтров.
- Изменения в NestedTreeControl (фильтрация там не используется).

## Решения (приняты вместе с ревьюером)

1. **filterValue — deprecate-first.** Метка `@deprecated` в JSDoc с пометкой «to be removed in v22», поведение сохраняется: `applyFilter` по-прежнему публикует в `filterValue`, чтобы существующие шаблоны консьюмеров продолжили работать.
2. **Строка запроса — обычное публичное свойство на контроле.** Рабочее имя — `filterQuery: string | null`, заполняется в `applyFilter`. Шаблоны библиотеки и примеров подсвечивают через него (`kbqHighlightBackground: treeControl.filterQuery`), а не через `filterValue.value`.

## Мои решения (для проверки при чтении)

- **`applyFilter(value: string | null)`**: если фильтр не активен — сохранить expansion-состояние; прогнать пайплайн `filters`; выставить `expansionModel` по результату; записать `filterQuery`; обновить `filterModel` **последним** (эмиссия `filterModel.changed` — триггер перерисовки data source, поэтому порядок: сначала expansion, потом filterModel — иначе `expansionHandler` перезатрёт отфильтрованные данные). Восстановление expansion — в микротаске, как сейчас, с guard «фильтр всё ещё активен» по `filterModel.selected.length`.
- **Пустой запрос == сброс.** `applyFilter('')` и `applyFilter(null)` приводят к `resetFilter()`: `filterModel.clear()`, восстановление expansion, `filterQuery = null`. Это осознанное отличие от текущего `filterNodes('')` (он оставлял `filterModel` заполненным всеми узлами); по смыслу «очистили поиск» — дерево должно вернуться к обычному виду.
- **`resetFilter()`**: если фильтр активен — восстановить expansion-состояние, очистить `filterModel` и `filterQuery`.
- **`filterNodes(value)`** остаётся, `@deprecated`, делегирует в `applyFilter`.
- **Внутренние потребители мигрируют с `filterValue` на `filterModel`/`filterQuery`**:
    - `BaseTreeControl.toggle/expand/collapse` — guard по `filterModel.selected.length` (для nested-контрола `filterModel` всегда пуст — поведение не меняется).
    - `KbqTreeFlatDataSource.connect` — вместо `filterValue` мержить `filterModel.changed`; непустая выборка → `filterHandler`, пустая → `expansionHandler`.
    - `KbqTreeSelection.selectAllTargets` — `filterModel.selected.length > 0`.
    - `KbqTreeNodeToggleBaseDirective` — `filterModel.changed` вместо `filterValue.pipe`.
- **Шаблоны и примеры библиотеки** (filter-bar pipes, dev-apps, docs-examples) переводятся на `applyFilter`/`filterQuery` — не должны использовать задеприкейченное API.
- **Сопутствующее**: обновить API golden files (`approve-api`), у новых публичных членов — JSDoc-описания (`check-api-docs`), историю изменений MCP (`build:mcp:data`), при необходимости llms.
- Миграционная запись про удаление в v22 — отдельно, при подготовке v22.

## Проверка

- Юнит-спеки: `flat-tree-control.spec.ts`, `flat-data-source.spec.ts`, `tree-selection.component.spec.ts`, `toggle.spec.ts`, `pipe-tree-select.spec.ts`, `pipe-multi-tree-select.spec.ts` — адаптировать + добавить кейсы на `applyFilter`/`resetFilter`, пустой запрос, сохранение/восстановление expansion, реакцию data source на `filterModel`.
- `yarn run unit:components` (проект tree + filter-bar), `yarn run build:components`, `yarn run check-api`, `yarn run eslint` без предупреждений.
- Вручную: dev-apps `dev:tree`, `dev:tree-select` — поиск, подсветка, select-all при активном фильтре.
