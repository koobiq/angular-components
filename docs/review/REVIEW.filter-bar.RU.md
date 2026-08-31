# Ревью кода — `packages/components/filter-bar`

> Область: все компоненты, директивы, пайпы, типы, спеки, стили и документация в
> `packages/components/filter-bar`. Метод: ревью по 9 измерениям с **состязательной проверкой
> каждой находки** (каждое утверждение перепроверялось по реальному коду независимым агентом;
> опровергнутые находки удалены, ряд severity скорректирован). Вердикты ниже: `CONFIRMED`
> (проверено по коду) или `PLAUSIBLE` (реальная проблема, влияние зависит от потребителя/рантайма).

> **Статус (обновлён 2026-07-08): ✅ ремедиация завершена.** Каждая находка P1/P2/P3 закрыта либо несёт
> документированную **◑ частичную** / намеренно отложенную часть. Выполнено за четыре прохода — начальный
> пакет 2026-07-07 плюс **Фаза A (архитектура)**, **Фаза B (качество тестов)** и **Фаза C (SCSS и i18n)**.
> Последние и самые связанные пункты — **P1-6** (сигнальное ядро состояния) и **P2-4/P2-5** (accessor
> `@Input` → `model()`/`input()`) — сделаны 2026-07-08 через multi-agent workflow'ы: карта ряби → миграция
> → состязательный review. Гейты: `ng build components` ✅, `check-api` чисто + `approve-api` ✅,
> **350 Jest-тестов filter-bar** ✅, ESLint/Stylelint/Prettier ✅. См. **§5** — состояние по каждой находке
> и два **исправленных совета** (P2-10 и P2-7 в §3 были ошибочны — поправлены по месту).

## 1. Краткое резюме

Filter-bar — мощное, богатое возможностями семейство компонентов: хост `KbqFilterBar`, проецирующий
`KbqFilters` (поиск/сохранение/переименование сохранённых фильтров), `KbqPipeAdd` и набор из 8
динамически рендерящихся pipe-компонентов на общей базе `KbqBasePipe`, связанных через
`KbqPipeDirective` + инъекцию `KBQ_PIPE_DATA`. В основном это современный Angular (standalone,
`OnPush`, `ViewEncapsulation.None`, `input()`/`output()`, `inject()`, объект `host` — нигде нет
`@HostBinding`, `ngClass` или `ngStyle`).

Релиз **не блокируется** — на нормальном пути UI нет P0-падений — но есть устойчивый набор реальных
дефектов:

- **Утечки памяти:** четыре RxJS-подписки создаются без teardown, минимум одна на частом пути
  уничтожения компонента.
- **Доступность:** семь интерактивных элементов (кнопки только с иконкой и поля поиска) **не имеют
  доступного имени** — реальный барьер для пользователей скринридеров (оценка **D**).
- **Архитектура состояния:** самодельная «шина событий» на `BehaviorSubject` плюс ручной разброс
  `markForCheck` делают работу сигналов/`computed()` более сложным путём, а мутация общего массива
  «на месте» конфликтует со стратегией изоляции через `structuredClone`.
- **Дублирование:** `pipe-date` и `pipe-datetime` — на ~99% идентичные файлы по 240 строк; select/
  tree-пайпы содержат крупные копипаст-блоки без промежуточного базового класса.
- **Типобезопасность:** реестр пайпов и поле `configuration` типизированы как `any`; полезный
  литеральный union `KbqPipeType` обнулён из-за `| string`.
- **Тесты:** широкие, но с рядом тестов без ассертов / со стабами / дублей, и глобальный
  monkey-patch `structuredClone`, который протекает на весь Jest-воркер.

## 2. Оценочная карта

| Измерение               | Оценка | P0  | P1  | Ключевая проблема                                                                           |
| ----------------------- | :----: | :-: | :-: | ------------------------------------------------------------------------------------------- |
| Архитектура и паттерны  |   C    |  0  |  2  | RxJS-шина + ручной разброс CD там, где нужны сигналы; date≈datetime дубль 99%               |
| Стандарты Angular v19   |   C+   |  0  |  4  | 4 места утечек подписок; `*ngIf`/`NgIf` в tree-пайпах; accessor `@Input`; `any`             |
| Корректность / баги     |   C+   |  0  |  1  | утечки; `removePipe` без защиты `indexOf(-1)`; гонки `setTimeout`                           |
| Доступность             |   D    |  0  |  7  | 7 элементов/полей без доступного имени; хрупкое восстановление фокуса                       |
| TypeScript и public API |   C    |  0  |  3  | `configuration` и `KBQ_FILTER_BAR_PIPES` = `any`; input `undefined!`; имя ≠ селектору       |
| Тесты (Jest)            |   C+   |  0  |  4  | тесты поиска без ассертов; непокрытый `removePipe(-1)`; глобальная утечка `structuredClone` |
| SCSS и темизация        |   C    |  0  |  1  | нет `filter-bar-tokens.scss`; theme-миксин покрывает лишь одну кнопку; `!important`; RTL    |
| Документация и i18n     |   B-   |  0  |  0  | EN-пример → не тот демо; конфиг по умолчанию на русском                                     |

**Итого:** 0 × P0 · ~12 тем P1 · ~30 P2 · ~16 P3.

> _Оценки выше — **как найдено** (исходная база ревью). После ремедиации ключевые проблемы каждого
> измерения закрыты: утечки подписок починены, всем элементам заданы имена (A11y), RxJS-шина заменена на
> сигналы/`computed()` + входы `model()`/`input()` (Архитектура), date≈datetime и select/tree-пайпы
> дедуплицированы, `any` типизированы, тесты без ассертов/протекающие исправлены._

## 3. Приоритизированные находки

Severity: **P0** блокер релиза · **P1** высокий · **P2** желательно исправить · **P3** гигиена.
Находки, о которых сообщили сразу несколько измерений, объединены; ID в скобках сохраняют
прослеживаемость.

### P1 — Высокий

#### P1-1 · Четыре RxJS-подписки текут (нет `takeUntilDestroyed`) — `CONFIRMED`

_(NG-1/BUG-1, NG-3/BUG-3, BUG-9)_

- `filters.ts:175` — конструктор `KbqFilters`: `this.filterBar.changes.subscribe(() => this.changeDetectorRef.markForCheck())`. `filterBar.changes` — это `BehaviorSubject`, принадлежащий родительскому `KbqFilterBar`, который переживает дочерний компонент (например, `@if` вокруг `<kbq-filters>`), поэтому уничтоженный компонент и его `ChangeDetectorRef` остаются достижимыми и продолжают вызывать `markForCheck`.
- `pipe-tree-select.ts:98` и `pipe-multi-tree-select.ts:154` — `ngOnInit`: `this.searchControl.valueChanges.subscribe(v => this.treeControl.filterNodes(v))`. Пайпы создаются/уничтожаются динамически через `KbqPipeDirective.createComponent`, поэтому каждый уничтоженный пайп теряет подписку (захватывающую `this`).
- `base-pipe.ts:179` — `KbqPipeMinWidth`: `this.filterBar?.changes.pipe(delay(0)).subscribe(this.update)`. По одной утекающей подписке на каждый pipe-элемент на всё время жизни бара; `delay(0)` также может выполнить `update()` уже по уничтоженному `elementRef`.

Каждый файл уже импортирует/использует `takeUntilDestroyed` в других местах, поэтому пропуски непоследовательны.

**Исправление:** добавить `.pipe(takeUntilDestroyed(this.destroyRef))` (или `takeUntilDestroyed()` без аргумента в контексте инъекции) перед каждым `.subscribe`.

#### P1-2 · Семь интерактивных элементов без доступного имени — `CONFIRMED`

_(A11Y-1..A11Y-7)_ — WCAG 2.1 SC 4.1.2 / 1.3.1 / 3.3.2.

| #      | Элемент                                 | Расположение                                  | Проблема                                                                         |
| ------ | --------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------- |
| A11Y-1 | 2 кнопки-иконки рефрешера               | `filter-refresher.ts:12`                      | только иконка, нет `aria-label`, нет тултипа                                     |
| A11Y-2 | Кнопка действий «⋮»                     | `filters.html:51`                             | триггер дропдауна только с иконкой, без имени                                    |
| A11Y-3 | Поле поиска сохранённых фильтров        | `filters.html:76`                             | размечено только через `placeholder`                                             |
| A11Y-4 | Кнопка «+» pipe-add                     | `pipe-add.ts:25`                              | опирается на `kbqTooltip` (не является доступным именем)                         |
| A11Y-5 | Кнопка удаления/очистки пайпа           | `pipe-button.ts:28`                           | только иконка, только тултип, тултип отключается при disabled                    |
| A11Y-6 | Поле поиска внутри select-пайпа         | `pipe-select.html:33` (+ варианты multi/tree) | только `placeholder`                                                             |
| A11Y-7 | Поле имени «Сохранить как новый фильтр» | `filters.html:168`                            | «голый» `<label class="kbq-form__label">` без `for`, в соседнем `kbq-form-field` |

Наведённый `kbqTooltip` **не** становится доступным именем кнопки (пакет тултипа не добавляет `aria-label`/`aria-describedby`), а `placeholder` не является программной меткой.

**Исправление:** локализованный `[attr.aria-label]` на каждой кнопке-иконке и поле поиска (текст брать из `filterBar.configuration`); связать метку имени через `for`/`id` или `aria-label`, а ошибки валидации — через `aria-describedby`. Декоративные иконки пометить `aria-hidden`.

#### P1-3 · Input `filters` объявлен как `input<KbqFilter[]>(undefined!)` — `CONFIRMED`

_(NG-13/TSAPI-4)_ · `filters.ts:120`

Non-null-ассерт обманывает систему типов: сигнал типизирован как `KbqFilter[]`, но до привязки хранит `undefined`. `isEmpty` (`this.filters().length`) и `ngOnInit` (`of(this.filters())`) бросят исключение, если input не передан.

**Исправление:** `readonly filters = input.required<KbqFilter[]>();` (или реальный дефолт `[]`, если input действительно необязателен).

#### P1-4 · Поле `KbqFilterBar.configuration` — нетипизированное, неинициализированное public-поле — `CONFIRMED`

_(NG-5/TSAPI-3)_ · `filter-bar.ts:64` — `configuration;`

Неявный `any`, без модификатора доступа, без инициализатора; присваивается только в `updateLocaleParams`/`initDefaultParams`. Все потребители читают `.filters` / `.reset` / `.add` / `.pipe` без типизации (`filters.ts:161`, `filter-reset.ts:29`, `base-pipe.ts:80`), а ранний доступ может получить `undefined`.

**Исправление:** описать интерфейс `KbqFilterBarConfiguration` (форма `ruRULocaleData.filterBar`), типизировать и инициализировать поле, пометить `protected readonly` по необходимости.

#### P1-5 · Реестр пайпов — `InjectionToken<any>`, точка расширения без типов насквозь — `CONFIRMED`

_(TSAPI-1/FB-ARCH-09)_ · `filter-bar.types.ts:20`

`KBQ_FILTER_BAR_PIPES = new InjectionToken<any>(…)`, заполняется `Map<string, unknown>`. `KbqPipeDirective` (`pipe.directive.ts:16,22`) получает компонент как `any` и вызывает у него `createComponent` — неверное значение упадёт только в рантайме. Это центральная точка расширения всей фичи.

**Исправление:** `InjectionToken<Map<KbqPipeType, Type<KbqBasePipe<unknown>>>>` и соответствующая типизация `defaultFilterBarPipes`.

#### P1-6 · Шину событий состояния следует заменить на сигналы + `computed()` — `CONFIRMED` · ✅ сделано (Фаза A)

_(FB-ARCH-02/NG-11)_ · `filter-bar.ts:153-196`

`KbqFilterBar` предоставляет 5 самодельных Subject (`changes`, `internalFilterChanges`, `internalTemplatesChanges`, `openPipe`, `onResetFilter`) плюс 2 цепочки `merge()`; вторая цепочка на каждую эмиссию вызывает и `changes.next()`, **и** `markForCheck()`, а на `changes` независимо подписаны `KbqFilters`, `KbqPipeAdd`, `KbqPipeState`, `KbqFilterBarButton`, `KbqPipeButton` и `KbqPipeMinWidth` — каждый снова вызывает `markForCheck`. Одно изменение пайпа порождает несогласованный каскад CD. `isSaved/isChanged/isReadOnly/isDisabled` уже являются обычными геттерами от `filter` — хрестоматийный случай для сигналов, которые предписаны стандартами проекта.

**Исправление (сделано, ломающее API):** `filter` теперь основан на приватном `signal` за существующим accessor-`@Input()` (чтение `filter` остаётся `.filter`, без ряби `.filter()` по перегруженному токену); булевы состояния — `computed()` от него (`isSaved()` … — ломающее изменение публичного API, согласовано); Subject `changes` и его вторая `merge`-цепочка **удалены**. 6 прежних подписчиков реагируют через реактивность сигналов: `KbqFilters` (шаблон читает `computed()`-состояния), `KbqPipeAdd` (`addedPipes` → `computed()`), а `KbqPipeState`/`KbqFilterBarButton`/`KbqPipeButton`/`KbqPipeMinWidth` — через `effect()` (min-width сохраняет прежний `delay(0)` через отложенный `setTimeout` + cleanup). `filter-reset` больше не дёргает `changes.next()`. Чтобы `computed()`-состояния реагировали, in-place мутации `filter.changed/saved/pipes` (`removePipe`, `resetFilterChangedState`, `saveChanges`, `pipe-add`, цепочка `onChangePipe/onRemovePipe`) заменены на **иммутабельные** — это закрывает **ядро P2-20**. Чистое переименование в `model()` (P2-4) и `kbqPipeState`→`input()` (P2-5) осознанно отложены; accessor-`@Input()` `filter` сохранён (публичная поверхность не изменилась). Сборка ✓, 349 тестов ✓ (добавлен неваку́умный тест стиля кнопки от `effect`), `approve-api` ✓ (`changes` убран, состояния → `Signal<boolean>`, `addedPipes` → `Signal`), eslint/prettier ✓.

#### P1-7 · `pipe-date.ts` ≈ `pipe-datetime.ts` — на 99% идентичные файлы по 240 строк — `CONFIRMED`

_(FB-ARCH-03)_ · `pipe-datetime.ts:56`

Компоненты различаются лишь вызовом форматтера (`rangeShortDate` vs `rangeShortDateTime`, строка 81) и `defaultStart`/`defaultEnd` (`startOf`/`endOf('day')`, строки 107/121). Все прочие члены — импорты, providers, `onKeydown`, `onApplyPeriod`, `onSelect`, `showPeriod`, `showList`, `open`, все обработчики фокуса/календаря, `initFormGroup`, все геттеры — дублируются дословно (они даже используют общий `pipe-date.scss`). Любое исправление (включая a11y выше) нужно применять дважды, и оно будет расходиться.

**Исправление:** извлечь абстрактный `KbqPipeDateBaseComponent<D>` с 3 защищёнными хуками (`formatRange`, `getDefaultStart`, `getDefaultEnd`); конкретные пайпы станут подклассами по ~15 строк.

#### P1-8 · Тесты поиска multi-select без ассертов (ложное покрытие) — `CONFIRMED`

_(TEST-1)_ · `pipe-multi-select.spec.ts:663,680`

`filteredOptions` — «холодный» `merge(internalTemplatesChanges, searchControl.valueChanges)` без `startWith`/replay. Тесты вызывают `setValue(...)` + `flush()` **до** подписки, поэтому эмиссия уже прошла, и колбэк `subscribe` (и его `expect`) не выполняется. Тесты проходят безусловно, с нулевым покрытием фильтрации поиска — противоположно их названиям.

**Исправление:** сначала подписаться (сохранить в переменную), затем `setValue` + `flush`, затем ассертить синхронно — по образцу `pipe-select.spec.ts:382-400`.

#### P1-9 · Путь `removePipe(-1)` не покрыт + в исходнике нет защиты — `CONFIRMED`

_(F1; исходник BUG-5, PLAUSIBLE)_ · `filter-bar.spec.ts:284`, исходник `filter-bar.ts:201`

`removePipe` делает `this.filter?.pipes.splice(this.filter?.pipes.indexOf(pipe), 1)`. Если `pipe` не найден, `indexOf` вернёт `-1`, и `splice(-1, 1)` удалит **последний** элемент. Все тесты `removePipe` передают присутствующий пайп, поэтому дефектный путь не покрыт. (В нормальном UI-потоке объект пайпа — это тот самый элемент `KBQ_PIPE_DATA`, так что путь недостижим — отсюда защита в исходнике P2/`PLAUSIBLE` — но отсутствующий тест P1.)

**Исправление:** добавить тест удаления пайпа, **отсутствующего** в массиве, и проверить неизменность массива; добавить защиту `if (i === -1) return;` (лучше удалять по id через `getId`).

#### P1-10 · Глобальный monkey-patch `structuredClone` не восстанавливается — `CONFIRMED`

_(F2)_ · `filter-bar.spec.ts:81` (также `filters.spec.ts:92`, `pipe-add.spec.ts:87`)

`window.structuredClone = (v) => JSON.parse(JSON.stringify(v))` присваивается в теле describe (выполняется один раз при загрузке файла, без `afterEach`/`afterAll`). Потерянный JSON-шим протекает на любой последующий тест в том же Jest-воркере и маскирует потерю `Date`/`undefined`/функций, на которую реально опираются `saveFilterState`/`restoreFilterState`/`selectFilter`.

**Исправление:** сохранить оригинал и восстановить его в lifecycle-хуке (или использовать `structuredClone` из jsdom/node).

#### P1-11 · Тест «invalid» в `saveAsNew` подменяет `FormControl.invalid` — `CONFIRMED`

_(F3)_ · `filters.spec.ts:286`

`Object.defineProperty(component.filterName, 'invalid', { get: () => true })` тестирует стаб, а не реальную защиту `Validators.required`, и мутирует контрол без восстановления.

**Исправление:** открыть поповер, чтобы `filterName` создался с `Validators.required`, оставить его пустым, вызвать `saveAsNew`, проверить, что `onSave` не сработал.

#### P1-12 · Theme-миксин покрывает только кнопку changed-filter — `CONFIRMED` · ✅ сделано (Фаза C)

_(FB-SCSS-005)_ · `_filter-bar-theme.scss:23`

`_filter-bar-theme.scss` предоставляет только `kbq-button-changed-filter()` + типографику. Все прочие темизируемые поверхности — разделители пайпов (`base-pipe.scss:46,61`), цвета имени/значения/disabled пайпа (`base-pipe.scss:23,72`), цвета тултипа пайпа (`base-pipe.scss:113,117`), фоны readonly-disabled (`pipe-readonly.scss:8,15`), точка-предупреждение changed-saved (`filters.scss:64,67`) — жёстко используют глобальные CSS-переменные прямо в базовом SCSS без theme-хука. (Они всё же реагируют на **глобальное** переключение темы через семантические токены, поэтому severity спорна.)

**Исправление:** перенести объявления цвета/фона в theme-миксины в `_filter-bar-theme.scss`, подключаемые из базового SCSS.

### P2 — Желательно исправить

- **P2-1 · `*ngIf`/`NgIf` вместо `@if`** _(NG-4, CONFIRMED)_ — `pipe-tree-select.ts:40` и `pipe-multi-tree-select.ts:42` импортируют `NgIf`; в шаблонах `*ngIf="data.search"` (с `eslint-disable` для `prefer-control-flow`). **Исправление:** `@if` + убрать `NgIf`.
- **P2-2 · `filterName.valueChanges` в `preparePopover` без teardown** _(NG-2/BUG-2, CONFIRMED)_ — `filters.ts:264`; выполняется при каждом открытии поповера, соседние подписки используют `takeUntilDestroyed`. **Исправление:** добавить `takeUntilDestroyed(this.destroyRef)`.
- **P2-3 · `onChangePipe` — `@Output() EventEmitter` среди `output()`** _(NG-6/BUG-7/FB-ARCH-06, CONFIRMED)_ — `filter-bar.ts:117`; вызывающие смешивают `.next()` (`base-pipe.ts:146`) и `.emit()` с расходящимися payload (`{...data, value: []}` vs `data`), так что подписчики получают несогласованную ссылку. **Исправление:** привести всё к `output()` + единообразный payload (при необходимости внутреннего потока держать приватный `Subject`).
- **P2-4 · Accessor `@Input filter`/`pipeTemplates` не мигрированы** _(NG-7, CONFIRMED; ✅ сделано, ломающее)_ — `filter-bar.ts:80,98` (несли TODO «слишком сложно мигрировать»). **Исправление (сделано):** `filter` → `model<KbqFilter|null>()` (двусторонний `[(filter)]` сохранён; явный output `filterChange` убран — `model()` синтезирует его; императивные подписчики используют `filter.subscribe`); `pipeTemplates` → `input<KbqPipeTemplate[]>()`, побочный эффект сеттера перенесён в `effect(() => internalTemplatesChanges.next(pipeTemplates()))`. `KbqFilters.filter` намеренно оставлен обычным геттером (тело читает `filterBar.filter()`), чтобы ограничить рябь. Каждое чтение `filterBar.filter` → `filterBar.filter()`, запись → `filterBar.filter.set()`, по всему source + 3 docs-examples + все специи. Оба TODO «слишком сложно» удалены. Отображено + мигрировано + отревьюено через multi-agent workflow'ы. Build ✓, 350 тестов ✓, `approve-api` ✓ (ломающее: `filter`→`ModelSignal`, `pipeTemplates`→`Signal`, output `filterChange` убран), lint ✓.
- **P2-5 · Accessor `@Input kbqPipeState` не мигрирован** _(NG-8, CONFIRMED; ✅ сделано)_ — `pipe-state.ts:25` (геттер+сеттер+ручной `updateState`). **Исправление (сделано):** `state` → `input<T|null>(null, { alias: 'kbqPipeState' })`; побочный эффект `updateState()` из сеттера свёрнут в существующий effect (`effect(() => this.updateState(this.filterBar.filter(), this.state()))`). Привязки `[kbqPipeState]` не изменились. `approve-api` ✓ (`get/set state` → `InputSignal`).
- **P2-6 · Повсеместный `any` в select/tree-пайпах** _(NG-9/TSAPI-8, CONFIRMED)_ — `template: any`, `filteredOptions: Observable<any[]>`, нетипизированные tree-колбэки, приведения `as any` (`pipe-multi-tree-select.ts:62,69,165,219,321`; аналогично в `pipe-tree-select.ts`). Поля `template`/`filteredOptions` в tree-пайпах выглядят рудиментарными. **Исправление:** использовать типы узлов/`KbqSelectValue`; убрать мёртвые поля.
- **P2-7 · `UntypedFormControl` (типизация форм)** _(NG-10, CONFIRMED; ◑ частично)_ — `filters.ts:100` (и searchable-пайпы). **Исправление (сделано):** типизированный `FormControl<string | null>` везде; `UntypedFormControl` убран. **⚠ Поправка:** исходный совет также требовал «добавить `kbqDisableLegacyValidationDirectiveProvider()` + `ErrorStateMatcher`» — но этот провайдер **не экспортируется из `@koobiq/components`**; это был no-op shim, **удалённый в v20** (v20-схематик его активно удаляет, `schematics/…/v20-upgrade/data.ts`). Провайдер добавлять некуда; P2-7 сводится к типизации форм. `ErrorStateMatcher` — опциональное будущее улучшение (единственная показываемая ошибка уже управляется вручную через `@if (filterName.hasError(...))`).
- **P2-8 · `KbqBasePipe.stateChanges` подписан в конструкторе без teardown** _(BUG-4, PLAUSIBLE)_ — `base-pipe.ts:86`; влияние мало (собственный Subject), но поздний `.next()` из `setTimeout` после уничтожения вызовет `markForCheck` на устаревшем CDR. **Исправление:** `takeUntilDestroyed()` / завершать при уничтожении.
- **P2-9 · `removePipe` без защиты `indexOf(-1)`** _(BUG-5, PLAUSIBLE)_ — `filter-bar.ts:201` (см. P1-9). **Исправление:** защитить `-1`, удалять по id.
- **P2-10 · Избыточное двойное присвоение `values`/`valueTemplate` в tree-подклассах** _(BUG-6/FB-ARCH-01, PLAUSIBLE; ◑ частично)_ — `base-pipe.ts` + `pipe-tree-select.ts` + `pipe-multi-tree-select.ts`. **⚠ Поправка:** исходный совет («удалить подписки в подклассах — база уже диспатчит на переопределение») **противоречив и опасен** — он сломал бы дерево. Порядок инициализации полей JS: базовый конструктор (который подписывается) выполняется в `super()` _до_ того, как инициализаторы полей подкласса переопределят `updateTemplates`; поэтому базовая подписка навсегда захватывает **базовый** `updateTemplates` (присваивает только `values`/`valueTemplate`, но не `dataSource`). Подписка **подкласса** — единственный писатель `dataSource.data`; её удаление оставит дерево пустым (CONFIRMED состязательной перепроверкой). **Исправление (сделано):** сохранить обе подписки и облегчить переопределение в подклассе, чтобы оно писало только `dataSource.data`, убрав дублирующее присвоение `values`/`valueTemplate`, которое база уже делает. (Избыточная _подписка_ сохранена по необходимости, поэтому находка — ◑ частично по замыслу.)
- **P2-11 · Незащищённая гонка `setTimeout` в multi-tree-select** _(BUG-8, PLAUSIBLE)_ — `pipe-multi-tree-select.ts:184,223`; отложенная работа читает `this.select()` и мутирует `data.value` после возможного уничтожения/смены фильтра. **Исправление:** защитить через `destroyRef` или использовать `afterNextRender`.
- **P2-12 · Non-null `this.filter!` в `resetFilterChangedState`** _(BUG-10, PLAUSIBLE)_ — `filter-bar.ts:219`; недостижимо через UI (`@if (filterBar.isSavedAndChanged)`), но опасно для программных вызовов public-метода. **Исправление:** `if (!this.filter) return;`.
- **P2-13 · `KbqPipeType = \`${KbqPipeTypes}\` | string`** _(TSAPI-2, CONFIRMED)_ — `filter-bar.types.ts:42`; `| string` схлопывает литеральный union (нет автодополнения/исчерпывающих проверок). **Исправление:** `\`${KbqPipeTypes}\` | (string & {})`.
- **P2-14 · Экспортируемый `kbqBuildTree(value: any)`** _(TSAPI-5, CONFIRMED)_ — `filter-bar.types.ts:150`; протекает `any` потребителям, `v['value']` без защиты. **Исправление:** `Record<string, unknown>` + сужение.
- **P2-15 · Имя класса `KbqFilterBarRefresher` ≠ селектору `kbq-filter-refresher`** _(TSAPI-6, CONFIRMED)_ — `filter-refresher.ts:26`; несогласованный public-экспорт (у соседей совпадает). **Исправление:** переименовать класс в `KbqFilterRefresher` или селектор в `kbq-filter-bar-refresher` (синхронизировать `public-api`/module).
- **P2-16 · Нетипизированный `getFilteredOptions(value)` + неинициализированный `filterSavingErrorText`** _(TSAPI-7, CONFIRMED)_ — `filters.ts:373,116`. **Исправление:** типизировать параметр, инициализировать поле.
- **P2-17 · Хрупкое восстановление фокуса** _(A11Y-9, CONFIRMED)_ — WCAG 2.4.3 — `filters.ts:254`; `focusedElementBeforeOpen` устанавливается только `KbqFilterBarButton` через `(click)/(keydown)`, поэтому открытия поповера из дропдауна/программно (`filters.html:108,128`) возвращают фокус на `<body>`. **Исправление:** захватывать триггер в момент открытия; откат на `mainButton`.
- **P2-18 · Нет объявлений статуса** _(A11Y-10, CONFIRMED; ✅ сделано)_ — WCAG 4.1.3 — `filters.ts:244`; успех/ошибка сохранения (`kbq-alert`, `filters.html:161`) и добавленные пайпы не имеют `role="alert"`/`aria-live`. **Исправление (сделано):** `role="alert"` на алерте ошибки (Фаза C) + визуально скрытая `.cdk-visually-hidden` `aria-live="polite"`-область в `pipe-add`, объявляющая добавленный пайп через новый локализованный ключ `filterBar.add.addedAnnouncement` (плейсхолдер `{{ name }}`, все 5 локалей). Non-vacuous тест проверяет точный текст объявления.
- **P2-19 · Нет общей базы для select-семейства пайпов** _(FB-ARCH-04, CONFIRMED; ✅ сделано Фаза A)_ — `pipe-multi-select.ts:118`; `selectedAllEqualsSelectedNothing`, `updateInternalSelected`, `emitChangePipeEvent`, `internalSelected` и весь tree-каркас (`transformer`/`getLevel`/…) дублируются в 4 пайпах. **Исправление (сделано, две части):** (1) извлечён `KbqTreeSelectPipeBase<V>` (`@Directive()`-база через прямой `extends`, чтобы `viewChild`-запросы наследовались под AOT) с flat-tree control/flattener/data-source, 6 node-аксессорами, поиском и open/close — `pipe-tree-select` + `pipe-multi-tree-select` наследуют его (~70 строк × 2). Подписка `internalTemplatesChanges` оставлена в ctor подклассов (ловушка field-init/replay из P2-10). (2) multi-select-состояние «выбрать всё = ничего» (~25 строк) — общее для `pipe-multi-select` (база `KbqBasePipe`) и `pipe-multi-tree-select` (база `KbqTreeSelectPipeBase`), **ромб** — вынесено в **plain composition-хелпер** `KbqMultiSelectPipeState` (private-поле в каждом пайпе → без утечки в API; одна `@Directive()`-база не покрывает обе базы, mixin рискует поломкой наследования query под AOT). Почти нулевой выигрыш по строкам, но single-source для тонкой логики. Build ✓, 348 тестов ✓, `approve-api` ✓ (только tree-база; хелпер private).
- **P2-20 · Мутация `splice`/`push` «на месте» vs изоляция через `structuredClone`** _(FB-ARCH-05, CONFIRMED; ✅ сделано)_ — `filter-bar.ts:201`, `pipe-add.ts:98`; мутация на месте ломает reference-equality `OnPush`/сигналов (отсюда ручные `changes.next()`/`markForCheck`), а `structuredClone` на каждый выбор — тяжёлая глубокая копия, молча теряющая неклонируемые значения (`valueTemplate: TemplateRef`). **Исправление (сделано):** (1) `filter`/`pipes` иммутабельны (новая ссылка при add/remove/save — сделано в P1-6, именно это заставляет `computed()`-состояния реагировать); (2) `KbqFilters.selectFilter` теперь изолирует активный фильтр через **поверхностную структурную копию** (`{ ...filter, pipes: filter.pipes.map((p) => ({ ...p })) }`) вместо `structuredClone` на каждый выбор — безопасно, т.к. **каждый пайп пишет `value` переприсваиванием, а не in-place** (проверено по всем пайпам: нет `.value.push/splice/sort`), поэтому поверхностной изоляции достаточно, а неклонируемые `value`-нагрузки сохраняются. `structuredClone` теперь только на границе `saveFilterState`/`restoreFilterState`. Non-vacuous тест изоляции (правка активной копии → источник не меняется). Build ✓, 350 тестов ✓, без изменений API.
- **P2-21 · `KbqFilters` перегружен (SRP)** _(FB-ARCH-07, CONFIRMED; ✅ сделано Фаза A)_ — `filters.ts:61`; владеет поиском + сохранением + переименованием + жизненным циклом поповера + фокусом + показом ошибок в одном компоненте ~380 строк. **Исправление (сделано):** извлечён `KbqFilterSavePopover` — владеет **состоянием** save/rename (`filterName`, `saveNewFilter`, `isSaving`, error), **шаблонами** header/content/footer поповера и **логикой** save/error/close. Триггер поповера остаётся на главной кнопке `KbqFilters` (она же ведёт дропдаун сохранённых фильтров); ребёнок получает триггер через `exportAs` template-ref (`#popoverRef="kbqPopover"`) и **императивно проставляет свои шаблоны на триггер** в `ngAfterViewInit` — без родительского `[kbqPopoverContent]`-биндинга, поэтому без `ExpressionChangedAfterItHasBeenCheckedError`. `KbqFilters` сохраняет управление фокусом + публичный API `filterSavedSuccessfully`/`filterSavedUnsuccessfully` и делегирует остальное через **тонкий фасад** (публичная поверхность + все 70 filters-спеков не изменились). Build ✓, 348 тестов ✓, `approve-api` ✓.
- **P2-22 · Несоответствие имени и тела теста + дубль** _(TEST-2, CONFIRMED)_ — `pipe-multi-tree-select.spec.ts:374`; тест в `describe('onSelect')` вызывает `toggleSelectAllNode()`, а не `onSelect`, и дублирует тест на 448-468. **Исправление:** прогонять через `onSelect` или удалить дубль.
- **P2-23 · Тест `onClose` ассертит только `toBeDefined()`** _(TEST-3, CONFIRMED)_ — `pipe-multi-tree-select.spec.ts:585` (также `pipe-multi-select.spec.ts:560`); `selected` всегда определённый массив, поэтому ассерт не может упасть. **Исправление:** ассертить конкретный снимок `internalSelected`.
- **P2-24 · Набор «Pipe states» скопирован в 7 спеках** _(TEST-4, CONFIRMED)_ — `pipe-text.spec.ts:96` (+6); идентичный блок `required/empty/cleanable/removable/disabled` с магическими индексами `[0..4]`. **Исправление:** параметризованный хелпер / тестировать базу один раз, в каждом спеке — только специфичный класс.
- **P2-25 · Повсеместные приведения `(component as any)` в спеках** _(F4, CONFIRMED)_ — `filters.spec.ts:526,562,703,716,749,894` обращаются к защищённым viewChild; переименования компилируются молча. **Исправление:** ассертить через публичное поведение/DOM или типизированный тест-шов.
- **P2-26 · Полный цикл `saveAsNew → error(nameAlreadyExists) → retry` не покрыт** _(F5, CONFIRMED)_ — `filters.spec.ts:274`; успех и `showError` тестируются по отдельности, но не в связке. **Исправление:** добавить интеграционный тест цикла.
- **P2-27 · Смена локали / приоритет `externalConfiguration` не тестируются** _(F6, CONFIRMED)_ — `filter-bar.spec.ts:451`; проверяется только дефолт без locale-сервиса. **Исправление:** подставить мок `KBQ_LOCALE_SERVICE`, эмитить `changes`, и случай, где `KBQ_FILTER_BAR_CONFIGURATION` побеждает.
- **P2-28 · Нет `filter-bar-tokens.scss`** _(FB-SCSS-001, PLAUSIBLE)_ — `filter-bar.scss:1`; в документированной триаде `<comp>.scss` + `<comp>-tokens.scss` + `_<comp>-theme.scss` (см. `button/`) отсутствует слой токенов, поэтому вся геометрия — литералы. (Ряд других компонентов тоже без него, так что это сложившийся под-паттерн, а не уникальное нарушение.) **Исправление:** добавить файл токенов с переменными `--kbq-filter-bar-*`.
- **P2-29 · Магическая геометрия и `!important`** _(FB-SCSS-002/003/004, CONFIRMED; ✅ сделано Фаза C)_ — `320px` min/max-width (`filter-bar.scss:36`); `!important` на padding поповера с сырым `1px` (`filter-bar.scss:41`); тройной `!important` + `calc()` на разделителе (`filters.scss:30`). **Исправление (сделано):** геометрия токенизирована через `panelClass`-scoped custom properties; избыточный `!important` на поповере текстового пайпа убран. **⚠ Поправка:** `!important` на padding поповера и на сепараторе — несущие (docs-пример custom-pipe переиспользует `.kbq-pipe__popover` с дефолтными paddings; сепаратор перекрывает правило дивайдера `.kbq-divider_paddings` 0,3,0) — оставлены и задокументированы, а не убраны.
- **P2-30 · EN-пример указывает на не то демо** _(docs-i18n-1, CONFIRMED)_ — `examples.filter-bar.en.md:3` использует `<!-- example(filter-bar-complete-functions) -->` под заголовком «custom pipe», тогда как RU корректно использует `filter-bar-custom-pipe`. Английские читатели видят не тот пример. **Исправление:** привести EN к RU (или добавить отдельный заголовок для complete-functions в обоих).
- **P2-31 · Конфиг по умолчанию жёстко на русской локали** _(docs-i18n-2, CONFIRMED; ✅ сделано Фаза C)_ — `filter-bar.types.ts:14` `KBQ_FILTER_BAR_DEFAULT_CONFIGURATION = ruRULocaleData.filterBar`; без `KBQ_LOCALE_SERVICE` `initDefaultParams()` показывает русские строки в англоязычном приложении. (Общая для библиотеки конвенция, поэтому i18n-запах, а не регрессия filter-bar.) **Исправление (сделано):** задокументировано через JSDoc (дефолт `ru-RU` сохранён — каждый `KBQ_*_DEFAULT_CONFIGURATION` резолвится в `ruRULocaleData`, менять только filter-bar было бы несогласованно + поведенческое изменение публичной константы); doc направляет предоставить `KBQ_LOCALE_SERVICE`.

### P3 — Гигиена

- **P3-1 · Отсутствуют `protected`/`readonly` у членов только для шаблона** _(NG-12, CONFIRMED)_ — `filters.ts:105-118` (`popoverSize`, `popoverOffset`, `filterName`, `showFilterSavingError`, `isSaving`, …).
- **P3-2 · `restoreFilterState(structuredClone(null))` молча обнуляет фильтр; связанность с клонируемостью payload** _(BUG-11, PLAUSIBLE; ✅ сделано Фаза A)_ — `filter-bar.ts:213`. **Исправление (сделано):** guard в `restoreFilterState` — если нет ни явного аргумента, ни `savedFilter`, метод no-op вместо присвоения `structuredClone(null)`. Добавлен non-vacuous тест (падает без guard — фильтр обнуляется).
- **P3-3 · `compareByValue(o1: any, o2: any)` сравнивает `.id`, которого нет в `KbqSelectValue`** _(TSAPI-9, CONFIRMED)_ — `pipe-multi-select.ts:206`, `pipe-select.ts:87`; `KbqSelectValue` объявляет только `name`/`value`.
- **P3-4 · У `KBQ_FILTER_BAR_CONFIGURATION` `InjectionToken` нет generic** _(TSAPI-10, CONFIRMED)_ — `filter-bar.types.ts:17` → `unknown`, распространяется в `configuration`.
- **P3-5 · Декоративные иконки без `aria-hidden` на хосте `<i>`** _(A11Y-8, PLAUSIBLE)_ — `icon.component.ts`; в основном неактуально, т.к. вставляемый `<svg>` уже `aria-hidden` через реестр иконок.
- **P3-6 · Пайпы жёстко связаны с конкретным `KbqFilterBar`** _(FB-ARCH-08, CONFIRMED; ✅ сделано Фаза A)_ — `base-pipe.ts:45` (+ `pipe-state`, `pipe-add`, `filter-bar-button`); жёсткая звёздная топология без интерфейс-шва, поэтому пайп нельзя юнит-тестировать без полного бара. **Исправление (сделано):** добавлены интерфейс `KbqFilterBarHost` + токен `KBQ_FILTER_BAR_HOST` в `filter-bar.types.ts`; `KbqFilterBar implements KbqFilterBarHost` и предоставляет себя через `useExisting: forwardRef(() => KbqFilterBar)`. Pipe-потребители (`KbqBasePipe`, `KbqPipeMinWidth`, `KbqPipeButton`, `KbqPipeAdd`, `KbqPipeState`, `KbqFilterBarButton`, `KbqFilterReset`, `KbqFilterRefresher`) теперь `inject(KBQ_FILTER_BAR_HOST)`. **`KbqFilters` намеренно оставлен на конкретном `KbqFilterBar`** — он строит публичный `KbqSaveFilterEvent`, поле `filterBar: KbqFilterBar` которого намеренно даёт потребителям полный бар (`saveFilterState`/`restoreFilterState`/…), чего шов не раскрывает. Поведение сохранено (`useExisting` → тот же инстанс); 348 Jest-тестов проходят; публичный API обновлён (`approve-api`).
- **P3-7 · Магические keycode / жёсткие индексы в тестах** _(TEST-5, CONFIRMED)_ — `pipe-text.spec.ts:321` (`keyCode: 13/27`); использовать `ENTER`/`ESCAPE` из `@koobiq/components/core`.
- **P3-8 · Асимметричное покрытие `compareByValue` для null** _(TEST-6, CONFIRMED; ✅ сделано)_ — `pipe-select.spec.ts` vs `pipe-multi-select.spec.ts` (`toBeFalsy()` vs `toBe(false)`, отсутствует симметричный случай). **Исправление (сделано):** оба spec покрывают first-null / second-null / both-null единым `toBe(false)`; компаратор multi-select занулён, поэтому `(null, null)` возвращает `false` (устранена асимметрия) — см. §5.
- **P3-9 · Тавтологичные тесты веток геттера `selected`** _(TEST-7, CONFIRMED)_ — `pipe-multi-tree-select.spec.ts:265` (обе ветки дают тот же литерал; перестановка прошла бы).
- **P3-10 · Глубокая изоляция `structuredClone` не проверяется** _(F7, CONFIRMED)_ — `filters.spec.ts:212` (лишь поверхностная проверка ссылки).
- **P3-11 · Восстановление фокуса в `filterSavedSuccessfully` не проверяется** _(F8, CONFIRMED)_ — `filters.spec.ts:497` (путь `setTimeout(() => restoreFocus())` не верифицируется).
- **P3-12 · RTL-небезопасные физические margin / дублирование SCSS / жёсткие px** _(FB-SCSS-006/007/008, CONFIRMED; ✅ сделано Фаза C)_ — `margin-left/right` повсюду (`base-pipe.scss:39`); дублированные правила value/badge + повторяющийся `max-height: 404px` (`pipe-multiselect.scss` ↔ `pipe-multi-tree-select.scss`); литералы `400/136/64/4px` (`filters.scss:86`, `pipe-date.scss:78`, `filter-refresher.scss:5`). **Исправление (сделано):** все физические направленные свойства → логические (включая шов кнопок — borders/radii, сверх исходного margins-скоупа); `404px` де-дублирован общим миксином; магические ширины токенизированы.
- **P3-13 · В прозаической документации нет описания публичного API** _(docs-i18n-3, CONFIRMED)_ — `filter-bar.en.md`/`.ru.md` не упоминают inputs/outputs/токены/типы пайпов (полагаются на автогенерируемую вкладку API).

## 4. Не является дефектом (проверено и отклонено)

- **Дублирующиеся template-ref `#kbqTitleText`** в `pipe-readonly`, `pipe-select.html`, `pipe-date.html`, `filters.html` — **намеренны**: директива `kbq-title` собирает несколько элементов `#kbqTitleText` через `@ContentChildren('kbqTitleText')` (`title.directive.ts:192`; документировано в `title.en.md:28`) для определения переполнения по имени + значению.
- **«Отсутствующие» pipe-компоненты в `filter-bar.module.ts`** — не пробел в public API: 8 pipe-компонентов предоставляются лениво через `KBQ_FILTER_BAR_PIPES` и рендерятся `KbqPipeDirective`, а не объявляются в NgModule по замыслу.

## 5. Статус исполнения и оставшаяся работа

Ремедиация выполнена **2026-07-07 → 2026-07-08** за четыре прохода — начальный пакет, затем **Фаза A
(архитектура)**, **Фаза B (качество тестов)** и **Фаза C (SCSS и i18n)**. Проверено независимыми
по-находочными аудитами + состязательным multi-agent review сигнальных миграций P1-6 и P2-4/P2-5, плюс
стандартные гейты: `ng build components` ✅, `check-api` чисто + `approve-api` ✅, **350 Jest-тестов
filter-bar** ✅, ESLint/Stylelint/Prettier ✅. Легенда: **✅ сделано** · **◑ частично** · **⏳ отложено**.

### ✅ Сделано — начальный пакет 2026-07-07 (29)

P1-1, P1-2, P1-3, P1-4, P1-5, P1-7, P1-8, P1-9, P1-10, P1-11, P2-1, P2-2, P2-3, P2-6, P2-8, P2-9,
P2-11, P2-12, P2-13, P2-14, P2-15, P2-16, P2-17, P2-28, P2-30, P3-3, P3-4, P3-5, P3-9.

_Остальные архитектурные / тестовые / SCSS-находки закрыты в фазовых проходах ниже (Фаза B:
P2-22–P2-27, P3-7/P3-10/P3-11, P3-8; Фаза C: P1-12, P2-31, P3-13; **Фаза A: P3-2, P3-6, P2-19, P2-21,
P1-6, P2-20, P2-4, P2-5** — все ✅)._

Заметки о фиксах, которые (обоснованно) отклонились от исходной формулировки: **P1-4** оставляет
`configuration` публичным и мутабельным (переприсваивается при смене локали), а не `protected
readonly`; **P1-9/P2-9** используют guard через `includes()` + иммутабельный `filter()`, а не
буквальную проверку `indexOf === -1`; **P3-5** помечает каждый декоративный `<i kbq-icon>`
`aria-hidden` по месту (а не глобальный host иконки, который должен оставаться озвучиваемым).

### ◑ Частично (сделано, но остался кусок)

- **P2-7** — типизированный `FormControl<string | null>` сделан; предписанного провайдера **не
  существует** (см. поправку в §3), добавлять нечего; `ErrorStateMatcher` — опциональное будущее
  улучшение.
- **P2-10** — избыточное двойное присвоение `values`/`valueTemplate` убрано; лишняя подписка
  намеренно сохранена (совет «удалить её» опасен — см. поправку в §3).
- **P2-18** — ✅ **полностью сделано**: `role="alert"` на алерте ошибки (Фаза C) + визуально скрытая
  `aria-live="polite"`-область в `pipe-add`, объявляющая добавленный пайп (новый ключ
  `filterBar.add.addedAnnouncement`, все 5 локалей; non-vacuous тест). Build ✓, 351 тест ✓, `approve-api` ✓
  (аддитивно), lint ✓.
- **P2-20** — ✅ **полностью сделано**: иммутабельные `filter`/`pipes` (новая ссылка при add/remove/save —
  P1-6) + `selectFilter` теперь использует поверхностную структурную копию вместо `structuredClone` на
  каждый выбор (безопасно: все записи `value` пайпов — переприсваивания); `structuredClone` — только на
  границе save/restore. 350 тестов ✓.
- **P2-22** — добавлен реальный тест через `onSelect`; ошибочно расположенный дубль под
  `describe('onSelect')` (реально зовущий `toggleSelectAllNode`) остался.
- **P2-29** — ✅ **остаток выполнен в Фазе C**: оверлейная геометрия токенизирована через
  `panelClass`-scoped custom properties; избыточный `!important` на поповере текстового пайпа убран. Два
  оставшихся `!important` (padding поповера + сепаратор) оказались **несущими** и оставлены +
  задокументированы (см. Фазу C). Сырые литералы `1px`/`10px` остались.
- **P3-1** — `popoverSize`/`popoverOffset` → `protected readonly`; остальные template-only мутабельные
  члены остались публичными (часть пишется прямо из спеков → связано с P2-25).
- **P3-12** — ✅ **остаток выполнен в Фазе C**: RTL логические свойства доделаны в `filters.scss`/
  `pipe-date.scss` (плюс шов кнопок — borders/radii, сверх исходного margins-скоупа); `max-height: 404px`
  де-дублирован общим миксином; `400px`/`136px`/`320px` токенизированы.

### ✅ Фазовая ремедиация (Фазы A / B / C — все завершены)

_Изначально — отложенный бэклог с рекомендуемой последовательностью; все три фазы теперь сделаны. Запись ниже._

**Фаза A — архитектура (✅ ЗАВЕРШЕНА 2026-07-08 — по одному пункту, порядок «сначала безопасное»; P1-6,
самый связанный, сделан последним):**

- ✅ **P3-2** (сделано 2026-07-08) защитить `restoreFilterState` от null-нагрузки — no-op вместо
  `structuredClone(null)`-обнуления; добавлен non-vacuous тест (34 filter-bar спека проходят).
- ✅ **P3-6** (сделано 2026-07-08) добавлены интерфейс `KbqFilterBarHost` + токен `KBQ_FILTER_BAR_HOST`;
  pipe-потребители теперь `inject(KBQ_FILTER_BAR_HOST)` (бар предоставляет себя через `useExisting`).
  `KbqFilters` намеренно оставлен на конкретном баре (владеет публичным payload `KbqSaveFilterEvent`).
  Поведение сохранено; 348 тестов проходят; `approve-api` выполнен. См. §3 P3-6.
- ✅ **P2-19** (сделано 2026-07-08) извлечены `KbqTreeSelectPipeBase` (tree-каркас) + `KbqMultiSelectPipeState`
  (composition-хелпер для multi-select-состояния «ромба»); все 4 select-пайпа де-дублированы.
  Build ✓, 348 тестов ✓, `approve-api` ✓. См. §3 P2-19.
- ✅ **P2-21** (сделано 2026-07-08) извлечён `KbqFilterSavePopover` (владеет состоянием + шаблонами +
  логикой save; триггер остаётся на главной кнопке, шаблоны проставляются императивно; `KbqFilters`
  делегирует через тонкий фасад). Build ✓, 348 тестов ✓, `approve-api` ✓. См. §3 P2-21.
- ✅ **P1-6** (сделано 2026-07-08, ломающее API) `filter` основан на приватном `signal` за сохранённым
  accessor-`@Input()`; булевы состояния → `computed()` (`isSaved()` …); Subject `changes` + `merge`-разброс
  **удалены**; 6 прежних подписчиков реагируют через реактивность сигналов/`effect()` (min-width сохраняет
  `delay(0)` через отложенный `setTimeout`); `filter-reset` больше не дёргает `changes.next()`. In-place
  мутации `filter.changed/saved/pipes` → иммутабельные замены (**закрывает ядро P2-20**). Build ✓, 349 тестов
  ✓, `approve-api` ✓ (ломающее: `changes` убран, состояния → `Signal<boolean>`, `addedPipes` → `Signal`),
  eslint/prettier ✓. См. §3 P1-6.
- ✅ **P2-4 / P2-5** (сделано 2026-07-08, ломающее) accessor-ы `filter`/`pipeTemplates` → `model()`/`input()`
  и `kbqPipeState`→`input()` (+ `updateState` свёрнут в effect). Это та самая рябь `.filter()`, которую P1-6
  намеренно избегал — сделано здесь через multi-agent workflow'ы: исчерпывающая **карта ряби** (261 сайт),
  параллельная **миграция специй** (3 файла, ~90 правок) и адверсариальный **review**. `KbqFilters.filter`
  оставлен обычным геттером, чтобы ограничить рябь. Build ✓, 350 тестов ✓, `approve-api` ✓, lint ✓. См. §3 P2-4/P2-5.

**Фаза A полностью завершена** — все архитектурные пункты (P3-2, P3-6, P2-19, P2-21, P1-6, P2-20, P2-4, P2-5)
сделаны. P2-20 тоже **полностью сделан** (см. §3).

**Фаза B — качество тестов (✅ выполнено 2026-07-07 — 344 Jest-теста, без изменения продакшн-кода):**

- ✅ **P2-23** конкретный снапшот `internalSelected` в обоих тестах `onClose` (переход в пустой массив
  после закрытия, non-vacuous).
- ✅ **P2-24** копипаст-набор «Pipe states» теперь один общий хелпер
  (`pipes/pipe-states.spec-helper.ts`, `registerPipeStatesTests`); магические `[0..4]` → именованные дескрипторы.
- ✅ **P2-25** все 10 кастов `(component as any)` заменены типизированными швами
  (`By.directive(T).injector.get(T)` + `getPopoverTrigger`/`getMainButton`/`getFilterActionsButton`).
- ✅ **P2-26** round-trip тест `saveAsNew → error(nameAlreadyExists) → retry` (состязательно проверен:
  падает, если `filterSavedUnsuccessfully` перестаёт показывать ошибку).
- ✅ **P2-27** тесты смены локали + приоритета `externalConfiguration` (состязательно проверены:
  падают, если убрать приоритет).
- ✅ **P3-7** сырые `13`/`27` → `ENTER`/`ESCAPE` из `@koobiq/components/core`.
- ✅ **P3-10 / P3-11** глубокая изоляция `structuredClone` и отложенный путь восстановления фокуса в
  `filterSavedSuccessfully` теперь проверяются.
- ✅ **P2-22 (остаток)** удалён ошибочно размещённый дубль под `describe('onSelect')`.
- ✅ **P3-8** симметричный кейс и кейс «оба null» для `compareByValue` добавлены в оба spec
  (единый `toBe(false)`); компаратор multi-select занулён (`!!o1 && !!o2 && o1.id === o2.id`), поэтому
  `(null, null)` теперь возвращает `false`, как у select (состязательно проверено). Единственный пункт
  Фазы B, затронувший продакшн (1 строка, без изменения API/типов).

**Фаза C — SCSS и i18n (✅ выполнено 2026-07-08 — каждый `.scss` filter-bar скомпилирован в CSS до/после
и сравнён по каждому объявлению; `stylelint` + `styles:build-all` чисто; независимо перепроверено
состязательным проходом из 4 агентов):**

- ✅ **P1-12** все цветовые/фоновые поверхности вынесены в три theme-миксина в `_filter-bar-theme.scss`
  (`kbq-filter-bar-pipe-theme`, `-readonly-theme`, `-filters-theme`), подключаются из layout-SCSS. Наборы
  объявлений скомпилированного CSS **побайтово идентичны** (доказано, а не «на глаз»). Два цвета в
  date-поповере (`.kbq-icon`, `.kbq-calendar`) намеренно оставлены в `pipe-date.scss` — вне перечисленных
  в находке поверхностей и уже управляются theme-миксином датапикера.
- ✅ **P2-29** оверлейная геометрия токенизирована через `panelClass`-scoped custom properties
  (`--kbq-filter-bar-{popover,save-popover,date-period,date-field}-*`); избыточный `!important` на padding
  поповера текстового пайпа убран. **⚠ Поправка:** два других `!important` (padding поповера + height/margins
  `.kbq-filter-bar__separator`) — **несущие, их нельзя убрать**: сепаратор перекрывает собственное правило
  дивайдера `.kbq-divider_paddings` (0,3,0), а padding поповера нужен docs-примеру custom-pipe, который
  переиспользует `.kbq-pipe__popover` с дефолтными paddings (без `!important` — ничья 0,2,0). Оставлены и
  задокументированы на месте. Сырые литералы `1px`/`10px` остались.
- ✅ **P3-12** RTL логические свойства доделаны в `filters.scss`/`pipe-date.scss`; повторяющийся
  `max-height: 404px` де-дублирован общим миксином на всех четырёх select-панелях; `400px`/`136px`/`320px`
  токенизированы. Сделано **сверх** «margins»-скоупа находки: шов кнопок пайпа/фильтров (`border-right/left:
none` + четыре `border-*-radius: unset` → `border-inline-*` / `border-*-*-radius` логические) и
  пропущенный inset `left: 0`, чтобы вся группа кнопок зеркалилась в RTL. Все конверсии LTR-идентичны
  (`inline-start`↔`left` в `horizontal-tb`).
- ✅ **P2-31** задокументировано (не изменено): `KBQ_FILTER_BAR_DEFAULT_CONFIGURATION` сохраняет дефолт
  `ru-RU` (каждый `KBQ_*_DEFAULT_CONFIGURATION` в библиотеке резолвится в `ruRULocaleData`; менять только
  filter-bar — сделать его единственным несогласованным компонентом + поведенческое изменение публичной
  константы). JSDoc теперь указывает, что дефолт русский и что для локализации нужно предоставить
  `KBQ_LOCALE_SERVICE`.
- ⏳ **P3-13** (опционально) не сделано — полагаемся на авто-генерируемую вкладку API, альтернативу, которую
  находка явно допускает.

> **Замечание:** SCSS-изменения Фазы C проверены на **эквивалентность вычисленного CSS в LTR** по-объявленным
> diff каждого `.scss` filter-bar до и после, поэтому существующие baseline Playwright `__screenshots__`
> (закрытое состояние, LTR light/dark) остаются валидными по построению — логические конверсии это чисто
> RTL-улучшения без изменения пикселей в `horizontal-tb`, а RTL-baseline для перезапуска нет. Оставшиеся
> пункты **Фазы A (архитектура)** выше по-прежнему требуют перезапуска Playwright-baseline при их выполнении.

### Поправки к исходному плану (обе подтверждены состязательной перепроверкой)

1. **Исправление P2-10 было опасным.** «Удалить подписку подкласса — база уже диспатчит на
   переопределение» противоречиво. Порядок инициализации полей захватывает **базовый**
   `updateTemplates` в базовой подписке (не трогает `dataSource`); подписка подкласса — единственный
   писатель `dataSource`, её удаление опустошит дерево. Применён верный фикс: сохранить обе, убрать
   дублирующее присвоение.
2. **Провайдера из P2-7 здесь нет.** `kbqDisableLegacyValidationDirectiveProvider()` не экспортируется
   из `@koobiq/components` — это был no-op shim, **удалённый в v20** (v20-схематик его удаляет).
   Поэтому P2-7 сводится к типизации форм.

## 6. Стратегия верификации

- **Утечки (P1-1, P2-2, P2-8):** юнит-тест, создающий и уничтожающий хост/пайп и проверяющий, что у
  исходного Subject нет оставшихся подписчиков (`(subject as any).observers.length === 0`), либо spy,
  что `markForCheck` не вызывается после уничтожения.
- **Доступность (P1-2, P2-17, P2-18):** Playwright + `axe` на `e2e.playwright-spec.ts`; проверить, что
  у каждого интерактивного элемента есть доступное имя и что фокус возвращается к триггеру после
  закрытия поповера на путях из дропдауна/программно.
- **`removePipe(-1)` (P1-9):** новый Jest-тест негативного случая (массив без изменений).
- **Типовые фиксы (P1-3, P1-4, P1-5, P2-6, P2-13):** `node_modules/.bin/tsc` / `eslint`; запустить
  `build:components`, затем `check-api` (изменения public API для переименования P2-15 требуют
  `approve-api` после свежей сборки).
- **Тесты (P1-8, P1-10, P1-11, P2-22..27):** `node_modules/.bin/jest.cmd <spec>` зелёный, и проверить,
  что ранее «пустые» тесты теперь падают при откате кода.
- **SCSS (P1-12, P2-28, P2-29):** `stylelint` + `styles:build-all`; визуальный diff по существующим
  базлайнам Playwright `__screenshots__`.
- Тяжёлые команды запускать **последовательно, не параллельно**, и всегда `build:components` перед
  `check-api`/`approve-api`.

## 7. Приложения

**A. Метод.** Девять измерений (архитектура, стандарты Angular, корректность/баги, доступность,
TypeScript/public-API, core-тесты, pipe-тесты, SCSS/темизация, docs/i18n). Каждое измерение:
независимый агент-искатель, читающий реальные файлы, затем независимый **состязательный
верификатор**, заново открывавший каждый упомянутый файл и пытавшийся опровергнуть утверждение
(CONFIRMED / PLAUSIBLE / FALSE). FALSE-находки удалены; ряд severity понижен верификатором (отмечено
по месту).

**B. Просмотренные файлы.** Весь `packages/components/filter-bar`: `filter-bar.ts`, `filters.ts`
(+`filters.html`), `filter-bar.types.ts`, `filter-reset.ts`, `filter-refresher.ts`,
`filter-bar-button.ts`, `pipe-add.ts`, `pipe.directive.ts`, `filter-bar.module.ts`, `public-api.ts`,
`index.ts`; `pipes/base-pipe.ts`, `pipe-state.ts`, `pipe-button.ts`, `pipe-readonly.ts`,
`pipe-text.ts`, `pipe-select.ts`, `pipe-multi-select.ts`, `pipe-tree-select.ts`,
`pipe-multi-tree-select.ts`, `pipe-date.ts`, `pipe-datetime.ts` (+ их `.html`); все `*.spec.ts`,
`e2e.ts`, `e2e.playwright-spec.ts`; `*.scss` (`filter-bar`, `filters`, `filter-refresher`,
`pipe-add`, `_filter-bar-theme`, `pipes/*`); `*.en.md` / `*.ru.md`.

**C. Легенда severity.** P0 блокер релиза · P1 высокий · P2 желательно исправить · P3 гигиена.
