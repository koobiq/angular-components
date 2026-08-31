# Компонент `accordion` Koobiq — Ревью кода и план улучшений

> Область: `packages/components/accordion` (контейнер, item, примитивы trigger/content/header, стили, тесты, документация) · Коммит `18ea72fe` · 2026-06-29
> Подготовлено автоматическим многоагентным ревью (7 измерений: архитектура, корректность, RxJS/жизненный цикл, доступность, публичный API/типы, тесты, шаблоны/стили) с **состязательной проверкой каждой находки** относительно реального кода и исходников `@angular/core` / `@angular/cdk` 20.3.x.
> Сырые данные: 60 находок → **38 подтверждено, 19 спорных (severity скорректирован, но проблема реальна), 3 опровергнуто**. После дедупликации — каноничный набор **2×P1, 10×P2, ~28×P3** ниже. Это ревью + дорожная карта; код этим документом не меняется.

---

## 1. Краткое резюме

- **Компонент хорошо сделан на современной базе Angular.** Standalone, `OnPush`, `inject()`, сигнальный `contentChildren`, нативные host-биндинги, без `ngClass`/`ngStyle`, без `@HostBinding`/`@HostListener`. **P0-блокеров нет.** Набор находок — это несколько граничных багов корректности, один реальный дефект клавиатурной доступности и длинный «хвост» гигиены API/типов/стилей/тестов.
- **Риск №1 — баг переопределения `disabled` (`ACC-BUG-01`, P1).** Геттер `disabled` у item использует `??` (`this.accordion.disabled() ?? this._disabled`). Так как Angular применяет трансформ `booleanAttribute` только к *связанным* значениям, идиоматичное `<kbq-accordion [disabled]="false">` делает `disabled()` равным `false`, и `false ?? this._disabled` **молча игнорирует собственный `[disabled]="true"` у item** — секция становится кликабельной/управляемой с клавиатуры и сообщает `aria-disabled="false"`, противореча документации. Правка в один символ (`||`).
- **Риск №2 — клавиатурная модель WAI-ARIA (`ACC-A11Y-01`, P1).** Контейнер перехватывает Tab/Shift+Tab для перемещения между заголовками и делает `preventDefault()`. Паттерн APG требует, чтобы Tab уводил к следующему фокусируемому элементу (например, в контент открытой панели), а Up/Down Arrow перемещали между заголовками. Так как обработчик не проверяет `event.target`, Tab внутри открытой панели тоже «утаскивается» обратно к заголовку — пользователи клавиатуры/скринридера не могут добраться до интерактивного контента в открытой секции. Это **не** буквальная ловушка фокуса (на первом/последнем item фокус выходит наружу), а Arrow/Home/End уже подключены — правка в удалении двух Tab-веток.
- **Корректность контролируемого `value` требует доработки (кластер P2).** Сопоставление в диспетчере использует `String.includes` (коллизии подстрок: `item-10` также открывает `item-1`, `ACC-BUG-03`); в режиме `multiple` item-ы никогда не закрываются при переустановке `[value]` (`ACC-BUG-04`); item без контента падает при первом toggle, потому что один вызов `content()` потерял опциональную цепочку (`ACC-BUG-02`).
- **Сохранение состояния — самая слабая подсистема.** Персистентность через `localStorage` живёт в UI-контейнере и завязана на нестабильный авто-сгенерированный id (`ACC-ARCH-01`, P2) — надёжна только для фиксированного, статически отрендеренного набора аккордеонов — и **полностью не покрыта тестами** (`ACC-TEST-01`, P2), включая путь `JSON.parse` в конструкторе.
- **Жизненный цикл в основном дисциплинирован, два P2.** У `onValueChangeSubscription` нет инициализатора `Subscription.EMPTY` (NPE при раннем уничтожении, `ACC-LIFE-01`), а merge `onValueChange` + `FocusKeyManager` строятся один раз по статическому снимку `items()`, поэтому динамически добавленные item-ы не эмитят событие и не навигируются стрелками (`ACC-LIFE-02`).
- **Что хорошо.** Покрытие ARIA-*атрибутами* действительно хорошее (trigger `role`/`aria-expanded`/`aria-controls`, content `role="region"`/`aria-labelledby`, уникальная связка id, реактивный `aria-disabled`), `prefers-reduced-motion` учтён для анимации высоты, disabled-item-ы корректно пропускаются CDK key manager-ом (опровергнутая находка), а разделение директив trigger/content — осознанный, активно используемый паттерн примитивов.
- **Что требует внимания.** (1) Два P1; (2) кластер P2 по контролируемому `value`/диспетчеру; (3) вынос и тестирование сохранения состояния; (4) P2 жизненного цикла; (5) проход по API/типам под SemVer (`getState(): any`, `variant` деградирует до `string`, нет двусторонней привязки `value`, нет JSDoc, ре-экспорт внутренних директив); (6) пробелы тестов на рискованных путях (сохранение состояния, teardown, навигация Arrow/Home/End).

## 2. Карта оценок

| Измерение | Оценка | P0 | P1 | Заметки |
|---|---|---|---|---|
| Корректность и баги | C+ | 0 | 1 | `??`-переопределение `disabled` — реальный функциональный+a11y баг (`ACC-BUG-01`). Несколько P2 по граничным случаям `value`/диспетчера + латентный краш у item без контента. |
| Архитектура и конвенции | B− | 0 | 0 | Прочная база OnPush/standalone/inject. Долги: legacy-пары `@Input`-аксессоров, политика localStorage в UI-контейнере (P2), несогласованное именование файлов + enum-vs-union в API. |
| Доступность (WCAG 2.1 AA) | C | 0 | 1 | Перехват Tab/Shift+Tab ломает клавиатурную модель APG (`ACC-A11Y-01`). Фиксированный `aria-level=2` (P2); шеврон игнорирует `prefers-reduced-motion` (P3). |
| RxJS и жизненный цикл | B− | 0 | 0 | Два P2: неинициализированная подписка → NPE при раннем destroy; merge + `FocusKeyManager` строятся один раз по статическому снимку `items()`. |
| Публичный API и типы | C+ | 0 | 0 | Нет P0/P1, но кластер P3: `getState(): any`, тип `variant` деградирует до `string`, нет двусторонней привязки `value`, массово нет JSDoc, ре-экспорт внутренних директив. |
| Тесты | C+ | 0 | 0 | Хорошая широта по атрибутам/ARIA, но 3×P2 на рискованных путях: сохранение состояния, teardown/утечки, навигация Arrow/Home/End. Тесты «фиксируют» неверное поведение Tab. |
| Шаблоны и стили | B | 0 | 0 | P3-мелочи: оставшиеся имена `--radix-*` (одно — мёртвое), обёртка `<p>` невалидна для блочного контента, `!important`, неверный API `setProperty('style', …)`. |

**Ключевые метрики.** Современная база Angular соблюдена. Остаточный долг: 5 legacy-пар `@Input`-аксессоров с TODO «Skipped for migration», 1 публичный возврат `: any`, утечка неймспейса `--radix-*`, несогласованность именования `*.component.ts`/`*.directive.ts` против голого `*.ts`.

## 3. Приоритизированные находки (дедуплицированы, проверены)

### P1 — Высокий

**ACC-BUG-01 · Геттер `disabled` использует `??`, поэтому `[disabled]="false"` у аккордеона затирает собственный `[disabled]="true"` у item** — `accordion-item.ts:123`.
`get disabled() { return this.accordion.disabled() ?? this._disabled; }`, при `disabled = input<boolean, unknown>(undefined!, { transform: booleanAttribute })` (`accordion.component.ts:92`). Angular **не** запускает трансформ для начального значения, поэтому без привязки `disabled()` равно `undefined` и `??` корректно проваливается. Но идиоматичное `[disabled]="false"` (или сигнал, дающий `false`) запускает трансформ → `disabled()` равно `false` → `false ?? this._disabled` возвращает `false`, игнорируя item с `[disabled]="true"`. Флаг disabled управляет `toggle()/open()/close()` (`accordion-item.ts:189/196/203`), ENTER/SPACE (`accordion.component.ts:215`) и `aria-disabled`/`data-disabled` — секция становится управляемой **и** неверно сообщает своё состояние (доступность + корректность, противоречит документации «Inactive Section»). Проверено против семантики input-сигналов `@angular/core` 20.3.24. Не покрыто тестами.
**Правка:** `return this.accordion.disabled() || this._disabled;` (значение по умолчанию `undefined` ложно → поведение item сохраняется; явное `false` больше не переопределяет). Добавить регрессионный тест на комбинацию привязок.

**ACC-A11Y-01 · Tab / Shift+Tab перехвачены для перемещения между заголовками, ломая клавиатурный паттерн WAI-ARIA APG** — `accordion.component.ts:219-228`.
`keydownHandler` перехватывает TAB/Shift+TAB, вызывает `keyManager.setNextItemActive()/setPreviousItemActive()` + `preventDefault()`. APG требует **Tab → следующий фокусируемый элемент** (например, в развёрнутую панель) и **Up/Down Arrow → перемещение между заголовками**. Обработчик висит на host `(keydown)` и не проверяет `event.target`, поэтому Tab *внутри открытой панели `role="region"`* тоже утаскивается к заголовку — пользователи клавиатуры/скринридера не могут перейти Tab-ом к интерактивному контенту открытой секции. Это не буквальная ловушка WCAG 2.1.2 (обработчик делает `return` без `preventDefault` на первом/последнем item, фокус выходит на границах — отсюда P1, не P0). Навигация Arrow/Home/End уже подключена (`withVerticalOrientation`/`withHorizontalOrientation`/`withHomeAndEnd`, `accordion.component.ts:180-186`) и проброшена через `keyManager.onKeydown` в ветке `else`.
**Правка:** удалить обе ветки TAB (`219-228`) и дать Tab срабатывать нативно; навигация по заголовкам сохраняется через уже обрабатываемые Arrow/Home/End. Обновить тесты, проверяющие неверное поведение (`ACC-TEST-03`, `ACC-TEST-13`); синхронизацию фокуса (`ACC-A11Y-04`) рассматривать в том же изменении.

### P2 — Следует исправить

**ACC-BUG-02 · `content().toggle()` без опциональной цепочки → краш у item без контента** — `accordion-item.ts:93`.
`content` — опциональный `contentChild(forwardRef(() => KbqAccordionContentDirective))`. Все остальные обращения используют `this.content()?.…` (строки `184`, `216`, `221`), но горячий путь в сеттере `expanded` вызывает `this.content().toggle()`. Item с заголовком/триггером, но без `<kbq-accordion-content>`, бросает `TypeError: …reading 'toggle'` при первом toggle (клик/ENTER/SPACE/`open()`/`openAll()`/`[value]`). Все поставляемые примеры связывают item↔content 1:1, поэтому баг латентный.
**Правка:** `this.content()?.toggle();`. (Драйвит `ACC-TEST-06`.)

**ACC-BUG-03 · Сопоставление в диспетчере через `id.includes(this.value)` — коллизии подстрок открывают не те item-ы** — `accordion-item.ts:159` (multiple), `:163` (single).
`String.prototype.includes` — это поиск подстроки. Сеттер `value` в single-режиме, восстановление сохранённого состояния и нотификация item→item передают **строковую** нагрузку, поэтому нотификация `'item-10'` совпадает и с item-ом, у которого value `'item-1'` (`'item-10'.includes('item-1') === true`), ломая single-выбор. Срабатывает при схемах значений с общими подстроками (например, `item-1`/`item-10`); не покрыто (в фикстурах значения без пересечений).
**Правка:** нормализовать к массиву + точное сравнение элементов, например `Array.isArray(id) ? id.includes(this.value) : id === this.value`.

**ACC-BUG-04 · В режиме `multiple` слушатель диспетчера никогда не закрывает item-ы, поэтому переустановка `[value]` накапливает открытые** — `accordion-item.ts:158-161`.
Ветка multiple присваивает только `this.expanded = true`; никогда `false` (в отличие от single на `:163`). `[value]="['item-1']"` затем `[value]="['item-2']"` открывает item-2, но оставляет item-1 открытым — отрендеренное состояние расходится с «контролируемым значением». Не покрыто (тест `value` — single-режим).
**Правка:** в режиме multiple вычислять expanded из членства и присваивать безусловно (с точным сравнением по `ACC-BUG-03`): `this.expanded = this.accordion.id === accordionId && <value ∈ id>;`.

**ACC-LIFE-01 · У `onValueChangeSubscription` нет инициализатора `EMPTY` → `ngOnDestroy` может бросить NPE при раннем destroy** — `accordion.component.ts:155` (объявление), `:200` (teardown).
Объявлена без инициализатора, присваивается только в `ngAfterContentInit` (`:188`), а `ngOnDestroy` безусловно вызывает `.unsubscribe()`. Если content-init упадёт раньше (например, `new FocusKeyManager(...)` на `:180`), поле всё ещё `undefined`, и teardown бросит вторую, маскирующую ошибку. Сосед сделан правильно (`accordion-item.ts:154`, `= Subscription.EMPTY`).
**Правка:** `private onValueChangeSubscription: Subscription = Subscription.EMPTY;` (или защитить `?.unsubscribe()`).

**ACC-LIFE-02 · merge `onValueChange` + `FocusKeyManager` строятся один раз по статическому снимку `items()`** — `accordion.component.ts:180` (key manager), `:188-190` (merge).
`this.items()` вычисляет сигнал `contentChildren` в обычный массив, не `QueryList`/сигнал. CDK `ListKeyManager` авто-отслеживает изменения только для аргумента `QueryList` или сигнала (проверено в `list-key-manager.mjs`). Следствие: добавленные позже item-ы (например, рост `@for`) **не эмитят `onValueChange`** и **не навигируются стрелками**; удалённый активный item оставляет «висящий» `activeItem`. Не покрыто (только статические item-ы).
**Правка:** пересобирать merge внутри подписки в `effect`/`takeUntilDestroyed`, завязанной на `items()`, и передавать сигнал `items` (с injector-ом) в `FocusKeyManager`, чтобы сработала effect-ветка CDK — либо задокументировать, что динамическое добавление/удаление item-ов не поддерживается.

**ACC-ARCH-01 · Персистентность состояния (localStorage) живёт в UI-контейнере и завязана на нестабильный авто-id** — `accordion.component.ts:64, 87, 157, 162-178, 252-266`; обратные вызовы в `accordion-item.ts:95, 172`.
`saveItemState`/`getSavedState` читают/пишут `localStorage` (через токен `KBQ_WINDOW`, под SSR-защитой `isBrowser`), ключ — `this.id = kbq-accordion-${counter}`. **Нет input-а, чтобы задать стабильный id/ключ**, поэтому ключ зависит от порядка инстанцирования — стабилен только для фиксированного, статически отрендеренного набора; молча расходится при ленивых роутах / условном / переупорядоченном рендере. Политика хранилища в UI-компоненте — архитектурный «запах»; `KbqAccordionState` не экспортирован, нет вытеснения.
**Правка:** вынести стратегию персистентности в инъектируемый сервис (`KbqAccordionStateStore` через `InjectionToken`) и требовать стабильный ключ от потребителя при включённом сохранении (dev-предупреждение, если ключа нет). Держать `KbqAccordion` без прямого доступа к хранилищу. Связано с `ACC-ARCH-03`/`ACC-API-08`.

**ACC-A11Y-02 · `aria-level` жёстко задан `2`, нет способа вписать в иерархию заголовков документа** — `accordion-header.directive.ts:8`.
`role="heading"` + `aria-level="2"` — валидная разметка и неплохой дефолт, но он фиксирован для всех потребителей. Аккордеон, вложенный под секцию `h3`, даёт нелогичную структуру заголовков для пользователей скринридера, навигирующих по уровням (WCAG 1.3.1). Это не автоматический отказ AXE (отсюда P2).
**Правка:** добавить `level = input<number>(2)` (на header или аккордеон), привязать к `[attr.aria-level]`; задокументировать, что потребители должны выставлять уровень под свою структуру страницы.

**ACC-TEST-01 · Сохранение состояния (`useStateSaving`/localStorage) полностью не покрыто тестами** — `accordion.component.spec.ts` (пробел).
Нетривиальная, рискованная логика (`JSON.parse` в конструкторе, восстановление при инициализации на `:170-178`, защита force-vs-non-force записи на `:253`) имеет нулевое покрытие; ни одна фикстура не выставляет `useStateSaving`, `localStorage` не мокается.
**Правка:** добавить `describe('useStateSaving')` с фейковым `KBQ_WINDOW.localStorage`: проверить запись при toggle (ключ = id аккордеона, сериализованный `{expanded,value}`), восстановление открытого item-а из заранее засеянной записи, что `hasSavedState` отражает распарсенный JSON, и что повреждённое/пустое значение не падает.

**ACC-TEST-02 · Нет тестов teardown / утечек подписок; также покрывает NPE при раннем destroy из `ACC-LIFE-01`** — `accordion.component.spec.ts` (пробел) для `:197-201` и `accordion-item.ts:176-181`.
Ни одно поведение `ngOnDestroy` (остановка focusMonitor, `openCloseAllActions.complete`, отписка, `destroyed`/снятие слушателя у item) не проверяется.
**Правка:** замокать `FocusMonitor.stopMonitoring` / `openCloseAllActions.complete`; подписаться на `item.destroyed`, затем `fixture.destroy()`; добавить тест create-then-destroy для ловли NPE неинициализированной подписки.

**ACC-TEST-03 · Навигация Arrow Up/Down + Home/End не покрыта (только ENTER/SPACE/TAB)** — `accordion.component.spec.ts:394-474` (пробел) для `accordion.component.ts:180, 182-186, 230`.
Весь смысл `withHomeAndEnd()`/конфигурации ориентации (путь `else → keyManager.onKeydown`) не имеет тестов, поэтому поломка проводки не будет замечена. После `ACC-A11Y-01` тесты TAB на `433-473` следует заменить на тесты стрелок (`ACC-TEST-13`).
**Правка:** диспатчить `DOWN_ARROW`/`UP_ARROW`/`HOME`/`END` на host и проверять перемещение активного item-а (`0→1` на Down, последний на End, `0` на Home).

### P3 — Желательно / гигиена

**Корректность и жизненный цикл**
- **ACC-BUG-05 · `keyManager` объявлен без инициализатора; `keydownHandler` обращается к нему до content-init** — `accordion.component.ts:76, 205`. В нормальном потоке безопасно (host-слушатель срабатывает после content-init); случайный ранний keydown упадёт. Добавить защиту `if (!this.keyManager) return;`.
- **ACC-BUG-06 · Противоречие типа/использования `localStorage` + незащищённый `JSON.parse`** — `accordion.component.ts:64, 259, 265`. `?.` на ненулевом `KBQ_WINDOW` расширяет тип до `Storage | undefined`, но использование без защиты; `isBrowser` ≠ доступность хранилища (sandbox-iframe / приватный режим бросают); повреждённый JSON падает в конструкторе. Инъектить без `?.` и/или защитить `!this.localStorage` + обернуть `JSON.parse` в try/catch.
- **ACC-LIFE-03 · Таймер `afterNextRender(() => setTimeout(() => enableAnimation()))` никогда не очищается** — `accordion-trigger.component.ts:62`. Обращается к `viewChild.required` после destroy. Очищать таймер при destroy или сделать `icon()` опциональным + защитить. (NG0951 не доказан — к моменту запуска запрос разрешён — но незакрытый таймер реален.)
- **ACC-LIFE-04 · `destroyed: EventEmitter` эмитится/завершается, но не имеет подписчиков** — `accordion-item.ts:141`. Мёртвая проводка на legacy-паттерне `EventEmitter` (соседи используют `output()`). Удалить (внимание: это публичный API — планировать на major) или заменить на `DestroyRef`.

**Доступность**
- **ACC-A11Y-03 · `prefers-reduced-motion` не покрывает вращение шеврона** — `accordion-trigger.component.scss:13`. Анимация высоты контента защищена (`accordion.component.scss:41-46`), а `transition: transform 300ms` шеврона — нет. Добавить media-запрос для `.kbq-accordion-trigger__icon`.
- **ACC-A11Y-04 · После `ACC-A11Y-01` кнопки заголовков и `keyManager.activeItem` — две несинхронные модели фокуса** — `accordion-trigger.directive.ts:11,17`. Синхронизировать `setActiveItem` по `focusin` триггера (путь клика уже вызывает его) либо реализовать настоящий roving `tabindex`. Также: `role="button"` на нативной `<button>` избыточен. Рассматривать вместе с `ACC-A11Y-01`.
- **ACC-A11Y-05 · Устаревший `event.keyCode` в `keydownHandler`** — `accordion.component.ts:212, 219, 224`. Это конвенция всего репозитория (65 использований в 35 файлах), и сам CDK key manager читает `keyCode`; имеет смысл менять только как миграцию всей библиотеки на `event.key`.

**Публичный API и типы**
- **ACC-API-01 · `getState(): any`** — `accordion-item.ts:208`. Ввести/экспортировать `KbqAccordionItemSnapshot { expanded: boolean; value: string }`, переиспользовать в `KbqAccordionState`. Не ломает API (запустить `approve-api`).
- **ACC-API-02 · `variant = input<KbqAccordionVariant | string>(…)` схлопывается до `string`** — `accordion.component.ts:89`. Подтверждено в `accordion.api.md:63` (`InputSignal<string>`), теряются автодополнение/валидация; строка вне enum молча не совпадает ни с одним стилем варианта. Типизировать как `input<KbqAccordionVariant>()` (убрать `| string`). Сужение → под SemVer.
- **ACC-API-03 · `KbqAccordionVariant` — рантайм-`enum`, а `type`/`orientation` — строковые union-ы** — `accordion.component.ts:29`. Привести к union для единообразия (ломающее → major) или задокументировать расхождение.
- **ACC-API-04 · `onValueChange = output<void>()` без нагрузки, без JSDoc, с префиксом `on`** — `accordion.component.ts:138`. Подписчики вынуждены отдельно читать `accordion.value`. Соседние output-ы без префикса (`opened`/`closed`/`expandedChange`). Рассмотреть эмит значения + переименование в `valueChange` (ломающее → планировать).
- **ACC-API-05 · У `value` нет `valueChange`/`model()`, поэтому `[(value)]` невозможен** — `accordion.component.ts:121`. Добавить output `valueChange` (не ломает) или мигрировать на `model()`.
- **ACC-API-06 · `public-api.ts` ре-экспортирует внутренние `*-directive`-классы** — `public-api.ts:2,4,7`. Фиксирует их в SemVer (попадают в `accordion.api.md`). Убрать ре-экспорты (major) либо хотя бы `@docs-private` для документации.
- **ACC-API-07 · Массово нет JSDoc на публичных членах** — `accordion.component.ts:116` (+ `variant`, `onValueChange`, геттеры `id`/`isMultiple`/`hasSavedState`) и `accordion-item.ts:183` (`focus()`/`disableAnimation()`/`enableAnimation()`/`dataState`/`orientation`). Все помечены `(undocumented)` API Extractor-ом. Чисто документация, не ломает.
- **ACC-API-08 · `useStateSaving` — изменяемое, не-`readonly`, не-`input()` публичное поле** — `accordion.component.ts:87`. Читается один раз из host-атрибута (не реактивно, нельзя `[useStateSaving]`). Сделать `readonly useStateSaving = input(false, { transform: booleanAttribute })`. Тот же корень, что `ACC-ARCH-03`.
- **ACC-API-09 · `_defaultValue: string[] | string` несёт мёртвую ветку `| string`** — `accordion.component.ts:153`. Сеттер всегда нормализует к массиву; типизировать бэкинг-поля как `string[]`. Внутреннее, не ломает.

**Архитектура и конвенции**
- **ACC-ARCH-02 · 5 legacy-пар `@Input()`-аксессоров с TODO «Skipped for migration»** — `accordion.component.ts:100-136`, `accordion-item.ts:65-128` (`defaultValue`, `value`, у item `expanded`/`value`/`disabled`). Мигрировать на `input()`/`model()`, где позволяют побочные эффекты сеттеров — нетривиально: сеттеры управляют координацией `UniqueSelectionDispatcher`, поэтому авто-миграция их пропустила.
- **ACC-ARCH-03 · `useStateSaving` через `HostAttributeToken`** — см. `ACC-API-08`. При переводе в input перенести вызов `getSavedState()` из конструктора в реактивный путь (effect / `ngAfterContentInit`).
- **ACC-ARCH-04 · `KbqAccordionHeader` — пустая обёртка над `KbqAccordionHeaderDirective`** — `accordion-header.ts`, `accordion-header.directive.ts`. Без поведения, не запрашивается по типу → избыточная фрагментация; рассмотреть слияние. (Разделения trigger/content **оправданы** — они несут запрашиваемое поведение — их оставить.)
- **Заметка про именование файлов.** `accordion.component.ts`/`*-trigger.component.ts`/`*.directive.ts` против голого `accordion-item.ts`/`accordion-content.ts`/`accordion-header.ts`. Косметика; привести к единой конвенции, если она в репозитории есть.

**Шаблоны и стили**
- **ACC-TPL-01 · Обёртка `<p><ng-content/></p>` навязывает невалидную вложенность для блочного контента** — `accordion-content.ts:7`, `accordion.component.scss:26-29`. Собственный пример `accordion-content-example` проецирует `<div>` (невалидно внутри `<p>`). Рендерить `<ng-content/>` напрямую и перенести padding на `.kbq-accordion-content`.
- **ACC-TPL-02 · Оставшиеся имена кастомных свойств Radix** — `accordion-content.directive.ts:77-78`, `accordion.component.scss:33`. Переименовать `--radix-accordion-content-height/width` → `--kbq-accordion-content-*` под конвенцию DS.
- **ACC-TPL-03 · `--radix-accordion-content-width` пишется, но никогда не потребляется** — `accordion-content.directive.ts:78`. Мёртвый вывод; убрать запись + деструктуризацию `width` (`:71`).
- **ACC-TPL-04 · Лишний `!important` на цвете иконки в disabled** — `_accordion-theme.scss:39`. Hover-правило уже защищено `:not([data-disabled='true'])`, а disabled-селектор и так выигрывает по специфичности; убрать `!important`.
- **ACC-TPL-05 · `renderer.setProperty(el, 'style', …)` перезаписывает весь инлайновый `style`** — `accordion-content.directive.ts:73-80`. Использовать `renderer.setStyle(el, '--kbq-…', v, RendererStyleFlags2.DashCase)` по-свойству (или host-style через сигнал). Сейчас влияние почти нулевое (других инлайн-стилей на host нет), отсюда P3.
- **ACC-TPL-06 · `border-width: 2px` (отступ под фокус-кольцо) не токенизирован** — `accordion.component.scss:11`. *Цвет* фокуса токенизирован, а ширина — нет; добавить `--kbq-accordion-size-item-border-width`. (Высота заголовка уже токен; дублированный `300ms` — это house-style, общего motion-токена нет.)

**Тесты**
- **ACC-TEST-04 · Клавиатурная навигация в горизонтальной ориентации не покрыта** — `accordion.component.spec.ts:492-506`. Проверяется только атрибут `data-orientation`; ветка Left/Right + RTL `dir?.value` (`accordion.component.ts:182-183`) не задействована. Добавить `RIGHT_ARROW`/`LEFT_ARROW` + RTL-вариант `Directionality`.
- **ACC-TEST-05 · Пропуск disabled-item клавиатурой / no-op ENTER на disabled не покрыт** — `accordion.component.spec.ts:777-805`. Disabled тестируется только мышью; проверить, что ENTER на активном disabled item не переключает его.
- **ACC-TEST-06 · Нет теста на путь краша у item без контента** — драйвит `ACC-BUG-02` (`accordion-item.ts:93`). Добавить item с триггером, но без `<kbq-accordion-content>`, и проверить, что toggle не падает.
- **ACC-TEST-07 · `disableAnimation()/enableAnimation()` полностью не покрыты** — `accordion-item.ts:215-223` → content/trigger. Проверить, что host `style.transition` переключается в `'none'` и восстанавливается. (Замечание: `openAll/closeAll` **не** трогают эти хелперы — там проверять только `data-state`.)
- **ACC-TEST-08 · Нет аудита jest-axe + одна отсутствующая проверка `aria-level`** — `accordion.component.spec.ts:711-719`. jest-axe — пробел уровня всего репозитория (ни один компонент его не запускает), поэтому это проектная заметка, не специфичная для аккордеона; как минимум проверять `aria-level` на header.
- **ACC-TEST-09 · Тесты лезут в `accordion['keyManager'].activeItemIndex` через bracket-доступ** — `accordion.component.spec.ts:443,448,461,472`. Привязывает тесты к имени `protected`-поля; лучше проверять, что `document.activeElement` — ожидаемый триггер.
- **ACC-TEST-10 · Клавиатурные тесты используют устаревший `keyCode` + самодельный `KeyboardEvent` для Shift+TAB** — `accordion.component.spec.ts:463-469`. У хелпера диспатча нет параметра `shiftKey`, поэтому самодельное событие — необходимость; только косметическая консистентность.
- **ACC-TEST-11 · Покрытие реактивности контролируемого `value` поверхностное** — `accordion.component.spec.ts:119-143`. Нет массива/`multiple`, нет взаимодействия value-vs-клик, нет проверки фоллбэка `value→defaultValue`.
- **ACC-TEST-12 · E2E — один статический скриншот 4 вариантов** — `e2e.playwright-spec.ts:9-16`. Добавить состояния expanded/фокус-кольцо/hover/горизонталь в light+dark (регрессии вращения шеврона и стиля фокуса сейчас ускользают).
- **ACC-TEST-13 · Клавиатурные тесты «фиксируют» не-APG поведение Tab как правильное** — `accordion.component.spec.ts:433-473`. После `ACC-A11Y-01` заменить на тесты стрелок + проверить, что Tab **не** `preventDefault`-ится.

## 4. Опровергнуто при проверке (исключено — не заводить повторно)

- **«Disabled-item-ы не пропускаются `FocusKeyManager` (нет `skipPredicate`)».** Неверно. CDK `ListKeyManager` ставит дефолтный `_skipPredicateFn = item => item.disabled` (`list-key-manager.mjs:27-29`), а `KbqAccordionItem.disabled` ему соответствует, поэтому Arrow/Home/End/typeahead уже пропускают disabled. «Фикс» `.skipPredicate(...)` был бы no-op.
- **«Утечка typeahead-подписки `FocusKeyManager`».** Неверно. `withHomeAndEnd()` не включает typeahead; `withTypeAhead()` нигде не вызывается, а `new FocusKeyManager(this.items())` передаёт обычный массив (не `QueryList`/сигнал), поэтому effect/QueryList-подписка не создаётся. `keyManager.destroy()` был бы фактически no-op (всё же стоит добавить превентивно — учтено в `ACC-BUG-05`).
- **«Контент измеряется скрытым → `--radix-accordion-content-height` равен 0; развёрнутый при инициализации рендерится на 0px».** Опровергается закоммиченным визуальным эталоном (`__screenshots__/01-light.png` показывает изначально развёрнутые панели в полную высоту). Единственный валидный остаток — измеряется один раз, не пере-измеряется при динамической смене контента (нет `ResizeObserver`) — это узкий латентный краевой случай, неявно учтённый заметками `ACC-TPL`/`ACC-LIFE`.

## 5. Рекомендуемые фазы исправлений

**Фаза 1 — блокеры корректности и a11y (выпускать вместе).**
`ACC-BUG-01` (`||` для disabled), `ACC-A11Y-01` (убрать перехват Tab) + `ACC-TEST-13`/`ACC-TEST-03` (заменить тесты TAB на тесты стрелок), `ACC-A11Y-04` (синхронизация фокуса). Сначала написать падающие тесты.

**Фаза 2 — корректность контролируемого состояния.**
`ACC-BUG-02` (`?.toggle()`), `ACC-BUG-03` (точное сравнение), `ACC-BUG-04` (закрытие в multiple) + `ACC-TEST-06`/`ACC-TEST-11`. Порядок: `ACC-BUG-03` перед/вместе с `ACC-BUG-04`.

**Фаза 3 — устойчивость жизненного цикла.**
`ACC-LIFE-01` (`Subscription.EMPTY`), `ACC-LIFE-02` (динамические item-ы), `ACC-LIFE-03` (таймер), `ACC-BUG-05` (защита keyManager), `ACC-BUG-06` (защиты хранилища) + `ACC-TEST-02`. Механически, низкий риск.

**Фаза 4 — упрочнение сохранения состояния.**
`ACC-ARCH-01` (инъектируемый store + стабильный ключ) + `ACC-API-08`/`ACC-ARCH-03` + `ACC-TEST-01`.

**Фаза 5 — полировка a11y и покрытие тестами.**
`ACC-A11Y-02` (input `level`), `ACC-A11Y-03` (reduced-motion) + `ACC-TEST-04/05/07/08/09/10/12`.

**Фаза 6 — модернизация API / типов / стилей (под SemVer, пакетно `approve-api`).**
`ACC-API-01..09`, `ACC-ARCH-02/04`, `ACC-TPL-01..06`. Ломающие части (enum→union, сужение `variant`, удаление ре-экспортов директив, нагрузка/переименование `onValueChange`, удаление `destroyed`) планировать на major.

## 6. Стратегия верификации

**Общие гейты (на каждую фазу):**
- `npx jest packages/components/accordion/accordion.component.spec.ts`
- `npx playwright test packages/components/accordion/e2e.playwright-spec.ts`
- `yarn run eslint && yarn run stylelint && yarn run prettier`
- API-guard только когда публичный API меняется намеренно (Фаза 6): **сначала сборка**, затем `check-api` / `approve-api` (guard читает `dist/*.d.ts`; сначала собрать `components`; на Windows вызывать `node_modules/.bin/*.cmd` напрямую; тяжёлые сборки — последовательно, никогда параллельно).

**По фазам:**
- **Фаза 1:** проверить, что `[disabled]="false"` + `[disabled]="true"` у item оставляет item отключённым (data + `aria-disabled`); проверить, что контейнер **не** `preventDefault`-ит Tab и что Arrow Up/Down двигают активный item. Ручной прогон NVDA/VoiceOver: Tab доходит до контента внутри открытой панели; Arrow двигает заголовки.
- **Фаза 2:** item-ы `item-1`/`item-10`, single-режим `[value]="'item-10'"`, проверить, что открывается только item-10; multiple `['item-1']` → `['item-2']` закрывает item-1; item без контента не падает на toggle.
- **Фаза 3:** create+destroy до content-init не падает; выросший через `@for` item эмитит `onValueChange` и навигируется стрелками.
- **Фаза 4:** фейковый `KBQ_WINDOW.localStorage`; проверить запись при toggle, восстановление при инициализации из засеянной записи, мягкую деградацию на повреждённом значении.
- **Фаза 5:** input `level` управляет `aria-level`; шеврон учитывает `prefers-reduced-motion`; новые Playwright-скриншоты состояний в light/dark.
- **Фаза 6:** после изменений типов/экспортов → `check-api`, просмотреть `tools/public_api_guard/components/accordion.api.md`, затем `approve-api`; проверить типизацию у потребителя; `yarn run styles:build-all` после SCSS-пунктов.

---

## Приложение A — Методология ревью

Подготовлено 7 параллельными ревью-агентами (архитектура, корректность, RxJS/жизненный цикл, доступность, публичный API/типы, тесты, шаблоны/стили), каждый читал исходники напрямую. Затем каждая сырая находка состязательно проверялась независимым агентом против реального кода (перепроверка номеров строк, вывод механизмов против исходников `@angular/core` & `@angular/cdk` 20.3.x, переоценка severity). Из 60 сырых находок: **38 подтверждено, 19 спорных (severity скорректирован, но проблема реальна), 3 опровергнуто.** Межизмеренческие дубликаты слиты в каноничный набор `ACC-*` выше.

## Приложение B — Просмотренные файлы

`packages/components/accordion/`: `accordion.component.ts`, `accordion-item.ts`, `accordion-trigger.component.ts`, `accordion-trigger.directive.ts`, `accordion-content.ts`, `accordion-content.directive.ts`, `accordion-header.ts`, `accordion-header.directive.ts`, `accordion.module.ts`, `public-api.ts`, `index.ts`, `ng-package.json`, `accordion.component.spec.ts`, `e2e.ts`, `e2e.playwright-spec.ts`, `accordion.component.scss`, `accordion-trigger.component.scss`, `accordion-tokens.scss`, `_accordion-theme.scss`, `accordion.en.md`, `accordion.ru.md`.
Дополнительно сверено: `tools/public_api_guard/components/accordion.api.md`, `packages/docs-examples/components/accordion/*` (8 примеров), `packages/components-dev/accordion`.
