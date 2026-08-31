# Компонент Tree (Koobiq) — код-ревью и план улучшений

> 🌐 Перевод [`docs/REVIEW.tree.md`](./REVIEW.tree.md) на русский язык. Идентификаторы находок (A1–A14, C1–C9, P1–P6, AR1–AR9, M1–M13, API1–API11, T1–T13, S1–S6), значения severity (high/medium/low), флаги breaking, эффорт (S/M/L), пути к файлам, имена API и фрагменты кода оставлены без изменений.

> Область: `packages/components/tree` (плюс общий `packages/components/core/option/action.ts`, используемый деревом) · Коммит `3d86d38f` · 2026-06-14
> Метод: все 24 исходных файла прочитаны вручную + автоматизированное мультиагентное ревью (8 измерений × состязательная верификация каждой находки → синтез). Из 96 сырых находок **84 подтверждены** и **12 отклонены** как ложные/преднамеренные (см. §5). 84 подтверждённые находки дедуплицируются в **81 отслеживаемый пункт** по 8 темам (три кросс-листятся — например, утечка toggle это C2 = P3 = часть M1).
> Severity ниже — это проверенная **adjusted severity** (состязательный проход снизил «раздутые» оценки, например «god-class на 811 строк» понижен `high → low`, поскольку соседний `KbqListSelection` крупнее и устроен так же осознанно).
> Документ дополняет монорепо-ревью `docs/REVIEW.md`, где дерево затронуто лишь на уровне сводки (`A11Y-05`, `A11Y-09`, `BUG-06`, `ARCH-10`). Находки здесь согласованы с ним (например, обе работы считают «утечку» `unorderedOptions.changes` незначительной).

---

## 1. Краткое резюме / состояние (health)

Дерево **функционально работает, но архитектурно и по доступности отстаёт** от остальной библиотеки. Это жёсткий форк `@angular/cdk/tree` (ноль импортов `@angular/cdk/tree` где-либо в `packages/`), который заново реализует весь набор концепций CDK-дерева и несёт типичный долг старого форка: хрупкую передачу узла через глобальную статику, компонент-god-class на 811 строк, повсеместный `any` и незавершённую миграцию на signals/standalone с россыпью маркеров `// TODO: Skipped for migration`. **Ни одно из этого не является runtime-дефектом — компонент работает.**

Реально требуют внимания две области:

1. **Доступность (главная слабость).** У виджета **нет ARIA-семантики дерева** — нет `role="tree"`, нет `role="treeitem"`, нет `aria-expanded` / `aria-selected` / `aria-level` / `aria-multiselectable` / `aria-disabled`, нет доступного имени, нет type-ahead, неполное поведение стрелок Left/Right, недоступные toggle раскрытия и action-кнопка строки. Виджет управляется с клавиатуры через `FocusKeyManager` и визуально корректен, поэтому пользователь скринридера может перемещаться по нему, но не воспринимает, что это дерево, его иерархию и состояние выбора/раскрытия. `AGENTS.md` требует прохождения AXE и WCAG AA, так что это кластер наибольшей ценности. Отсутствие ролей повторяет соглашение соседнего `KbqListSelection`, поэтому это **решение уровня всей библиотеки**, а не регрессия только дерева — добавлять ARIA нужно цельной реализацией (роли + состояния вместе), а не по одному атрибуту.

2. **Покрытие тестами.** Основная модель взаимодействия (навигация с клавиатуры, каскад tri-state чекбоксов, исключение disabled-элементов, `noUnselectLast`, краевые случаи CVA, поведение toggle, алгоритмы flattener/data-source, teardown/утечки) почти не покрыта, а часть ключевых сценариев отключена (`xit`/`xdescribe`/`it.skip` с расплывчатыми пометками «todo need recover»), поэтому зелёный прогон завышает реальное покрытие. Нигде нет проверок AXE/ARIA.

Есть и горстка **реальных дешёвых багов корректности/производительности** (утечка подписки в toggle, событие `selectionChange` с `{option: undefined}`, избыточный двойной change-detection, отсутствие дефолтного `trackBy` → полный ребилд view, тяжёлый O(n) пересчёт чекбоксов), но это в основном краевые случаи или потери эффективности, а не падения.

**Итог: это история про сопровождаемость + доступность + покрытие тестами, а не «компонент сломан».** Быстрых побед много; глубокие рефакторинги (де-форк, дженерики, signals) крупные и частично breaking — их в RFC.

### Оценочная таблица

| Измерение | Оценка | Подтверждено | Примечания |
|---|---|---|---|
| Доступность | D | 14 | Вообще нет ролей tree/treeitem и ARIA-состояний; 4× high. Главный пробел. |
| Тесты | C | 13 | Клавиатура, tri-state, disabled, CVA, data-source без тестов; ключевые тесты отключены. |
| API и типизация | C+ | 11 | Повсеместный `any` на публичных членах; раздутая публичная поверхность; рыхлые дженерики `TreeControl`. |
| Modern Angular | B− | 13 | Середина миграции: decorator-входы/выходы, конструкторная инъекция, нет signals. |
| Архитектура | B | 9 | Жёсткий форк, хрупкая статика, god-class — всё преднамеренно/работает, низкая серьёзность. |
| Корректность | B | 9 | Один баг с `undefined`-emit + утечка toggle (medium); остальное — узкие low-sev края. |
| Change-Detection / Perf | B | 6 | Нет дефолтного `trackBy`, O(n) пересчёт чекбоксов, двойной CD — избегаемые издержки, не баги. |
| Стили / Темизация | B | 6 | 2 латентные визуальные регрессии (неопределённые токены → 0); остальное — мёртвый CSS/токены. |

Счёт отслеживаемых пунктов (84 подтверждённые находки дедуплицированы в 81 уникальный пункт): **Доступность 14 · Корректность 9 · Change-Detection/Perf 6 · Архитектура 9 · Modern-Angular 13 · API и типизация 11 · Тесты 13 · Стили 6 = 81.**

---

## 2. Находки по темам

Severity = проверенная **adjusted severity**. **Brk** = меняет публичный API, отслеживаемый `tools/public_api_guard/components/tree.api.md`, или видимый контракт компонента. Effort = S/M/L.

### Тема 1 — Доступность (Accessibility)

> **Решение, которое нужно принять до большинства этих пунктов:** принять WAI-ARIA-паттерн плоского дерева (`role="tree"` на контейнере, `role="treeitem"` на каждой опции, иерархия через `aria-level`/`aria-setsize`/`aria-posinset`, поскольку DOM — единый плоский outlet). Отдельные атрибуты (`aria-selected`, `aria-expanded`, `aria-checked`) **бессмысленны без ролей**, поэтому некоторые пункты «medium» здесь действуют только после появления ролей. Так как `KbqListSelection` намеренно опускает роли (там есть тест, утверждающий `role === null`), это осознанное изменение паттерна библиотеки — оформить как RFC одним связным a11y-эпиком и реализовать вместе.

| # | Sev | Brk | Effort | Находка | Расположение | Исправление |
|---|---|---|---|---|---|---|
| A1 | high | нет | S | У опций нет `role="treeitem"` | `tree-option.component.ts` host (80-95); базовый `KbqTreeNode` | Добавить `'role': 'treeitem'` в host опции; дать treeitem-роль и базовому `KbqTreeNode`. Без неё фокусируемые строки озвучиваются как обобщённые элементы без роли/позиции/состояния. |
| A2 | high | нет | S | Нет `aria-expanded` у раскрываемых узлов | `tree-option.component.ts` host (`isExpandable`/`isExpanded` уже вычисляются) | Привязать `'[attr.aria-expanded]': 'isExpandable ? isExpanded : null'` (опускается на листьях). Состояние раскрытия невидимо для AT, хотя Left/Right его уже переключают. |
| A3 | high | нет | M | Нет `aria-level` / `aria-setsize` / `aria-posinset` — иерархия не передаётся | `tree-option.component.ts` host; `level` из `KbqTreeNode.level` | Привязать `'[attr.aria-level]': 'level + 1'`; вычислить `aria-setsize`/`aria-posinset` из набора соседей. При плоском рендере глубина/позиция должны идти из этих атрибутов; данные есть, но используются лишь для отступов. |
| A4 | high | нет | L | Нет `role="group"` вокруг дочерних узлов | `tree-selection.component.ts` шаблон (114); `tree.ts` шаблон | При плоском data source выразить иерархию через `aria-level`/`setsize`/`posinset` (предпочтительнее реструктуризации в вложенный `role="group"`); задокументировать и реализовать единообразно. Пересекается с A3 — решать вместе. |
| A5 | medium | нет | S | У disabled-узлов нет `aria-disabled` | `tree-option.component.ts` host (89); также `toggle.ts`, `core/option/action.ts` | Добавить `'[attr.aria-disabled]': 'disabled || null'` к treeitem, toggle и action. Нативный атрибут `disabled` не имеет a11y-значения на кастомных элементах; SR не могут понять, что элемент disabled (keyManager его уже пропускает). |
| A6 | medium | нет | M | Toggle раскрытия — не доступный контрол | `toggle.ts` host (86-91, 98-101) | Выбрать модель: (a) настоящая кнопка — `role="button"`, tabindex, `aria-label`, `aria-expanded`, Enter/Space; или (b) `aria-hidden="true"` и опираться на `aria-expanded` treeitem + стрелки. Сейчас это кликабельная иконка без роли/имени/фокуса. |
| A7 | medium | нет | M | У action-кнопки строки нет роли/имени | `core/option/action.ts` host (46-54), используется через `tree-option.html` 19-23 | Дать `kbq-option-action` `role="button"` (или нативный `<button>`) + обязательный input `aria-label`; интегрировать в roving-фокус. Нарушает WCAG 4.1.2. Общий core-компонент — фикс полезен и списку. |
| A8 | medium | нет | S | Нет посимвольного поиска type-ahead | `tree-selection.component.ts` FocusKeyManager (288-290) | Добавить `.withTypeAhead()`; **также добавить `getLabel()` в `KbqTreeOption`** (например `return this.viewValue`) — `withTypeAhead()` бросает, если у элемента нет `getLabel`. Добавление `getLabel` — аддитивный публичный API (нужен `approve-api`). Соседи list/select/dropdown уже его используют. |
| A9 | medium | нет | M | Left не переходит к родителю; Right не переходит к первому ребёнку | `tree-selection.component.ts` onKeyDown LEFT/RIGHT (395-402) | Left: если раскрываемый+раскрыт → свернуть, иначе → фокус на родителя (`treeControl.getParents` + `keyManager.setActiveItem`). Right: если свёрнут → раскрыть, если раскрыт → фокус на первого ребёнка. Отклонение от WAI-ARIA tree-паттерна; использует существующие внутренности, без изменения API. |
| A10 | medium | нет | M | Tri-state псевдо-чекбокса не виден AT | `tree-option.html` (6); `checkboxState` (203, 240-254) | Привязать `aria-checked` (true/false/`mixed`) на treeitem в режиме чекбоксов, мапя `indeterminate`→`mixed`; обновлять при изменении потомков. Нужна роль (A1). |
| A11 | medium | нет | S | Нет `aria-multiselectable` на контейнере дерева | `tree-selection.component.ts` host; геттер `multiple` | Привязать `'[attr.aria-multiselectable]': 'multiple || null'` на host с `role="tree"`. Имеет смысл только после появления `role="tree"` (A12). |
| A12 | medium | нет | S | У контейнера нет `role="tree"` | `tree-selection.component.ts` host (123-131); `tree.ts` | Добавить `'role': 'tree'`; в паре с доступным именем (A13). Применить и к `KbqTree`. Первопричина читаемости всего паттерна для AT; якорь для A1/A2/A5/A10/A11. |
| A13 | low | нет | S | У контейнера дерева нет доступного имени | `tree-selection.component.ts` host (нет `aria-label`/`aria-labelledby`) | Добавить опциональные input-ы `aria-label`/`aria-labelledby` (аддитивно), привязанные на host с `role="tree"`; при `inSelect` — связать с label form-field. Зависит от A12. |
| A14 | low | нет | M | Модель roving-tabindex не оформлена; контейнер остаётся в табуляции | `tree-selection.component.ts` host tabindex (125); tabindex опции (88) | Выбрать одну модель целиком: привязать `'[attr.aria-activedescendant]'` к `keyManager.activeItem.id` (id уже есть), ИЛИ перевести активную опцию на `tabindex=0` (roving) и убрать контейнер из таб-порядка. Текущий гибрид не предъявляет ни того, ни другого. Нужны A1/A12. |

### Тема 2 — Корректность / баги

| # | Sev | Brk | Effort | Находка | Расположение | Исправление и обоснование |
|---|---|---|---|---|---|---|
| C1 | medium | нет | S | `selectAllOptions` испускает событие с `undefined` option | `tree-selection.component.ts` (546-564) | Защита: при `changedOptions.length === 0` пропустить `selectionChange.emit` (так, чтобы `onSelectAll.emit` всё ещё срабатывал при необходимости). Ctrl+A на полностью disabled / уже-всё-выбранном дереве испускает `{option: undefined}`, нарушая необязательный тип `option` → потребительское `event.option.data` падает. |
| C2 | medium | нет | S | Подписка `filterValue` в toggle никогда не отписывается (утечка) | `toggle.ts` конструктор (51-56) | Пропустить через `takeUntilDestroyed(inject(DestroyRef))` (соседний `padding.directive.ts:63` уже так делает). Один toggle на раскрываемую строку подписывается на долгоживущий `BehaviorSubject`; уничтоженные строки утекают подписчиками + удерживают директиву. |
| C3 | low | нет | S | `dataDiffer` не сбрасывается при смене `dataSource` | `tree-base.ts` `switchDataSource` (257-277) | Пересоздавать `this.dataDiffer = this.differs.find([]).create(this.trackBy())`, чтобы новый источник начинал с пустой базы. Смена на новый источник, чей поток испускает идентичный по trackBy массив, даёт null-diff → **устаревшие** (не пустые) строки. Узкий случай (нужен кастомный стабильный trackBy). |
| C4 | low | нет | S | У подписки `unorderedOptions.changes` нет `takeUntilDestroyed` | `tree-selection.component.ts` ngAfterContentInit (286) | Добавить `.pipe(takeUntilDestroyed(this.destroyRef))`, как у четырёх соседних подписок. Несогласованно с соседями; самозамкнутый цикл, поэтому влияние ограничено, но возможен устаревший обработчик при teardown. |
| C5 | low | нет | S | Избыточный двойной change-detection за рендер | `tree-selection.component.ts` `renderNodeChanges` (525-536); base (169) | Свести к одному `detectChanges` за рендер (предпочесть проход outlet-а; проверить, что пересчёт `sortedNodes` на 533 всё ещё выполняется). Тестировать осторожно — вызов в базе общий для всех потребителей `KbqTreeBase`. |
| C6 | low | нет | M | `FlatTreeControl.getParents` молча no-op без `node.parent` | `control/flat-tree-control.ts` (84-92) | Вычислять родителей по уровням (как `getDescendants`), ЛИБО формально требовать `.parent` и проставлять `flatNode.parent = parent` во flattener при transform. Tri-state-роллап и фильтрация предков молча ломаются, если `transformFunction` потребителя опускает `.parent`. Все поставляемые примеры его задают — это foot-gun, а не дефект в поддерживаемом использовании. |
| C7 | low | нет | S | setTimeout в `allowFocusEscape` не очищается при destroy | `tree-selection.component.ts` (736-745) | Хранить id таймаута и `clearTimeout` в `ngOnDestroy`, либо `destroyRef.onDestroy`, либо через существующий `AsyncScheduler`. Висящая макрозадача может вызвать `markForCheck` после destroy (сейчас терпимо, но хрупко). |
| C8 | low | нет | S | `highlightSelectedOption` фокусит `selected[0]` — неверная/устаревшая цель | `tree-selection.component.ts` (361-363, вызывается из focus 353) | При промахе `find()` — fallback на `keyManager.setFirstItemActive()`/`setActiveItem`; предпочитать `keyManager.activeItem`, если он есть. В multiple-режиме прыгает на первую вставленную (не последнюю активную) строку; после смены данных до реконсиляции ни одна строка не получает фокус. Узко, самовосстанавливается стрелкой. |
| C9 | low | breaking *только если делать async* | L | `NestedTreeControl._getDescendants` ждёт синхронный `getChildren` | `control/nested-tree-control.ts` (29-49) | **Задокументировать**, что `getChildren` должен испускать синхронно (корректно, non-breaking). **Не** менять `getDescendants` на возврат `Observable` — это сломает интерфейс `TreeControl` и всех синхронных вызывающих. Точная копия sync-data-ограничения CDK; async-использования в репо нет. Только латентный foot-gun. |

### Тема 3 — Change Detection и производительность

| # | Sev | Brk | Effort | Находка | Расположение | Исправление и обоснование |
|---|---|---|---|---|---|---|
| P1 | medium | нет | M | Нет дефолтного `trackBy` → полный ребилд view при замене данных | `tree-base.ts` trackBy input (51), dataDiffer (107) | Дать разумный дефолтный `trackBy` (по `treeControl.getValue(node)`, когда доступно); показать trackBy в примере доков. Замена `dataSource.data` заново уплощает в новый массив; identity-diff уничтожает+пересоздаёт каждую строку и форсит `syncSelectionModelToDataNodes`. Корректность сохраняется; чистые избегаемые издержки. |
| P2 | medium | нет | M | Пересчёт tri-state чекбоксов — O(options × depth × n) | `tree-option.component.ts` updateCheckboxState (240-254), descendants* (220-230), updateParents* (232-238), markForCheck (398-404) | Вычислять потомков **один раз** и выводить all/partial/none за один проход (не вызывать `getDescendants` дважды); не пересчитывать внутри `markForCheck` на каждую CD-метку; кэшировать `getDescendants` по узлу, пока `dataNodes` не меняется. Срабатывает только в tri-state-режиме чекбоксов, но select-all/глубокий выбор делают избыточный двойной `getDescendants` на опцию × предков. |
| P3 | medium | нет | S | Toggle утекает подписку `filterValue` на строку (CD-аспект) | `toggle.ts` (55) | **Тот же фикс, что C2** (`takeUntilDestroyed`) — dedup с C2. Числится в корректности и в CD; растущие per-emission CPU + удерживаемые директивы. |
| P4 | low | нет | L | Нет поддержки/гайда по virtual scroll для больших списков | `tree-base.ts` жадный `createEmbeddedView`; `viewChange` MAX_VALUE (59-65) | Минимум — **задокументировать**, что все раскрытые узлы рендерятся жадно; в идеале реализовать давно заложенное оконное `viewChange` (испускать видимые start/end, чтобы плоский источник нарезал) или дать `cdk-virtual-scroll`-паттерн по образцу select/list. |
| P5 | low | нет | M | Геттеры в шаблоне пересчитывают работу treeControl каждый CD-проход | `tree-option.component.ts` disabled (131-134), isExpandable (191-193); `toggle.ts` iconState; `tree-base.ts` isExpanded/level | Перенести «горячее» производное состояние в signals/`computed()` (мемоизация); также перестать биндить `disabled` дважды в host (class + attr). По отдельности дешёвые O(1)-вызовы; суммируются по строкам. Связано с миграцией accessor-входов. |
| P6 | low | нет | M | Подписки focus/blur пересобираются для всего списка при каждом изменении | `tree-selection.component.ts` optionFocus/BlurChanges (191-197), listenToOptionsFocus (764-776), resetOptions (747-750) | Рассмотреть один делегированный слушатель `focusin`/`focusout` на корне дерева (O(1) проводка); корректный `trackBy` (P1) также снижает частоту пересборки. Каждое структурное изменение сбрасывает/пере-merge-ит N per-row Subject-ов. |

### Тема 4 — Архитектура / связность

| # | Sev | Brk | Effort | Находка | Расположение | Исправление и обоснование |
|---|---|---|---|---|---|---|
| AR1 | medium | нет | M | Хрупкая глобальная статика передачи узла (`KbqTreeNode.mostRecentTreeNode`) | `tree-base.ts` static (289), ctor (317), insertNode (224-226) | Передавать данные узла через контекст embedded-view (`KbqTreeNodeOutletContext.$implicit` уже их несёт; уже потребляется в tree-selection 730) и читать из контекста вместо мутабельной статики. Опирается на синхронный порядок конструктора сразу после `createEmbeddedView`; ломается при отложенных view; утекает устаревшей глобальной ссылкой. Публичный геттер/сеттер `data` можно оставить. |
| AR2 | medium | нет | L | Середина миграции: standalone vs NgModule + decorator vs signal | `tree.module.ts`; множество `// TODO: Skipped for migration` в base/selection/option/toggle/padding | Вести как **один эпик**: разрешить конфликт типа input-а `treeControl` базы/подкласса (задокументированный блокер), перевести конструкторную инъекцию → `inject()`, локальное состояние → signals/`computed`, затем deprecate (не удалять) `KbqTreeModule`. В основном non-breaking, если `KbqTreeModule` только депрекейтить. |
| AR3 | medium | нет | M | Связь опция↔родитель через нетипизированный токен `tree: any` | `tree-option.component.ts` токен (44), поле (209), использования повсюду | Определить узкий интерфейс `KbqTreeOptionParent` (`selectionModel`, `treeControl`, `showCheckbox`, `multiple`, `inSelect`, `setSelectedOptionsByClick`, `optionShouldHoldFocusOnBlur`) и типизировать и `InjectionToken`, и `tree`. По образцу существующего паттерна `KBQ_OPTION_PARENT_COMPONENT` в core. Сужение типа *токена* non-breaking; публичное поле `tree` — это API1. |
| AR4 | low | нет | S | `KbqTreeNodePadding` жёстко зависит от конкретного `KbqTreeOption` | `padding.directive.ts` ctor (60), ngAfterViewInit (67) | Сделать зависимость `option` `@Optional()` с мягким fallback, либо поднять `isToggleInDefaultPlace` в `KbqTreeNode` (тот же ctor уже использует `@Optional() Directionality`). Латентный запах расширяемости; всё поставляемое использование — на опциях. |
| AR5 | low | нет | L | Устаревший жёсткий форк CDK-дерева без пути синхронизации | весь `tree-base.ts` и т.д.; TODO на 59; повреждённый `MсTreeFlattener` (кириллическая `с`) на `flat-data-source.ts:129` | **Quick win:** убрать чужой комментарий `TODO(tinayuangao)`, починить кириллическую опечатку `MсTreeFlattener` в JSDoc, добавить комментарий с версией CDK, от которой сделан форк. **Не** оборачивать CDK тонким слоем (крупно, риск для публичных экспортов) без RFC. Два конкретных дефекта косметические; форк — преднамеренное соглашение уровня библиотеки. |
| AR6 | low | нет | L | `KbqTreeSelection` — god-class на 811 строк | `tree-selection.component.ts` (134-811) | Опционально, низкий приоритет: вынести контроллер key-manager/фокуса, реконсилятор selection-model и обработчик copy; оставить `KbqTreeSelection` оркестратором CVA. Многие упомянутые члены публичны/потребляются через DI, поэтому «без слома API» не гарантировано. Соседний `KbqListSelection` крупнее (954 строки) с той же формой — это устоявшееся соглашение. Отложить, если не идёт активный рефакторинг. |
| AR7 | low | нет | M | Дублирование `getHeight`/SSR-guard + два источника правды о выборе | `tree-option.component.ts` getHeight (322-329) / `tree-selection.component.ts` getHeight (694-701) | Вынести SSR-safe helper высоты в общий util (мелко, безопасно). Долгосрочно сделать `SelectionModel` единым источником и выводить `option.selected` (затрагивает публичный геттер/сеттер `selected` → ревью check-api). `option._selected` зеркалит `selectionModel` — первопричина сложности реконсиляции. |
| AR8 | medium | **да** *(если удалять)* | M | Мёртвый/неиспользуемый код: bare `KbqTree`, `NestedTreeControl`, `KbqTreeNestedDataSource`, nested-путь рендера | `tree.ts` (21); `control/nested-tree-control.ts`; `data-source/nested-data-source.ts`; ветка parentData в `tree-base.ts` (208-211) | Решить: сделать реальный nested-пример + тесты, чтобы их оправдать, ЛИБО deprecate и удалить в мажоре (переработает токен DI у tree-select, использующий `KbqTree`). Если оставлять — разрешить русский TODO `getDescendants/_getDescendants`. `<kbq-tree>` нигде не инстанцируется (только токен DI). Для пути удаления нужен RFC. |
| AR9 | low | нет | S | `tree-errors.ts`: одна неиспользуемая фабрика | `tree-errors.ts` `getTreeControlFunctionsMissingError` (37-39) | Удалить единственную мёртвую фабрику. (Пропуск в barrel и duck-typing уже согласованы — больше ничего не нужно.) |

### Тема 5 — Modern Angular

> Всё это — пункты соглашений/модернизации (репо открыто в середине миграции с маркерами `// TODO: Skipped for migration`). **Не runtime-дефекты.** Сгруппировать с AR2 в один эпик миграции. Большинство non-breaking; затрагивающие **конструкторы** экспортируемых классов технически breaking для внешних наследников и требуют `approve-api`.

| # | Sev | Brk | Effort | Находка | Расположение и исправление |
|---|---|---|---|---|---|
| M1 | medium | нет | M | Toggle: конструкторная инъекция + accessor-`@Input` + (утечка) | `toggle.ts` (51-56, 21-30, 34-45) → `inject()` для `tree`/`treeNode`; пропустить `filterValue` через `takeUntilDestroyed` (= C2/P3); перевести `recursive`/`disabled` на `input()` с `booleanAttribute`. `disabled` пишется внутренне → подавать input в signal, а не чистый `input()`. |
| M2 | low | нет | M | `KbqTreeSelection` использует конструкторную инъекцию | `tree-selection.component.ts` (261-283) → field `inject()` для elementRef/scheduler/differs/CDR/clipboard; читать `multiple` через `getAttribute`; оставить `super(differs, changeDetectorRef)`. |
| M3 | low | **да** | M | `KbqTreeOption` использует конструкторную инъекцию | `tree-option.component.ts` (205-212) → `inject()`; координировать с базой `KbqTreeNode` (вызов super). Конструкторы — отслеживаемый публичный API → `approve-api` + breaking для внешних наследников. |
| M4 | low | **да** | L | `KbqTreeBase` конструкторная инъекция + decorator `@Input`/`@ViewChild`/`@ContentChildren` | `tree-base.ts` (101-104, 43, 86-97, 54, 57) → `inject()` для differs/CDR; `contentChildren()`/`viewChild()` после согласования переопределения подкласса; `treeControl`/`dataSource` → `input()` — breaking, координировать с сужением подкласса (задокументированный блокер). |
| M5 | low | нет\* | M | База `KbqTreeNode` использует конструкторную инъекцию | `tree-base.ts` (313-318) → мигрировать **аккуратно**: база инжектит через `KbqTreeBase`, подкласс инжектит `tree` через `KBQ_TREE_OPTION_PARENT_COMPONENT` (разные токены, совпадают только через `useExisting`). Наивный фикс «убрать super()» некорректен. \*ctor в api.md. |
| M6 | low | нет | S | `KbqTreeNodePadding` использует конструкторную инъекцию | `padding.directive.ts` (55-64) → поля `inject()`; перенести подписку `dir.change` в field-init/init. Только DI, без влияния на API. |
| M7 | low | нет | S | `KbqTreeNodeOutlet` использует конструкторную инъекцию | `outlet.ts` (7-10) → `readonly viewContainer = inject(...)`, `readonly changeDetectorRef = inject(...)`; сохранить публичные имена (потребляются `KbqTreeBase`). |
| M8 | low | нет\* | S | Простые `@Output` EventEmitter должны быть `output()` | `tree-selection.component.ts` selectionChange (168), onCopy (172); `tree-option.component.ts` userInteraction (162) → `output()`; проверить, что `this.onCopy.observed` работает (на `OutputEmitterRef` — да). \*меняет объявленный тип в api.md → пере-approve. |
| M9 | low | нет | M | Decorator `@ViewChild`/`@ContentChildren` вместо signal-запросов | `tree-selection.component.ts` (158, 160); `tree-option.component.ts` (105) → `viewChild()`/`contentChildren()`; заменить `unorderedOptions.changes` на `effect()`/`toObservable()`. `parentTextElement` читается извне через `KbqTitleTextRef` — мигрировать в связке. |
| M10 | low | **да** | M | input `treeControl` типизирован `FlatTreeControl<any>` | `tree-selection.component.ts` (164) → параметризовать конкретным типом узла; батчить в breaking-набор `@Input()`→`input()`. Первопричина — `extends KbqTreeBase<any>`. |
| M11 | low | нет\* | L | Состояние `KbqTreeOption` мутируется через `markForCheck`, не signals | `tree-option.component.ts` `_selected`/`_disabled`/`hasFocus`/`checkboxState` (144, 176, 189, 203, 260-358) → перенести `hasFocus`/`checkboxState` в `signal()`/`computed()` (по образцу shim-а `disabledSignal` у button, чтобы сохранить публичные геттеры). \*голым публичным полям нужны обёртки-геттеры, чтобы не менять тип. |
| M12 | low | нет | M | `indent` в `KbqTreeNodePadding` — accessor-`@Input` | `padding.directive.ts` (28-37) → `input(12, { alias, transform })` + `effect()`, управляющий `setPadding()`; воспроизвести побочный эффект CSS-единиц из `setIndentInput`. |
| M13 | low | нет\* | L | `renderedOptions`/`unorderedOptions` реконсилируются императивно | `tree-selection.component.ts` (143, 707-722, 285-332) → ниже приоритет. FocusKeyManager нужен живой QueryList, а порядок зависит от порядка ViewContainer, поэтому чистая конверсия в signals ограничена. \*оба — публичные поля, читаемые извне. |

### Тема 6 — API и типизация

| # | Sev | Brk | Effort | Находка | Расположение | Исправление и обоснование |
|---|---|---|---|---|---|---|
| API1 | high | **да** | M | Повсеместный `any` на публичных членах `KbqTreeOption` (`value`, `disabled`, `showCheckbox`, `tree`) | `tree-option.component.ts` (119-127, 136, 155, 209, 360) | Типизировать `tree` узким интерфейсом `KbqTreeOptionParent` (главный выигрыш; избегает циклического импорта option↔selection); сеттеры с булевой коэрцией → `BooleanInput`/`unknown`, геттеры → `boolean`; сделать `value` дженериком, когда компонент станет дженериком. `tree: any` стирает проверки по всей поверхности взаимодействия опции; нарушает правило проекта «избегать any». Сужение публичного `tree` breaking для наследников → `approve-api`. |
| API2 | medium | **да** | L | Компоненты захардкожены на `KbqTreeBase<any>` | `tree.ts` (21); `tree-selection.component.ts` (135, 164) | Долгосрочно: сделать `KbqTree<T>`/`KbqTreeSelection<T>` дженериками, чтобы тип узла протекал в treeControl/dataSource/значения/события — **мажор + RFC**. Краткосрочно: задокументировать ограничение. Замена на `unknown` безопасна только для passthrough bare `KbqTree`. Сейчас весь вывод типов на стороне потребителя теряется. |
| API3 | medium | **да** *(при сужении)* | M | Большая внутренняя поверхность открыта как публичная (движок рендера + хелперы) | `tree-base.ts` renderNodeChanges/getNodeDef/insertNode/viewChange/nodeOutlet/nodeDefs; многие методы `KbqTreeSelection` | Аудит каждого члена: template-only → `protected`; используемые соседями (например `setSelectedOptionsByClick`) → оставить public + `@docs-private` (non-breaking, поясняет намерение); действительно внутренние → `private`. Сужение видимости breaking → батчить в мажор. Машинерия рендера CDK + десятки методов-коллабораций публичны/недокументированы, замораживая детали реализации как контракт. |
| API4 | low | нет | S | `KbqTreeOptionChange.isUserInput` депрекейтнут в тексте, но без тега `@deprecated` | `tree-option.component.ts` (46-61) | Добавить `/** @deprecated Will be removed in v20. */` на поле и параметр ctor; перезапустить `approve-api`. Тулинг не покажет депрекейт до удаления в v20. |
| API5 | low | нет | S | Поверхность CVA полностью типизирована `any`; опечатка `registerOnTouched(fn: () => {})` | `tree-selection.component.ts` writeValue (585), onChange (598), getSelectedValues (670), registerOnTouched (608) | Исправить `registerOnTouched(fn: () => void)` (non-breaking расширение; совпадает с Angular CVA; та же опечатка в autocomplete/select/tree-select — чинить вместе); типизировать поверхность значений на дженерик узла позже. Требует `approve-api`. |
| API6 | low | breaking *(строка снапшота)* | S | Приватный тип `SelectionModelOption` течёт в публичный API | `tree-selection.component.ts` (104-107, 147) | Типизировать `selectionModel` честно как `SelectionModel<any>` (или экспортированный тип узла) — убирает предупреждение `ae-forgotten-export`; объявленная форма `{id,value}` — фикция (хранятся сырые узлы). Перезапустить `approve-api`. Сейчас неимпортируемо, так что не неожиданный слом для потребителя. |
| API7 | low | нет | S | Токены `KBQ_SELECTION_TREE_VALUE_ACCESSOR` и `KBQ_TREE_OPTION_PARENT_COMPONENT` типизированы `any` | `tree-selection.component.ts` (60); `tree-option.component.ts` (44) | Типизировать const провайдера как `Provider`; токен как `InjectionToken<KbqTreeSelection>` или интерфейс родителя (обходит циклический импорт). Сужение токена низкорисковое; нужен `approve-api`. Усиливает AR3/API1. |
| API8 | low | **да** | L | Дизайн дженериков `TreeControl`: `getDescendants` возвращает `any[]`, `getParents(node: any)`, рыхлая типизация `value` | `control/tree-control.ts` (36); `control/flat-tree-control.ts` (84, 24, 28, 30, 94) | Сузить возврат интерфейса до `T[]` (совпадает с реализациями); добавить value-дженерик `TreeControl<T, V = any>`; `getParents(node: T)`. Изменения интерфейса ломают кастомных реализаторов → мажор + RFC. |
| API9 | low | нет\* | M | Пробелы null-safety на публичных input-ах | `tree-base.ts` treeControl (43), сеттер dataSource (91); геттер disabled `tree-option.component.ts` (133) | Убрать несогласованность `this.tree!` против незащищённого `this.tree.treeControl` на строке 133 (безопасно). Добавить `\| null` к типу сеттера `dataSource`, раз код уже ветвится на falsy. \*перетипизация input-ов меняет api.md → `approve-api`. |
| API10 | low | **да** | M | Именование outputs: `on`-префиксы против соглашения Angular; сырые публичные Subject | `tree-selection.component.ts` onSelectAll/onCopy (170, 172); `tree-option.component.ts` onSelectionChange (161), onFocus/onBlur (99-101) | Для мажора: переименовать `on*`-outputs, убрав префикс (`selectAll`/`copy` свободны); выставить `onFocus`/`onBlur` как `asObservable()` (обновить внутренних потребителей merge на 192/196). Все переименования breaking → deprecation-алиасы в мажоре. Сырые публичные `Subject` позволяют потребителям `.next()` подделывать события. |
| API11 | low | нет *(с `@docs-private`)* | S | Поверхность экспортов не минимальна: дефолтные классы фильтров + внутренности flattener публичны | `public-api.ts` (3); `flat-tree-control.filters.ts`; `flat-data-source.ts` | Оставить `FlatTreeControlFilter` + `FilterByValues` + `kbqTreeSelectAllValue` публичными (расширяемость); добавить `@docs-private` двум дефолтным фильтрам (`FilterByViewValue`/`FilterParentsForNodes`) и `flattenNode`/`flattenChildren`. Non-breaking. |

### Тема 7 — Тесты

| # | Sev | Effort | Находка | Расположение | Что добавить |
|---|---|---|---|---|---|
| T1 | high | M | Tri-state чекбоксов / indeterminate / каскад родителей не тестируется | `tree-option.component.ts` updateCheckboxState; `tree-selection.component.ts` setStateChildren (680-688) | Проверять, что `option.checkboxState` === checked/indeterminate/unchecked для all-/some-/none-выбранных детей; тестировать каскад `setStateChildren(parent, true/false)` в модель. Использовать `fakeAsync`/`tick` (состояние идёт через `Promise.resolve().then`). Публичный API с несколькими потребителями, сейчас валидируется только пикселями Playwright. |
| T2 | medium | M | Навигация с клавиатуры почти не покрыта | `tree-selection.component.ts` onKeyDown (374-429) | describe «keyboard navigation» с реальными keydown (DOWN/UP/HOME/END/PAGE_UP/PAGE_DOWN/SPACE/ENTER/LEFT/RIGHT/TAB); ассерты `activeItemIndex`, `navigationChange`, переключения раскрытия, выбор + `selectionChange`, tabOut/`allowFocusEscape`. Основная модель взаимодействия; спек диспатчит только C и Ctrl+A. |
| T3 | medium | M | Поведение disabled-элементов без юнит-покрытия | `tree-option.component.ts` selectViaInteraction/focus/onMouseenter; `tree-selection.component.ts` selectAllOptions/selectActiveOptions | Фикстура с предикатом `isDisabled`: ассерты, что клик по disabled — no-op, Ctrl+A исключает disabled, shift-range пропускает disabled, disabled не получает `kbq-focused` при hover. |
| T4 | medium | S | Гард `noUnselectLast`/`canDeselectLast` без тестов | `tree-selection.component.ts` canDeselectLast (800-802) + места вызова | При `noUnselectLast=true` ассертить, что единственный выбранный узел остаётся выбранным при повторном click/ctrl-click/space; при `=false` — что снимается; покрыть ветку shift-range. Off-by-one (`selected.length === 1`) на 4 путях; соседний list это тестирует. |
| T5 | medium | M | Поведение директивы/компонента toggle без тестов | `toggle.ts` (51-70, 47-49) | Восстановить/починить тест expand/collapse; добавить recursive (`toggleDescendants`), `stopPropagation` (toggle не выбирает строку), авто-disable по фильтру и тест teardown подписки `filterValue` (C2). Основной путь toggle→expand частично покрыт (тест восстановления фильтра); recursive/guard/leak — нет. |
| T6 | medium | M | Покрытие директивы padding — один happy-path-ассерт | `padding.directive.ts` (71-78, 116-121, 100-114, 39-47) | Тестировать глубокий уровень `paddingLeft = level*indent+leftPadding`; RTL (`Directionality` rtl → `paddingRight`, реагирует на `dir.change`); `withIcon=false` добавляет `iconWidth`; строковый indent с кастомными единицами (вскрывает латентный баг хардкода `px`). Переиспользовать `expectFlatTreeToMatch` на не-disabled фикстуре. Единственный активный тест padding тавтологичен. |
| T7 | low | M | Пайплайн фильтров `FlatTreeControl` + хелперы поиска без прямых тестов | `control/flat-tree-control.ts`; `flat-tree-control.filters.ts` | Добавить `flat-tree-control.filters.spec.ts` (каждый фильтр изолированно, включая pop sentinel-а selectAll); прямые тесты `getDescendants`/`getParents`/`hasValue`/сохранение+восстановление раскрытия. |
| T8 | medium | M | Flattener + ветки change-stream flat data-source без тестов | `data-source/flat-data-source.ts` expandFlattenedNodes (94-117), flattenNode async (61-64), connect (162-183), handlers (185-197) | Добавить `flat-data-source.spec.ts`: `flattenNodes` на массиве + Observable-детях, `expandFlattenedNodes` со смешанным раскрытием, marble/TestScheduler-тест `connect()` (различение filter vs expansion). Ключевые алгоритмы формирования данных, где off-by-one в цикле уровней портит, какие узлы рендерятся. |
| T9 | low | S | Краевые случаи CVA + `setDisabledState` без тестов | `tree-selection.component.ts` writeValue/setOptionsFromValues/setDisabledState/getSelectedValues (585-674) | `writeValue('x')` бросает в multiple-режиме; `writeValue(null)` чистит; неизвестное значение игнорируется; `setDisabledState(true)` помечает опции; `getSelectedValues` scalar (single) vs array (multiple). Границы интеграции с формами; сейчас задействованы только через ngModel. |
| T10 | low | M | У nested-дерева нет компонентного теста | `data-source/nested-data-source.ts`; `nested-tree-control.ts` | Отрендерить `KbqTreeNestedDataSource` + `NestedTreeControl`: дети рендерятся при раскрытии, level/padding из parentData, `getDescendants` с sync + отложенным `getChildren`. Связано с AR8 — если nested удалят, теряет смысл. |
| T11 | low | M | Нет тестов teardown/утечек подписок | `tree-selection.component.ts` ngOnDestroy (339-343); `tree-base.ts` (114-125); `toggle.ts` | Spy на `dataSource.disconnect`/`focusMonitor.stopMonitoring`, ассерт вызова на `fixture.destroy()`; ассерт обнуления focus/blur-подписок между пере-рендерами; регресс-тест на утечку toggle (после C2). В `title.directive.spec` уже есть такой паттерн. |
| T12 | medium | M | В наборе тестов дерева нет проверок AXE/ARIA/ролей | `tree-selection.component.spec.ts` (целиком) | После a11y-эпика: проверка AXE по конфигам single/checkbox/disabled; ассерты ролей + `aria-selected`/`expanded`/`disabled`; ассерт реального `document.activeElement` при навигации с клавиатуры (не только CSS-классы). Ассерт activeElement применим уже сейчас. |
| T13 | medium | M | Много отключённых/skip-тестов маскируют покрытие | `tree-selection.component.spec.ts` xit (81, 222), xdescribe (509), it.skip (132) | Восстановить + починить тесты `xit`/`xdescribe` (корректность отрендеренных данных, шаблоны с `when`-предикатом); превратить `it.skip` (DS-5079) в failing-then-fixed тест со связанной issue. Маркеры «todo need recover» сигналят о дрейфе; зелёный прогон завышает покрытие. |

### Тема 8 — Стили / Темизация

| # | Sev | Effort | Находка | Расположение | Исправление и обоснование |
|---|---|---|---|---|---|
| S1 | medium | S | Padding toggle ссылается на необъявленный токен `--kbq-tree-size-toggle-padding` | `toggle.scss` (12-14) | Объявить `--kbq-tree-size-toggle-padding` в `tree-tokens.scss`, замапленный на токен `--kbq-size-*` (сверить значение со спекой дизайна), либо добавить fallback в `var()`; убрать FIXME. У `var()` нет fallback, а токен нигде не определён → toggle получает 0 горизонтального padding (уменьшенная зона нажатия). Автор пометил `// FIXME`. |
| S2 | medium | S | Padding текста опции читает чужой list-токен | `tree-option.scss` (52-53) | Использовать собственный токен дерева `--kbq-tree-size-text-padding-vertical` (объявлен на `tree-tokens.scss:9`, но не используется); list-токен `--kbq-list-size-text-padding-vertical` здесь нигде не определён, поэтому молча резолвится в 0, и задуманный 3xs-padding дерева теряется. Кросс-неймспейс-связность + латентная визуальная регрессия + мёртвый токен дерева. |
| S3 | low | S | Миксины theme + typography эмитятся 3× при `ViewEncapsulation.None` | `tree.scss` (7-8), `tree-selection.scss` (7-8), `toggle.scss` (33-34) | Включать `kbq-tree-theme()`/`kbq-tree-typography()` ровно один раз из одного корневого stylesheet, всегда загружаемого с деревом (по образцу single-include button/list). Каждый компонент указывает на свой корневой scss; все None-инкапсулированы → одинаковые глобальные блоки дублируются 3×. Безвредно, но ~3× избыточный CSS. |
| S4 | low | S | Caption-типографика бьёт по несуществующему `.kbq-tree-option-caption` | `_tree-theme.scss` (94) | Переименовать селектор в `.kbq-option-caption` (совпадает с разметкой + правилом цвета на строке 23). Мёртвое правило (лишний сегмент `-tree-`); caption никогда не получает text-compact-типографику. Косметика. |
| S5 | low | нет *(token surface)* | M | Мёртвые токены pressed/active-состояния объявлены, но не потребляются | `tree-tokens.scss` (19, 34, 36) | Либо реализовать active-состояние в `_tree-theme.scss` (`&:active:not(.kbq-disabled)`, потребляя токены, по образцу `_button-theme.scss`), либо удалить токены. Удаление трогает публичную token-поверхность (не TS api guard). У трёх токенов `*-active-container-background` ноль потребителей. |
| S6 | low | нет *(token surface)* | S | Неиспользуемый токен `--kbq-tree-size-container-content-gap-vertical` | `tree-tokens.scss` (7) | Замапить на токен `--kbq-size-*` (не сырой `0px`) и подключить в layout, либо удалить. Горизонтальный сосед потребляется; возможно, это преднамеренный паритет дизайн-системы со списком. |

---

## 3. Рекомендуемый порядок исполнения (фазирование)

### Фаза 0 — тривиальные чистки (нулевой риск, без влияния на API/снапшот)
AR5 (убрать `TODO(tinayuangao)` + починить кириллическую опечатку `MсTreeFlattener` + добавить комментарий о происхождении форка) · AR9 (удалить единственную мёртвую `getTreeControlFunctionsMissingError`) · API9-часть (убрать несогласованность `this.tree!` на строке 133 `tree-option`) · S4 (переименовать caption-селектор) · S3 (убрать дублирование include theme/typography).

### Фаза 1 — быстрые баг-фиксы (мелкие, в основном non-breaking, высокая ценность)
- **C2 / P3 / M1(часть про утечку)** — починить утечку подписки `filterValue` в toggle через `takeUntilDestroyed` (один фикс закрывает три находки)
- **C1** — защитить `selectAllOptions` от испускания `{option: undefined}`
- **C4** — добавить `takeUntilDestroyed` к `unorderedOptions.changes`
- **C7** — очищать таймаут `allowFocusEscape` при destroy
- **C8** — fallback `highlightSelectedOption` на key manager при промахе
- **C3** — сбрасывать `dataDiffer` при смене data source
- **C5** — свести избыточный двойной `detectChanges` (тестировать против всех потребителей `KbqTreeBase`)
- **S1 / S2** — объявить недостающий токен padding toggle; использовать собственный токен padding текста (визуальные фиксы)
- **API4 / API5 / API6 / API11** — тег `@deprecated`; `registerOnTouched(fn: () => void)`; честный тип `selectionModel`; `@docs-private` на дефолтных фильтрах/внутренностях flattener (каждое → `approve-api`)

### Фаза 2 — производительность (средний эффорт, non-breaking, аддитивно)
P1 (дефолтный `trackBy`, также снижает реконсиляцию выбора + частоту пересборки P6) + пример в доках · P2 (однопроходный расчёт потомков для чекбоксов + не пересчитывать на каждый `markForCheck`) · P4 (задокументировать жадный рендер; virtual-scroll запланировать крупным follow-up) · P5/P6 (мемоизация геттеров, делегированный focus-слушатель — ниже приоритет, частично связаны с M11/M13).

### Фаза 3 — a11y-эпик (СНАЧАЛА RFC, затем реализовать единым блоком)
> RFC, потому что принятие `role="tree"`/`treeitem` — осознанный отход от соглашения `KbqListSelection` «без ролей» и должно быть согласовано между соседями. Реализовать роли + состояния вместе.
- Базовые роли/структура: **A12 (role=tree) → A1 (treeitem) → A3+A4 (aria-level/setsize/posinset)**
- Состояния поверх ролей: **A2 (aria-expanded), A5 (aria-disabled), A11 (aria-multiselectable), A10 (aria-checked tri-state), A13 (доступное имя)**
- Модель фокуса: **A14 (aria-activedescendant или честный roving tabindex)**
- Полнота клавиатуры: **A8 (type-ahead + `getLabel`), A9 (Left→родитель / Right→ребёнок)**
- Интерактивные под-контролы: **A6 (toggle), A7 (action-кнопка — общий core-компонент, координировать с list)**
- Затем **T12** (ассерты AXE + ARIA), когда компонент выставит семантику.

### Фаза 4 — добивка тестов (non-breaking, можно параллельно с фазами 1–3)
Сначала высокая ценность: **T1, T2, T3, T4, T5, T6, T8.** Затем **T9, T7, T11, T13.** **T10** — только если AR8 сохраняет nested.

### Фаза 5 — эпик миграции Modern Angular (в основном non-breaking; часть breaking — см. §4)
> Один скоординированный эпик (AR2). Сначала разрешить конфликт типа input-а `treeControl` базы/подкласса (задокументированный блокер для `input()`).
- Non-breaking механическое: **M2, M6, M7** (ctor → `inject()` для DI-only классов), **M8** (`output()` — пере-approve снапшота), **M12, M9, M11, M13** (signals/queries, ниже приоритет)
- Breaking, батчить в мажор: **M3, M4, M5** (изменения ctor у экспортируемых классов), **M10** (типизация treeControl)
- **AR1** (заменить статическую передачу узла контекстом embedded-view) может выйти отдельно; non-breaking.
- **AR3 / API7** (сузить токен/интерфейс родителя опции) — сужение внутреннего токена non-breaking и разблокирует API1.
- **AR4** (отвязать padding от конкретной опции), **AR7** (общий util высоты) — мелкие, non-breaking.

### Фаза 6 — крупные / breaking рефакторинги (RFC + мажор)
**API1** (типизировать поле `tree` / булевы сеттеры) · **API2** (дженерики `KbqTree<T>`/`KbqTreeSelection<T>`) · **API3** (сузить видимость) · **API8** (дженерики интерфейса TreeControl) · **API10** (переименовать `on*`-outputs + `asObservable` для Subject, с deprecation-алиасами) · **AR8** (решить судьбу nested; переработает токен DI tree-select) · **AR6** (вынос god-class — опционально) · **S5/S6** (изменения token-поверхности) · **AR5 вариант (b)** / де-форк через тонкую обёртку CDK — только при стратегическом решении.

---

## 4. Backward-incompatible изменения (call-outs)

Эти меняют публичный API (`tools/public_api_guard/components/tree.api.md`) и/или видимый контракт. Каждому нужен `approve-api`; большинству — **RFC + мажор** с deprecation-алиасами:

1. **API2** — сделать `KbqTree`/`KbqTreeSelection` дженериками (`<T>`). RFC.
2. **API1** — сужение публичного поля `tree: any` у `KbqTreeOption`. Breaking для внешних наследников.
3. **API8** — сужение интерфейса `TreeControl` (`getDescendants: T[]`, value-дженерик, `getParents(node: T)`). Ломает кастомных реализаторов. RFC.
4. **API3** — снижение видимости (public → `protected`/`private`) машинерии рендера и методов-коллабораций. (`@docs-private` сам по себе non-breaking; изменения видимости — нет.)
5. **API10** — переименование `on`-префиксных outputs и конверсия публичных `onFocus`/`onBlur` Subject в Observable. Поставлять deprecation-алиасы.
6. **AR8** — удаление bare `KbqTree`, `NestedTreeControl`, `KbqTreeNestedDataSource`, nested-пути рендера. Также переработает токен DI у `tree-select`. RFC.
7. **M3 / M4 / M5** — конверсия **конструкторов** экспортируемых классов в `inject()` убирает задокументированные параметры конструктора (breaking для внешнего инстанцирования/наследования).
8. **M10** — перетипизация input-а `treeControl` (связана с батчем `@Input()`→`input()`).
9. **C9 (НЕ принимать async-вариант)** — возврат `Observable` из `NestedTreeControl.getDescendants` сломает интерфейс и всех синхронных вызывающих; **только задокументировать** синхронное ограничение.

**Non-breaking, но требует пере-approve снапшота `approve-api`** (можно вне мажора): API4, API5, API6, API7, API11, M8 (смена объявленного типа `EventEmitter`→`OutputEmitterRef`), API9 (сеттер dataSource `| null`) и добавление `getLabel` из A8.

**Аддитивно / только поведение, без влияния на публичный API:** весь a11y-эпик (host-привязки атрибутов + роли), все пункты Тестов, все пункты Производительности (дефолтный `trackBy` лишь добавляет дефолт уже-опциональному input-у), AR1/AR4/AR7 и SCSS S1–S4 (CSS-переменные/селекторы не в TS api guard; S5/S6 трогают публичную *token*-поверхность, на которую могут опираться нижестоящие переопределения тем, поэтому удаление токенов считать мягким breaking темизации).

---

## 5. Отклонённые находки (отфильтрованы состязательно)

Для прозрачности: 12 сырых находок отклонены состязательным проходом верификации как ложные или преднамеренные. **Это не задачи** — перечислены, чтобы их не поднимали повторно:

| Отклонённое утверждение | Почему отклонено |
|---|---|
| Map `levels` в `KbqTreeBase` растёт неограниченно (утечка памяти) | На практике ограничен/очищается; не настоящая утечка. |
| `selectActiveOptions` разыменовывает `options[toIndex]` при `activeItemIndex === -1` | Покрыто веткой `fromIndex === -1` — падения нет. |
| `syncSelectionModelToDataNodes` упускает in-place мутацию данных | Поведение корректно для поддерживаемого потока данных (immutable-replace). |
| `expandFlattenedNodes` течёт состоянием уровней между соседями | Алгоритм level-AND корректен. |
| `FilterParentsForNodes.handle` бросает на undefined `prevFilter` | Не бросает — опциональная цепочка это обрабатывает. |
| keyManager поверх `renderedOptions` через `.reset()` десинхронизирует `activeItem` | Не воспроизводится; индекс обновляется согласованно. |
| `getSortedNodes` кастит viewRef `as any` / незащищённый `.context.$implicit` | Приемлемо для контракта embedded-view здесь. |
| Whole-tree `detectChanges()` на каждый рендер | Это и есть C5 (учтено один раз), не отдельная находка. |
| Нет видимого индикатора фокуса для mouse/программного фокуса (только keyboard-кольцо) | Преднамеренное соглашение библиотеки (гейтинг через `.cdk-keyboard-focused`). |
| Несогласованный `readonly` на публичных мутабельных полях состояния | Не дефект. |
| Тесты опираются на «приватные» внутренности / подделку событий | Используемые члены публичны (без модификатора доступа), так что по этому критерию не хрупкие. |
| Состояние фокуса опирается только на `border-color`, без `outline` | Преднамеренный дизайн (совпадает с паттерном кольца keyboard-фокуса). |

---

*Сгенерировано автоматизированным мультиагентным ревью с состязательной верификацией каждой находки, плюс ручное прочтение всех 24 исходных файлов. Воспринимайте как бэклог с высоким уровнем сигнала; англоязычный оригинал — `docs/REVIEW.tree.md`.*
