# Компонент `select` Koobiq — код-ревью и план улучшений

> Охват: `packages/components/select` + общие абстракции `core`, которые он использует (`core/option`, `core/select`) · Коммит `3d86d38f` · 2026-06-29
> Подготовлено автоматическим многоагентным ревью (8 измерений + состязательная проверка каждой находки). Подтверждено 70 находок (2×P0, 8×P1, 24×P2, 36×P3); 3 отклонено. Используйте как высокосигнальную отправную точку; перепроверяйте перед действиями.
> Находки с пометкой **(shared)** лежат в `core` и затрагивают также `tree-select` / `autocomplete`. Документ — это ревью и дорожная карта; исходный код им не меняется.

---

## 1. Краткое резюме

- **Доступность — главный риск и единственный блокер релиза.** Компонент фактически не реализует ARIA-семантику: у host нет `role="combobox"`/`aria-expanded`/`aria-controls`/`aria-activedescendant`, у оверлея нет `role="listbox"`, у `kbq-option` нет `role="option"`/`aria-selected`, а кнопка удаления тега недоступна с клавиатуры. Это прямо нарушает собственное требование проекта «MUST pass AXE / WCAG AA» (AGENTS.md). Здесь сосредоточены **2×P0 + несколько P1/P2**.
- **Подтверждённая утечка памяти в продакшене.** Подписка `localeService.changes` создаётся в конструкторе (`select.component.ts:858`) **без отписки**, а сервис — `providedIn: 'root'`-синглтон, поэтому каждый созданный-и-уничтоженный `KbqSelect` удерживается на всё время жизни приложения и продолжает дёргать `markForCheck`.
- **Реальный баг корректности в RTL с широким радиусом поражения.** `triggerValues` (`select.component.ts:760`) вызывает `.reverse()` **на месте** на мемоизированном массиве CDK `SelectionModel.selected` во время change detection — недетерминированно портит порядок выбора и протекает в эмитируемое значение формы. Это общий корень нескольких находок по корректности / производительности / шаблонам.
- **Компонент — «god-класс» на ~1947 строк со смешанными стилями DI/inputs.** Он несёт 6+ ответственностей, ~12 легаси `@Input`-аксессоров с устаревшими TODO о миграции, конструктор на 13 параметров и `@Output` EventEmitter — расходясь с уже мигрированным соседом `tree-select`. Это не рантайм-баг, но концентрирует «дрожь» change detection и замедляет развитие.
- **Узкие места производительности реальны, но ограничены.** `ngDoCheck` форсирует reflow на каждом такте CD (`isVisible()` читает `offsetTop`/`offsetHeight`), а `calculateHiddenItems` делает двойное клонирование DOM с чтением/записью и до ~2–3 синхронных `detectChanges()`. И то и другое решается обсерверами + единым пакетным проходом измерения.
- **Что сильно.** Жизненный цикл оверлея/скролла в основном дисциплинирован — `subscribeToScrolledToBottom()` и `resetOptions()` корректно ограничены (`takeUntil(closedStream)` / `takeUntil(options.changes)`) и служат эталоном, который должны скопировать протекающие места. Именование токенов, BEM-неймспейсинг и существующая база `KbqAbstractSelect` дают чистые швы для рефакторинга.
- **В покрытии тестами есть структурные «ложные срабатывания».** Тесты сортировки по умолчанию проходят вхолостую (строковые фикстуры превращают `a.value - b.value` в `NaN`-no-op), нет покрытия ARIA/AXE и состояний loading/error/empty — то есть самые рисковые области защищены хуже всего.

## 2. Оценочная таблица

| Измерение | Оценка | P0 | P1 | Комментарий |
|---|---|---|---|---|
| Архитектура и соглашения | C | 0 | 1 | God-класс + легаси-аксессоры/DI; устаревшие TODO; сосед уже мигрирован. |
| RxJS и жизненный цикл | B− | 0 | 1 | Одна реальная утечка root-синглтона (locale); остальное ограничено или мелочи. |
| Корректность | C+ | 0 | 1 | RTL `reverse()` на месте портит порядок значения; крайние случаи clear/sort/desync. |
| Доступность | F | 2 | 3 | Нет ARIA combobox/listbox/option; удаление тега не с клавиатуры. **Блокер релиза.** |
| Производительность | C+ | 0 | 0 | Reflow на каждом такте + двойное клонирование при измерении; ограничено, но исправимо. |
| Публичный API и типы | B− | 0 | 0 | Нетипизированная поверхность `any`; мёртвый экспорт; асимметричный аксессор; `@Input`-метод. |
| Тесты | C | 0 | 1 | Холостые тесты сортировки; нет ARIA/AXE; loading/error/empty не покрыты. |
| Шаблоны и стили | B− | 0 | 1 | Разделяет баг RTL `reverse()`; дублирование/дрейф глобальных селекторов vs tree-select. |

## 3. Приоритизированные находки (дедуплицированы, проверены)

### P0 — Блокеры релиза

**SEL-A11Y-01 · Нет combobox-семантики на host** — `select.component.ts:182` (host-объект).
Host задаёт только `tabindex`/`disabled`/классы — нет `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-required`, `aria-invalid`, `aria-disabled`, `aria-labelledby`. Скринридер объявляет безымянную фокусируемую группу (WCAG 4.1.2).
**Исправление:** добавить host-биндинги (`[attr.role]="'combobox'"`, `[attr.aria-haspopup]="'listbox'"`, `[attr.aria-expanded]="panelOpen"`, `[attr.aria-controls]="panelOpen ? panelId : null"`, `aria-required/invalid/disabled`), связать `aria-labelledby` с лейблом form-field, сгенерировать стабильный `panelId`. Связано с SEL-A11Y-04 для `aria-activedescendant`.

**SEL-A11Y-02 · У панели оверлея нет `role="listbox"`** — `select.html:108` (`#panel`), `:123` (`#optionsContainer`).
Нет роли listbox, нет `aria-multiselectable`/`aria-labelledby`; для host-атрибута `aria-controls` нет валидной цели.
**Исправление:** задать `role="listbox"` + стабильный `id` (`panelId`) + `[attr.aria-multiselectable]="multiSelection"` + `aria-labelledby` **только** на `#optionsContainer` — поле поиска (`select.html:117`) и footer (`:136`) держать вне поддерева listbox.

> SEL-A11Y-01/02/03/04 — единый логический блок: цепочка combobox → listbox → option → activedescendant должна вноситься вместе, чтобы быть согласованной и проходить AXE.

### P1 — Высокий

**SEL-A11Y-03 · У `kbq-option` нет `role="option"`/`aria-selected`/`aria-disabled`** **(shared)** — `core/option/option.ts:150` (host).
Выбор передаётся только визуально (класс `kbq-selected` + несемантический псевдо-чекбокс). Разделяется с autocomplete.
**Исправление:** добавить `[attr.role]="'option'"`, `[attr.aria-selected]="selected"`, `[attr.aria-disabled]="disabled"`; пометить псевдо-чекбокс `aria-hidden` (`option.html:3`). Опционально `aria-setsize`/`aria-posinset` для virtual scroll.

**SEL-A11Y-04 · `aria-activedescendant` не подключён, хотя используется `ActiveDescendantKeyManager`** — `select.component.ts:1735` (init), `:1851` (`scrollActiveOptionIntoView` форсирует `option.focus()`).
Key manager не задаёт `aria-activedescendant`; вместо этого реальный DOM-фокус переносится в опции и конкурирует с полем поиска (`:1744`) — нестандартная модель combobox.
**Исправление:** держать фокус на host combobox (или на поле поиска при наличии) и биндить `[attr.aria-activedescendant]="keyManager.activeItem?.id"`; заменить `option.focus()` на scroll-into-view без перехвата фокуса. Класс `kbq-active` остаётся визуальным индикатором.

**SEL-A11Y-05 · Иконка удаления тега недоступна с клавиатуры и безымянна** — `select.html:38`; `KbqTagRemove` жёстко задаёт `tabindex:-1`, только клик.
В multiple-режиме выбранное значение можно удалить только мышью; у иконки нет `role="button"`/`aria-label`, а сам тег нефокусируем (`[selectable]="false"`). WCAG 2.1.1 + 4.1.2.
**Исправление:** использовать `kbq-icon-button` (задаёт `tabindex=0`) или переопределить tabindex; добавить `role="button"`, локализованный `[attr.aria-label]` (напр. `Remove {{ option.viewValue }}`), `(keydown.enter)/(keydown.space)` → `onRemoveMatcherItem`; пометить глиф `aria-hidden`.

**SEL-LEAK-01 · Подписка `localeService.changes` никогда не отписывается (утечка root-синглтона)** — `select.component.ts:858`.
Голый `this.localeService?.changes.subscribe(this.updateLocaleParams)`; `KbqLocaleService` — `providedIn:'root'` с незавершённым `BehaviorSubject`, поэтому каждый уничтоженный `KbqSelect` удерживается на всё время жизни приложения и продолжает дёргать `markForCheck`.
**Исправление:** `.pipe(takeUntilDestroyed(this.destroyRef))` — уже импортирован и используется по всему файлу.

**SEL-BUG-01 · `triggerValues` мутирует `SelectionModel.selected` через `reverse()` на месте в RTL** — `select.component.ts:760`. *(Объединяет корректность P1 + шаблоны P1 + заметку по производительности.)*
CDK `SelectionModel.selected` возвращает мемоизированный массив по ссылке; `.reverse()` мутирует его. Геттер читается на каждом проходе CD из `@for` (`select.html:30,47`), поэтому в RTL порядок «прыгает» по тактам и портит эмитируемое значение через `get selected()` → `propagateChanges()` (`:1824`). Потребители, читающие только длину (`calculateHiddenItems`), не затронуты.
**Исправление:** копировать перед reverse — `const ordered = this.isRtl() ? [...selectedOptions].reverse() : selectedOptions;`. Лучше — мемоизированный `computed()` по ключу выбора/RTL/limit. Добавить регрессионный тест: порядок стабилен на двух проходах CD + корректный порядок эмитируемого `control.value` в RTL.

**SEL-TEST-01 · Тесты сортировки по умолчанию холостые (NaN-no-op)** — `select.component.spec.ts:4848`, `:4923` (+ RTL `:4870`, `:4940`); корень — SEL-BUG-04.
Строковые значения фикстур превращают `a.value - b.value` в `NaN`, поэтому `selectionModel.sort` — no-op, а проверяемый порядок совпадает с порядком клика/вставки. Ни один тест не падает, когда компаратор по умолчанию ничего не делает.
**Исправление:** добавить тест с выбором вне порядка панели и проверкой вывода **в порядке панели** (`[Steak, Tacos]`, не порядок клика); добавить числовую фикстуру. Эти тесты падают, пока не исправлен SEL-BUG-04.

### P2 — Желательно исправить

- **SEL-BUG-02 · `clearValue` использует `selectionModel.clear(false)` → устаревший `_selected` у опций** — `select.component.ts:998`. Подавление эмиссии `changed` пропускает подписку deselect (`:932`), оставляя очищенные опции визуально отмеченными в multiple-режиме (запутанный двойной клик для повторного выбора). **Исправление:** `selectionModel.clear()` (эмиссия по умолчанию) или явный `option.deselect()` перед `propagateChanges()`.
- **SEL-BUG-03 · `onSelect` считывает обратно `option.selected` для управления моделью (два источника истины)** — `select.component.ts:1783`. *(Объединяет BUG-89 + arch value-sync.)* Любой путь, мутирующий `_selected` без модели, навсегда рассинхронизирует состояние. **Исправление:** сделать `SelectionModel` единственным источником истины (`toggle()` по вводу пользователя; пусть подписка `changed` вызывает `select()/deselect()`). В основном вытекает из исправления SEL-BUG-02.
- **SEL-LEAK-02 · `onAttached()` переподписывается на `options.changes` при каждом открытии панели без per-session-отписки** — `select.component.ts:1245`. Ограничено лишь `takeUntilDestroyed`; N открытий оставляют N параллельных подписок `setOverlayPosition`. **Исправление:** добавить `takeUntil(this.closedStream)`, по образцу `subscribeToScrolledToBottom()` (`:1486`).
- **SEL-PERF-01 · `ngDoCheck` форсирует reflow на каждом такте CD** — `select.component.ts:919` → `isVisible()` `:1423` читает `offsetTop`/`offsetHeight`. **Исправление:** заменить геометрический зонд на `IntersectionObserver` (создать один раз в `afterNextRender`, `runOutsideAngular`); в `ngDoCheck` оставить только `updateErrorState()` под guard'ом ngControl. `SharedResizeObserver` уже зависимость (`select-option.directive.ts:18`).
- **SEL-PERF-02 · `calculateHiddenItems` дважды клонирует trigger и «дрожит» layout + `detectChanges`** — `select.component.ts:1301`, `getTotalItemsWidthInMatcher` `:1517`, `getTotalVisibleItems` `:1888`, `buildTriggerClone` `:1918`. Два глубоких клона в живой DOM, O(N) чередующихся чтений `getComputedStyle`/offset, до ~2–3 синхронных `detectChanges()`. **Исправление:** один off-DOM клон, добавляемый один раз, все чтения в одном цикле (без чередующихся записей), `offsetWidth` вместо `getComputedStyle` где возможно, один `markForCheck` в конце, вынести константу gap; в идеале — `ResizeObserver` на списке matcher.
- **SEL-PERF-03 · Несгруппированные `setTimeout(0)` на каждое изменение опции/видимости** — `select.component.ts:905`. `distinctUntilChanged()` не может дедуплицировать разные объекты `KbqOptionSelectionChange`, поэтому всплески Ctrl+A планируют по одной макрозадаче на каждое. **Исправление:** `debounceTime(0)`/`auditTime(0, animationFrameScheduler)` внутри существующего pipe `takeUntilDestroyed`; свести оба триггера пересчёта в один общий debounced-поток.
- **SEL-PERF-04 · Шаблон биндит геттеры, читающие DOM/аллоцирующие, на каждом такте CD** — `colorForState` `:795` (читает `classList`), `getPanelClasses()` `:1258` (аллоцирует + join), `hiddenItemsTextFormatter` `:983`. **Исправление:** перевести на `computed()`-сигналы от inputs/state.
- **SEL-A11Y-06 · У кнопки очистки нет `role="button"`/доступного имени** — `select.html:73` + проецируемый `kbq-cleaner`. Клавиатура работает (фокусируемая внутренняя кнопка + всплытие), но контрол объявляется безымянным (WCAG 4.1.2). **Исправление:** задать `KbqCleaner` `role="button"` + локализованный `aria-label` (напр. «Clear selection»); пометить иконку `aria-hidden`.
- **SEL-A11Y-07 · Optgroup не выставлен как `role="group"`; голый `<label>` без контрола** **(shared)** — `core/option/optgroup.ts:15`, `optgroup.html:1`. Сгенерированный `labelId` нигде не используется; `<label>` без связываемого контрола семантически неверен. **Исправление:** добавить `[attr.role]="'group'"` + `aria-labelledby`; заменить `<label>` → `<span id="labelId">`.
- **SEL-A11Y-08 · Псевдо-чекбокс передаёт состояние мультивыбора только визуально** **(shared)** — `core/option/option.html:3`. После добавления `aria-selected` (A11Y-03) скрыть бокс от AT, чтобы избежать дублирующего/пустого объявления. **Исправление:** `aria-hidden="true"`. Объединить с SEL-A11Y-03.
- **SEL-API-01 · `KbqSelect`/`KbqSelectChange` нетипизированы (`any` по всей публичной поверхности)** — `select.component.ts:116`, `:638`, `:468`, `:1144`, `:1645`; `KbqOption.value` `option.ts:171`. **Исправление:** ввести `KbqSelect<T = any>`/`KbqSelectChange<T = any>` (дефолт `any` сохраняет совместимость источника); протянуть `T` через `KbqOption<T>`/`KbqVirtualOption<T>`. Изменение API-снапшота → `approve-api`; внедрять в отслеживаемом SemVer-окне.
- **SEL-API-02 · Мёртвый публичный экспорт `selectEvents`** **(shared)** — `core/select/events.ts:1` (попадает в `core.api.md`). Строковая константа, значение которой равно её имени, без потребителей. **Исправление:** удалить константу + пустой `events.ts` + его `export *`; выполнить `approve-api`. Ломающее → планировать на мажор.
- **SEL-API-03 · Асимметричные типы аксессора `searchMinOptionsThreshold`** — `select.component.ts:396` (сеттер `'auto'|number|undefined`, геттер `number|undefined`). `'auto'` — sentinel только на запись. **Исправление:** задокументировать оба аксессора либо мигрировать на `input<'auto'|number|undefined>()` + `computed()` с разрешённым значением.
- **SEL-API-04 · `hiddenItemsTextFormatter` — метод, помеченный `@Input()`** — `select.component.ts:983`; `hiddenItemsText` (`:342`) одновременно `@Input` и перезаписывается локалью (`:1417`) — два источника истины. **Исправление:** перевести на `readonly hiddenItemsTextFormatter = input<(text, count) => string>(...)`; для `hiddenItemsText` оставить `input()` + отдельный `computed()`/сигнал для эффективного текста с учётом локали, чтобы компонент не писал в собственный input.
- **SEL-TPL-01 · Дублирующиеся глобальные тема-селекторы `kbq-select__*` дрейфуют относительно tree-select** **(shared)** — `_select-theme.scss:29,44,48` vs `_tree-select-theme.scss`; токен цвета невалидного состояния расходится. При `ViewEncapsulation.None` оба эмитятся глобально. **Исправление:** вынести общие правила placeholder/search/no-options в один core `%`-placeholder/mixin; привести токен невалидного состояния к `--kbq-foreground-error`.
- **SEL-TEST-02 · Нет покрытия ARIA/role/AXE** — `select.component.spec.ts:1999` (`describe('accessibility')` — только tabindex/клавиатура). Примечание: `jest-axe` **есть** в devDependencies воркспейса (`package.json:121`, `@types/jest-axe` на `:90`) и уже используется пятью соседними сьютами, так что инструментальных затрат нет. **Исправление:** добавить a11y-набор с проверкой ролей combobox/listbox/option + `aria-*` (падают, пока не внесены A11Y-01..04) и включить в него проверку `axe()`.
- **SEL-TEST-03 · Состояния loading/error/empty/search-empty не покрыты** — `select-common.ts`; `delayBeforeDisplayingResultWithoutOptions=101` (`:159`, исп. `:1053`). **Исправление:** добавить `describe('loading / empty / error states')` с проецированием каждого компонента и продвижением таймеров; покрыть ветку host-класса `paging`.
- **SEL-TEST-04 · Тест отписки BUG-02 не ловит накопление** — `select.component.spec.ts:6655`. Покрывает только краш гонки при destroy, не накопление подписок per-session (LEAK-02). **Исправление:** открыть/закрыть несколько раз, эмитировать один `options.changes`, проверить, что `setOverlayPosition` вызван ровно один раз.
- **SEL-TEST-05 · jest-тест `hiddenItems` подменяет 4 layout-примитива** — `select.component.spec.ts:5253`. Стабы кодируют точную стратегию измерения; SEL-PERF-02 молча их инвалидирует. Надёжный e2e-эквивалент уже есть. **Исправление:** считать e2e-тест источником истины; свести jest-тест к тонкой проверке контракта.
- **SEL-TEST-06 · Визуальное e2e-покрытие пропускает панели disabled/error/loading/empty/virtual-scroll** — `e2e.playwright-spec.ts:53` (только 4 фикстуры открытой панели × light/dark). **Исправление:** добавить demo-роуты + `toHaveScreenshot` для disabled, error, loading, no-options/search-empty и открытой панели virtual-scroll в обеих темах.

### P3 — Можно сделать / гигиена

- **SEL-ARCH-01 · Декомпозиция god-класса** — `select.component.ts:201`. Вынести измерение скрытых элементов (`calculateHiddenItems`/`getTotalVisibleItems`/`getTotalItemsWidthInMatcher`/`buildTriggerClone`/`getItemWidth`, ~120 строк самодостаточной DOM-математики) в сервис/директиву; поднять дублирующуюся обработку клавиатуры + `panelWidth`/`panelMinWidth` в `KbqAbstractSelect` (общий с tree-select). *Зонтик фазы модернизации.*
- **SEL-ARCH-02 · Мигрировать легаси `@Input`-аксессоры на `input()`/`model()`** — `:485,502,520,539,563,623,631,637,657,675,692`. По образцу tree-select (`panelWidth`/`panelMinWidth` уже мигрированы). `model()` для `value`; геттер/сеттеры оставить только там, где есть побочный эффект на set (`multiple`, `compareWith`, `disabled`), по возможности перенося на `effect()`.
- **SEL-ARCH-03 · Удалить устаревшие/ложные TODO о миграции** — `:369,621,629` заявляют переопределение суперкласса, которого `KbqAbstractSelect` не объявляет.
- **SEL-ARCH-04 · Конструктор → `inject()`** — `:841` (13 параметров, 5 стеков декораторов); класс уже смешивает `inject()` на `:213`.
- **SEL-ARCH-05 · `@Output` EventEmitter → `output()`** — `openedChange`/`openedStream`/`closedStream` (`:443`); внутреннюю шину сделать на приватном `Subject`.
- **SEL-ARCH-06 · Ужесточить контракт `KbqAbstractSelect`** **(shared)** — `core/select/common.ts:128`. Объявить `overlayDir`/`triggerRect` абстрактными; перестать расширять их до public в подклассах.
- **SEL-ARCH-07 · Безопасное к исключениям переключение класса контейнера оверлея** — `addClassToOverlayContainer` `:1931` снимается только в `close()`; исключение оставляет «сирту» `cdk-overlay-container_dropdown`. Переключать в `finally`/по detach.
- **SEL-LIFE-01 · `closeSubscription` переприсваивается без unsubscribe** — `:1249` (в нормальном потоке маскируется; добавить защитный `unsubscribe()` перед переприсваиванием).
- **SEL-LIFE-02 · Завершать оставшиеся Subjects/emitters в `ngOnDestroy`** — `:956`: `visibleChanges`/`panelDoneAnimatingStream`/`openedChange` не завершаются (внешние подписчики не получают complete).
- **SEL-LIFE-03 · Неотслеживаемые `setTimeout(0)` не очищаются при destroy** — `ngOnInit` `:908`, `handleOpenKeydown` `:1623`. Отслеживать id + `clearTimeout`, либо `delay(0)` внутри pipe `takeUntilDestroyed` (избегает `ViewDestroyedError` от `calculateHiddenItems`→`detectChanges`).
- **SEL-LIFE-04 · Отложенная подписка `KbqSelectSearch` без guard'а на destroy** **(shared)** — `core/select/common.ts:96`. Защитить микрозадачу или добавить `takeUntilDestroyed`.
- **SEL-LIFE-05 · `KbqOptionTooltip` двойной `monitor()` / одиночный `stopMonitoring`** — `select-option.directive.ts:58` (реальной утечки нет — CDK ключует по элементу; косметика).
- **SEL-BUG-04 · Сортировка по умолчанию использует `a.value - b.value`** — `:1813`. По умолчанию — порядок панели: `options.indexOf(a) - options.indexOf(b)`; `indexOf === -1` (virtual/preselected) сортировать в конец. Валидируется SEL-TEST-01.
- **SEL-BUG-05 · Ctrl+A снимает выбор у уже выбранных disabled-опций** — `_selectAllHandler` `:1870`. Полностью пропускать disabled, а не принудительно снимать выбор.
- **SEL-BUG-06 · `setSelectedOptionsByClick` может читать `options[-1]`** — `:1379`. Защитить `fromIndex < 0` (узкий путь shift+клик после очистки).
- **SEL-BUG-07 · Разрешение значения в virtual-scroll предполагает Array-источник** — `selectValue` `:1706`. Обрабатывать `DataSource`/`Observable` либо откатываться на `createVirtualOption(value)`; как минимум задокументировать требование Array.
- **SEL-API-05 · `panelClass` с index-сигнатурой `any`** — `:356`. Сузить до `Record<string, boolean>` (соответствует truthiness в `getPanelClasses`). Отзеркалить на tree-select.
- **SEL-API-06 · Непоследовательный `@docs-private` на фабриках ошибок** **(shared)** — `core/select/errors.ts:25` (`getKbqSelectNonFunctionValueError`). Добавить `@docs-private` для единообразия (только docs-поверхность).
- **SEL-API-07 · Избыточный `$any()` на `customTagTemplateRef`** — `select.html:49`. Биндить через `@if (customTagTemplateRef(); as tagTpl)`; опционально экспортировать интерфейс `KbqSelectTagTemplateContext`.
- **SEL-TPL-02 · `getPanelClasses()` собирает строку на каждом такте CD** — `:1258`. Перевести на `computed()` (`panelClass` уже сигнал; цвет form-field выставить сигналом).
- **SEL-TPL-03 · Анимация `transformPanel` зарегистрирована, но не используется** — `:195`; биндится только `@fadeInContent`. Убрать запись из массива (тот же copy-paste в tree-select).
- **SEL-TPL-04 · Инлайновый `[style.display]` на скрытом тексте** — `select.html:59`. Заменить на класс состояния + правило SCSS; элемент держать в DOM для измерения.
- **SEL-TPL-05 · `:has()` без задокументированного фолбэка** — `select.scss:28`. Уже используется в 22 SCSS-файлах (принятый baseline); задокументировать зависимость.
- **SEL-TPL-06 · Владение/дублирование токенов** **(shared)** — `select-tokens.scss:1` объявляет токены `.kbq-tree-select`; фон/тень dropdown дублируются по select/tree-select/autocomplete. Вынести селектор tree-select; свести к одному общему определению.
- **SEL-TPL-07 · Голый `::ng-deep` верхнего уровня протекает глобально** — `select-common.ts:56`. Заскоупить под `:host ::ng-deep`.
- **SEL-TPL-08 · Дефолт `KbqSelectLoading` использует глобальные утилиты `layout-*`** — `select-common.ts:11`. Заменить на компонентно-скоупленные flex/токен-стили, чтобы дефолтный спиннер рендерился без глобального визуального слоя.
- **SEL-A11Y-09 · Не учитывается `prefers-reduced-motion`** — анимации `:195` (совпадает с монорепо-A11Y-35/36). Гейтить анимации открытия/закрытия оверлея media-запросом.
- **SEL-TEST-07/08/09 · Пробелы покрытия** — нет теста `onRemoveMatcherItem`; RTL тестируется только для сортировки (не клавиатура/`triggerValuesLimit`); проверки чрезмерно опираются на внутренние `keyManager.activeItemIndex`/`selectionModel.selected`. Добавить DOM/ARIA-проверки наряду с внутренними.

**Отклонено при проверке (исключено):** «непоследовательность detectChanges-vs-markForCheck» как отдельная находка (конкретный hot-path-случай учтён в SEL-PERF-02); «подписка скролла выполняется вне Angular» (она корректно так и делает — изменений не нужно); «`box-sizing: initial` ломает расчёт padding/height» (не ломает при текущем использовании).
**Смежное (отмечено, не подтверждённый дефект):** `minimumTimeToDisplayLoading` (`select.component.ts:161`) — экспортируемая, задокументированная, но **неиспользуемая** константа — удалить или подключить к состоянию loading. Проблемы `transformPanel`-неиспользуемой-анимации и `panelClass`-`any` есть и в `tree-select` — отзеркалить исправления, чтобы не разъезжаться снова.

## 4. Рекомендуемые фазы исправления

**Фаза 1 — Блокеры доступности (вносить вместе).**
ID: SEL-A11Y-01..08 + SEL-A11Y-09 + SEL-TEST-02 (регрессионные гарды) + SEL-TEST-06 (визуальные состояния).
Цепочка combobox → listbox → option → activedescendant (01/02/03/04) вносится как одно согласованное изменение; 05/06/07/08/09 параллелятся. Сначала писать AXE/a11y-спеки (падают → доводим до зелёного). Это разблокирует релиз.

**Фаза 2 — Жизненный цикл и утечки.**
ID: SEL-LEAK-01 (первым), SEL-LEAK-02, SEL-LIFE-01..05 + SEL-TEST-04. Механически, низкий риск; копировать паттерн `subscribeToScrolledToBottom()`.

**Фаза 3 — Корректность.**
ID: SEL-BUG-01 (RTL reverse), SEL-BUG-02 (рассинхрон clear), SEL-BUG-03 (единый источник истины — вытекает из BUG-02), SEL-BUG-04 (сортировка по умолчанию), SEL-BUG-05/06/07 + SEL-TEST-01/07. Порядок: BUG-02 до/вместе с BUG-03; BUG-04 до TEST-01. BUG-01 можно перенести в Фазу 2 (это также выигрыш для производительности/шаблонов).

**Фаза 4 — Производительность.**
ID: SEL-PERF-01 (IntersectionObserver), -02 (измерение за один проход), -03 (коалесинг), -04 + SEL-TPL-02 (computed-геттеры). Порядок: PERF-02 до переписывания SEL-TEST-05; зависит от BUG-01 (не вносить заново `reverse()` на месте в новый `computed`).

**Фаза 5 — Миграция на современный Angular, упрочнение API и стилей (под SemVer).**
ID: SEL-ARCH-01..07, SEL-API-01..07, SEL-TPL-01/03/04/05/06/07/08 + SEL-TEST-03/05/08/09 + смежная чистка.
Сгруппировать API-меняющие пункты (дженерики SEL-API-01, мёртвый экспорт SEL-API-02, миграция inputs SEL-ARCH-02) и выполнить `approve-api` один раз; ломающие части — на мажор. SEL-ARCH-01 (декомпозиция) предшествует/сопровождает ARCH-02, чтобы вынесенный код мигрировался один раз. Отзеркалить общие исправления в tree-select.

## 5. Стратегия верификации

**Общие гейты (на каждую фазу):**
- `npx jest packages/components/select/select.component.spec.ts`
- `npx jest packages/components/core/option/option.spec.ts` (роли/aria опции — shared)
- `yarn run eslint && yarn run stylelint && yarn run prettier`
- `yarn run check-api` (и `yarn run approve-api` только когда публичный API меняется намеренно — Фаза 5)

**Фаза 1 (a11y):** новые jest a11y-спеки — на host `role="combobox"` + `aria-haspopup/expanded/controls`; на `#optionsContainer` `role="listbox"` + `aria-multiselectable`; на каждой `kbq-option` `role="option"` + `aria-selected/disabled`; `aria-activedescendant` отслеживает активную опцию; optgroup `role="group"`; кнопки удаления тега и очистки фокусируемы + именованы. Если подключён jest-axe: `expect(await axe(...)).toHaveNoViolations()` в закрытом и открытом состояниях. Ручной проход NVDA/VoiceOver. Playwright (SEL-TEST-06): `npx playwright test packages/components/select/e2e.playwright-spec.ts` с новыми скриншотами состояний; проверить фокус-кольцо (WCAG 2.4.7) и индикаторы 3:1 в light/dark.

**Фаза 2 (жизненный цикл):** SEL-TEST-04 — открыть/закрыть панель N раз, эмитировать один `options.changes`, проверить, что spy `setOverlayPosition` вызван один раз. SEL-LEAK-01 — создать/уничтожить множество select; проверить, что число наблюдателей `localeService.changes` не растёт.

**Фаза 3 (корректность):** BUG-01 RTL — проверить, что порядок тегов и `control.value` стабилен на **двух** проходах `detectChanges()` и что `selectionModel.selected` не мутируется. BUG-02/03 — выбрать A+B, кликнуть очистку, открыть заново, проверить, что ни одна опция не несёт `kbq-selected`/`aria-selected`; повторный выбор с одного клика. BUG-04 + TEST-01 — выбрать вне порядка панели, проверить вывод в порядке панели (строковые + числовые фикстуры). BUG-05/06/07 — предвыбранный disabled + Ctrl+A сохраняет его; shift+клик после `clearValue` не падает; не-Array virtual-источник всё равно рендерит тег.

**Фаза 4 (производительность):** spy, что чтения геометрии больше не происходят в `ngDoCheck` (IntersectionObserver шлёт только на переходах); проверить один DOM-клон + один `markForCheck` на `calculateHiddenItems`; всплеск Ctrl+A планирует один сгруппированный пересчёт; для истины по layout опираться на e2e-тест скрытых элементов.

**Фаза 5 (миграция / API / стили):** после дженериков/удаления мёртвого экспорта/миграции inputs → `yarn run check-api`, просмотреть `tools/public_api_guard/components/{select,core}.api.md`, затем `yarn run approve-api`. Тайп-чек, что публичная поверхность компилируется для типизированных потребителей (`KbqSelect<MyValue>`). `yarn run styles:build-all` после SEL-TPL-01/06; визуально сравнить невалидное состояние select vs tree-select в обеих темах. Полная регрессия: `yarn run unit:components` + `yarn run e2e:components` перед мержем.

---

## Приложение A — Методология ревью

Ревью подготовлено 8 параллельными агентами (архитектура, RxJS/жизненный цикл, корректность, доступность, производительность, публичный API/типы, тесты, шаблоны/стили), каждый читал исходный код напрямую. Затем каждая «сырая» находка состязательно проверялась независимым агентом против реального кода (перепроверка номеров строк, переоценка владения потоками, перерейтинг severity). Из 73 сырых находок 70 подтверждены, 3 отклонены. Две самых влиятельных находки (SEL-BUG-01 RTL `reverse()`, SEL-LEAK-01 подписка locale) дополнительно проверены вручную. Сопутствующее монорепо-ревью (`docs/REVIEW.md`) независимо отмечает те же P0-пробелы ARIA и BUG-02.

## Приложение B — Просмотренные файлы

`packages/components/select/`: `select.component.ts`, `select.html`, `select-common.ts`, `select-option.directive.ts`, `select.scss`, `_select-theme.scss`, `select-tokens.scss`, `select.component.spec.ts`, `e2e.playwright-spec.ts`, `e2e.ts`, `public-api.ts`, `index.ts`, `select.module.ts`.
Общий `core` (находки **(shared)**): `core/option/option.ts`, `core/option/option.html`, `core/option/optgroup.ts`, `core/select/common.ts`, `core/select/{events,errors,constants}.ts`.
