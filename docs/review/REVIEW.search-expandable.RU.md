# Ревью компонента: `search-expandable`

> Перевод [`REVIEW.search-expandable.md`](./REVIEW.search-expandable.md) на русский язык. ID находок, пути к файлам, имена API и фрагменты кода не переводятся.
> Scope: `packages/components/search-expandable/**` (+ `packages/components-dev/search-expandable`, `packages/docs-examples/components/search-expandable`, перекрёстная проверка v20-схематика миграции) · Коммит `af6e64fe` · 2026-07-04
> Подготовлено многомерным ревью (архитектура, RxJS/жизненный цикл, корректность, a11y, производительность, API/типы, тесты, шаблоны/стили + адверсариальная верификация по исходникам и git-истории). Подтверждена 21 находка (P0×1, P1×5, P2×7, P3×8); 3 первоначальных утверждения скорректированы при проверке. Находки с пометкой **(shared)** живут вне этого пакета и затрагивают другие компоненты.
> Прежние общерепозиторные находки по компоненту (REVIEW.md: `ARCH-16`) разобраны в леджере ниже. Документ — ревью + дорожная карта; исходники не изменяются.

## 1. Резюме

`KbqSearchExpandable` — молодой компактный компонент (класс 296 строк, шаблон 40 строк), сворачивающий поле поиска в кнопку-иконку. Базовая гигиена хорошая: standalone + `OnPush`, DI через `inject()`, объект `host` вместо декораторов, control flow `@if/@else`, `takeUntilDestroyed()` на каждой подписке, `FocusMonitor.focusVia()` для восстановления фокуса (корректный для этого репозитория паттерн keyboard-focus-ring), локализация строк через `KBQ_LOCALE_SERVICE` с токеном переопределения. E2E-скриншоты покрывают оба состояния в светлой/тёмной темах.

Главный риск — **конвейер эмиссии значения**, повреждённый при слиянии старого `KbqFilterSearch` в этот компонент во время апгрейда на Angular 20 (`17bc91dd`). У старого компонента на input был `(keydown.enter)="onEnter()"`; при слиянии сохранились флаг `isEmitValueByEnterEnabled` и `filter()`, подавляющий debounce-эмиссию, но сам обработчик Enter перенесён не был — включение задокументированного флага полностью «заглушает» контрол (SE-BUG-01). Вокруг того же конвейера: `emitValueTimeout` читается один раз в конструкторе до установки инпутов и потому никогда не действует (SE-BUG-02); закрытие поля внутри debounce-окна оставляет устаревший запрос в привязанном `FormControl` (SE-BUG-03); а CVA возвращает программные записи обратно через `onChange`, помечая контрол dirty и дублируя эмиссии `valueChanges` (SE-BUG-04).

Второй риск — **доступность на пути по умолчанию**. В свёрнутом состоянии рендерится кнопка-иконка без доступного имени (падение правила axe `button-name`, WCAG 4.1.2) — блокер релиза при правиле репозитория «MUST pass all AXE checks» (SE-A11Y-01). Контрол закрытия в развёрнутом состоянии — фокусируемый `<i kbq-icon-button>` без `role`, без имени и с активацией по Enter, но не по Space (SE-A11Y-02); часть этого пробела унаследована от самого `KbqIconButton` **(shared)**.

Остальное — модернизационный долг известной формы: оставленные миграцией TODO (`@Input`-аксессоры, `@ViewChildren` рядом с `viewChild()`, `isOpened`, в который компонент пишет сам, вместо `model()`), публичный мутабельный `BehaviorSubject` и `any`/`unknown`, протекающие в опубликованную поверхность API. Тестов приличное количество (25 спеков), но они не покрывают ровно те пути, где живут все четыре P1-бага.

## 2. Оценочная карта

| Измерение | Оценка | P0 | P1 | Комментарий |
|---|---|---|---|---|
| Архитектура и конвенции | C+ | 0 | 0 | Крепкая база (standalone, OnPush, inject); смешение decorator/signal API и гибрид «CVA + прямое управление контролом» |
| RxJS и жизненный цикл | B− | 0 | 0 | `takeUntilDestroyed` везде; но input-сигнал читается в конструкторе (SE-BUG-02, учтён в «Корректности»), дублируются подписки FocusMonitor |
| Корректность и баги | D | 0 | 4 | Режим Enter не работает, конфиг debounce мёртв, гонка при очистке, CVA-эхо — всё в одном конвейере |
| Доступность | D | 1 | 1 | Нет доступного имени у контрола по умолчанию; у иконки закрытия нет семантики кнопки; управление фокусом при этом хорошее |
| Производительность | A− | 0 | 0 | Крошечная поверхность, OnPush, debounce ввода; единственный след — дубли `valueChanges` из SE-BUG-04 |
| Публичный API и типы | C | 0 | 0 | `any`/`unknown` в публикуемых d.ts, `$any()` в шаблоне, публичный мутабельный `BehaviorSubject`, задокументированный, но неработающий флаг |
| Тесты | C+ | 0 | 0 | 25 спеков покрывают состояния/локаль/базовый CVA; ноль покрытия режима Enter, debounce, восстановления фокуса и набора текста через DOM |
| Шаблоны и стили | B | 0 | 0 | Современный control flow, минимальный SCSS; захардкоженные имена иконок, нет файлов токенов/темы (разрыв с конвенцией, в основном осознанное делегирование) |

## 3. Приоритизированные находки (дедуплицированы, верифицированы)

### P0 — Блокеры релиза

**SE-A11Y-01 · У свёрнутой кнопки поиска нет доступного имени** — `packages/components/search-expandable/search-expandable.html:2-15`.
Рендер по умолчанию — `<button kbq-button>`, содержащий только `<i kbq-icon="kbq-magnifying-glass_16">`. Нет ни `aria-label`, ни визуально скрытого текста, а тултип (`[kbqTooltip]="tooltipText"`, `:6`) в лучшем случае даёт описание при hover/focus, но не имя. Скринридеры объявляют безымянную кнопку; axe заваливает правило `button-name` на состоянии компонента по умолчанию (WCAG 4.1.2). AGENTS.md репозитория делает чистоту AXE жёстким требованием, так что это блокирует релиз. Исправление почти бесплатное — локализованная строка уже существует.
**Fix:** привязать на кнопке `[attr.aria-label]="tooltipText"` (локализуется через `KBQ_LOCALE_SERVICE`/токен конфигурации — тот же источник, что и у тултипа). Добавить регрессионный спек axe/`button-name` (в связке с SE-TEST-01).

### P1 — Высокий приоритет

**SE-BUG-01 · `isEmitValueByEnterEnabled` никогда не эмитит — обработчик Enter потерян при слиянии в v20** — `packages/components/search-expandable/search-expandable.ts:185`, шаблон `search-expandable.html:20-30`.
Конвейер в конструкторе подавляет debounce-эмиссию при включённом флаге (`filter(() => !this.isEmitValueByEnterEnabled())`), но единственные клавиатурные обработчики в шаблоне — `(keyup.escape)` на input и `(keyup.enter)` на *иконке закрытия*. Ничто не эмитит значение по Enter. Git-археология подтверждает регрессию: у до-v20 `KbqFilterSearch` (`git show 17bc91dd~1:packages/components/filter-bar/filter-search.ts`) был `(keydown.enter)="onEnter()"` → `onSearch.emit(searchControl.value)`; флаг и `filter()` пережили слияние в `KbqSearchExpandable`, обработчик — нет. Grep по всему репозиторию не находит внешней обвязки Enter, а в спеке ноль тестов на этот input. Итог: включение задокументированного API полностью «заглушает» контрол (кроме очистки при закрытии), а потребители, мигрировавшие с `KbqFilterSearch`, не могут восстановить прежнее поведение.
**Fix:** добавить на input `(keydown.enter)="onEnterKey()"`, где `onEnterKey()` вызывает `emitValue(this.value.getValue(), true)` при включённом `isEmitValueByEnterEnabled()`. Сначала написать падающий спек (SE-TEST-01).

**SE-BUG-02 · Инпут `emitValueTimeout` не имеет эффекта — сигнал читается один раз в конструкторе** — `packages/components/search-expandable/search-expandable.ts:186`.
`debounceTime(this.emitValueTimeout())` вычисляет input-сигнал во время сборки конвейера в конструкторе, т.е. до того, как Angular установит какие-либо инпуты; оператор навсегда захватывает дефолтные `200`. Любой пользовательский `[emitValueTimeout]` молча игнорируется. Старый `KbqFilterSearch` собирал тот же конвейер в `ngOnInit` (после установки инпутов) — потому и работал.
**Fix:** сделать debounce реактивным — `debounce(() => timer(this.emitValueTimeout()))` — либо перенести сборку конвейера в `ngOnInit`. Добавить спек, проверяющий, что недефолтный таймаут учитывается.

**SE-BUG-03 · Закрытие внутри debounce-окна оставляет устаревший запрос в привязанном контроле** — `packages/components/search-expandable/search-expandable.ts:259-265` + `:282-287`.
`toggle()` «очищает» только внутренний subject (`this.value.next(defaultValue)`); привязанный контрол очищается косвенно — когда debounce-конвейер отражает `''` через `onChange`. Гвард `lastEmittedValue` разрывает эту цепочку: наберите `abc` и закройте до тика в 200 мс — `debounceTime` проглатывает `abc` и доставляет только `''`, а `emitValue('')` сравнивает `'' !== lastEmittedValue ('')` → false → пропуск. С `[formControl]` контрол (уже держащий `abc` через внутреннюю привязку, см. SE-BUG-04) навсегда сохраняет устаревший запрос, пока UI показывает свёрнутый «пустой» поиск; повторное открытие показывает «призрачный» текст, а фильтрация на стороне потребителя остаётся активной.
**Fix:** очищать контрол явно в `toggle()` — вызывать `emitValue(defaultValue, true)` безусловно (а не только под `isEmitValueByEnterEnabled()`, `:262-264`) либо сбрасывать `ngControl.control` напрямую. Спек: набрать → закрыть внутри debounce-окна → проверить, что значение контрола `''`.

**SE-BUG-04 · CVA-эхо: программные записи повторно входят в `onChange`; с `[formControl]` debounce обходится, а `valueChanges` срабатывает дважды** — `packages/components/search-expandable/search-expandable.ts:174`, `:182-189`, `:245-247`; шаблон `search-expandable.html:27`.
Сталкиваются два проектных решения. (1) Внутренний `<input>` привязан к *тому же экземпляру контрола*, который потребитель привязал к хосту (`[formControl]="$any(ngControl?.control)"`), поэтому каждое нажатие клавиши немедленно обновляет контрол потребителя — 200 мс debounce вообще не применяется к потребителям reactive forms. (2) Конвейер `ngControl.valueChanges → value → debounceTime → onChange` затем доставляет то же значение повторно: путь `onChange` у `FormControlDirective` вызывает `markAsDirty()` + `setValue()`, что даёт вторую эмиссию `valueChanges` на каждый «устоявшийся» ввод и — хуже — превращает программные `setValue()`/`writeValue()` в «пользовательскую» правку (контрол становится dirty через ~200 мс после программной записи). Это нарушает контракт CVA (`writeValue` не должен возвращаться в `onChange`). Для потребителей `ngModel` debounce при этом работает — поведение различается в зависимости от способа привязки.
**Fix:** развязать view-контрол и контрол потребителя — использовать внутренний `FormControl` для input, питать конвейер от него, а CVA оставить единственным мостом (`writeValue` → внутренний контрол с `emitEvent: false`; debounce-изменения внутреннего → `onChange`). Это заодно убирает каст `$any()` (SE-ARCH-01) и делает debounce настоящим для обоих способов привязки.

**SE-A11Y-02 · Контрол закрытия — фокусируемый `<i>` без семантики кнопки; Enter работает, Space — нет** — `packages/components/search-expandable/search-expandable.html:32-38`; **(shared)** `packages/components/icon/icon-button.component.ts:24-32`.
`KbqIconButton` делает элемент фокусируемым (`tabindex=0`), но не добавляет ни `role="button"`, ни доступного имени, ни клавиатурной активации — шаблон компенсирует только `(keyup.enter)`. Пользователь клавиатуры, дотабавшись до иконки закрытия, не может активировать её Space (поведение нативной кнопки), а скринридер объявляет безымянный фокусируемый элемент без роли (WCAG 2.1.1, 4.1.2). Изначально обработчик выглядел случайным дублем Escape; проверка показала: это намеренная, но неполная поддержка клавиатуры.
**Fix:** локально — добавить `role="button"`, локализованный `aria-label` (например, новый ключ `clear`/`close` в секции локали `searchExpandable`) и обработку `(keydown.space)` (с подавлением скролла по умолчанию); либо заменить суффикс настоящей `<button kbq-button>`. Отсутствующую семантику кнопки у `KbqIconButton` завести как shared-задачу (см. «Смежные флаги»).

### P2 — Стоит исправить

**SE-ARCH-01 · Шаблон лезет в `ngControl.control` через `$any()`** — `search-expandable.html:27`, `search-expandable.ts:62`. Внутренняя привязка input одновременно отключает проверку типов шаблона и создаёт топологию «двух писателей», стоящую за SE-BUG-04. Решается рефакторингом на внутренний контрол (fix SE-BUG-04); до тех пор типизированный геттер (`get control(): FormControl`) хотя бы убрал бы `$any()`.

**SE-ARCH-02 · `isOpened` — обычный `@Input`, который компонент сам мутирует** — `search-expandable.ts:88-90`, `:257`. Миграционный TODO («application code writes to the input») отмечает ровно тот случай, для которого существует `model()` Angular. `model<boolean>(false)` + семантика `isOpenedChange` получаются бесплатно (`kbq-search-expandable [(isOpened)]`), а привязка host-класса становится сигнальной.

**SE-ARCH-03 · Смешение view-query API: `@ViewChildren`+`QueryList` для одиночных условных детей рядом с `viewChild()`** — `search-expandable.ts:76-78`, `:195-221`. Подписки на `QueryList.changes` существуют только чтобы поймать переключение `@if` и сфокусировать новый элемент. Сигнальные запросы выражают это напрямую: `viewChild(KbqInput)` / `viewChild(KbqButton)` + `effect()`. Запросы оставить опциональными и охранять чтение (известный питфолл репозитория: слишком строгие `.required` view-запросы кидают NG0951 в prod).

**SE-ARCH-04 · `value: BehaviorSubject` как публичное мутабельное состояние** — `search-expandable.ts:83`. Прежняя общерепозиторная находка `ARCH-16` (всё ещё открыта, см. леджер). Это публичный API (`search-expandable.api.md:81`), спек пишет в него напрямую, и он дублирует состояние контрола. Должен стать внутренним сигналом/приватным subject с readonly-доступом; согласовать с рефакторингом SE-BUG-04, поскольку конвейер питается от него.

**SE-API-01 · `any`/`unknown` протекают в публикуемый API** — `search-expandable.ts:80` (`configuration;` — неявный any), `:161-163`; публикуется как `configuration: any`, `localeData: any` (`tools/public_api_guard/components/search-expandable.api.md:39`, `:53`) и `InjectionToken<unknown>` (`:26`). Определить `interface KbqSearchExpandableConfiguration { tooltip: string; placeholder: string }`, типизировать токен `InjectionToken<KbqSearchExpandableConfiguration>` и поля `configuration`/`localeData`. Требует `yarn run build:components` + `approve-api`.

**SE-TEST-01 · Четыре P1-бага живут ровно в непокрытых путях** — `search-expandable.spec.ts` (372 строки, 25 спеков). Ни один спек не трогает `isEmitValueByEnterEnabled`, `emitValueTimeout`, закрытие-внутри-debounce, dirty-состояние после программного `setValue`, восстановление фокуса после toggle или токен внешней конфигурации; ни один спек не набирает текст в DOM-input (вместо этого тесты дёргают внутренности `component.value.next()`, `:97`). Добавить поведенческие спеки (реальные события `input`/`keydown`) на каждую находку P0/P1 — они же станут регрессионными воротами Фазы 1.

**SE-DOC-01 · Документация не упоминает половину публичного API** — `search-expandable.en.md`/`.ru.md` (по 8 строк), `examples.search-expandable.en.md`/`.ru.md` (пустые). `isEmitValueByEnterEnabled`, `emitValueTimeout`, `isOpenedChange`, `tooltipText`, `KBQ_SEARCH_EXPANDABLE_CONFIGURATION` и обязательность form-привязки (конструктор кидает без `formControl`/`ngModel`, `search-expandable.ts:168-170`) — всё не задокументировано. Добавить секцию API/использования и пример с режимом Enter после фикса SE-BUG-01.

### P3 — Желательно / гигиена

- **SE-BUG-05 · Дублирующиеся подписки FocusMonitor** — `search-expandable.ts:131-139`, `:192-193`, `:289-291`. Angular ≥14 всегда вызывает `setDisabledState(false)` при инициализации, поэтому `runFocusMonitor()` запускается из сеттера `disabled` *и* из `ngAfterViewInit`, и ещё раз при каждом переключении disabled→enabled, наслаивая подписки на один и тот же элемент (сегодня безвредно — они лишь присваивают `lastFocusOrigin`, — но хрупко). **Fix:** подписываться один раз, закрыться флагом или сделать enable/disable идемпотентными.
- **SE-BUG-06 · `onChange` объявлен, но не инициализирован** — `search-expandable.ts:229`. Эмиссия конвейера до `registerOnChange` бросила бы `TypeError`; debounce делает это маловероятным, но не невозможным. **Fix:** инициализировать no-op, как `onTouch` (`:232`).
- **SE-A11Y-03 · Доступное имя input держится только на `placeholder`** — `search-expandable.html:26`. Сегодня axe проходит, но placeholder-как-имя хрупок (исчезает при вводе, низкий контраст). **Fix:** добавить `[attr.aria-label]="placeholder"`.
- **SE-A11Y-04 · У input нет поисковой семантики** — `search-expandable.html:20-30`. Рассмотреть компромиссы `type="search"`/`inputmode` (`type="search"` добавляет нативную кнопку очистки, конфликтующую с кастомным суффиксом — при внедрении спрятать её через CSS) либо лендмарк `role="search"` на развёрнутой обёртке.
- **SE-STYLE-01 · Нет `search-expandable-tokens.scss` / `_search-expandable-theme.scss`** — корень пакета против конвенции `button`/`icon-button`. Визуальная тема осознанно делегирована `kbq-button`/`kbq-form-field`, так что это гигиена, а не дефект; но переопределения размеров суффикса в `search-expandable.scss:11-21` лучше жили бы за токенами компонента.
- **SE-STYLE-02 · Имена иконок захардкожены дважды** — `search-expandable.html:14`, `:18`, `:34` (`kbq-magnifying-glass_16`, `kbq-circle-xmark_16`). Рассмотреть расширение токена конфигурации, если когда-нибудь понадобится кастомизация иконок; как минимум — дедуплицировать литерал лупы.
- **SE-TEST-02 · E2E — только скриншоты** — `e2e.playwright-spec.ts` (один тест, light/dark обоих состояний). Нет interaction-сценария (toggle → ввод → Escape/закрытие → фокус восстановлен) и нет axe-скана. Добавить один interaction-тест после Фазы 2.
- **SE-ARCH-05 · Захардкоженный `name="value"` на input** — `search-expandable.html:22`. Протекает generic-имя контрола в родительскую форму/эвристики автозаполнения; убрать или выводить из инпута.

### Леджер прежних находок

| Общерепозиторный ID (REVIEW.md) | Диспозиция | Сопоставлено с |
|---|---|---|
| ARCH-16 (P3) · `@Input`-аксессоры + `BehaviorSubject` там, где подходят `input()`/сигнал — `search-expandable.ts:83` | Всё ещё открыта; охват уточнён и поднят до P2 (публичный мутабельный API + связанность со спеком) | SE-ARCH-02, SE-ARCH-03, SE-ARCH-04 |

### Скорректировано при верификации

- **`ViewEncapsulation.None` — не дефект**: это общерепозиторная конвенция для всех компонентов (глобальные BEM-классы + токены); первоначальный флаг снят.
- **`(keyup.enter)` на иконке закрытия — не случайный дубль Escape**: это намеренная (неполная) клавиатурная активация не-кнопочного элемента; переквалифицировано в SE-A11Y-02.
- **Русская конфигурация по умолчанию (`KBQ_SEARCH_EXPANDABLE_DEFAULT_CONFIGURATION = ruRULocaleData.searchExpandable`, `search-expandable.ts:33`) — не баг компонента**: тот же паттерн в 6 пакетах (app-switcher, datepicker, notification-center, filter-bar, navbar); перенесено в «Смежные флаги».

### Смежные флаги (вне охвата, отдельные тикеты)

- **(shared) У `KbqIconButton` нет семантики кнопки** — `packages/components/icon/icon-button.component.ts:24-32`: фокусируем через `tabindex`, но без `role`, без хука для имени, без активации Enter/Space; каждый потребитель вынужден заново реализовывать клавиатурную поддержку (search-expandable сделал это частично). Кандидат на апгрейд `role="button"` + обработка keydown в пакете icon.
- **(shared) ru-RU как фолбэк без locale-сервиса** — приложения без `KbqLocaleService` получают русские тултипы/плейсхолдеры в 6 компонентах. Осознанный продуктовый дефолт, но заслуживает явной пометки в документации или обсуждения фолбэка en-US.

## 4. Рекомендуемые фазы исправлений

**Фаза 1 — Корректность конвейера значения (сначала регрессионные спеки).**
IDs: SE-BUG-01, SE-BUG-02, SE-BUG-03, SE-BUG-04 + SE-TEST-01 (падающие спеки пишутся до фиксов). Одно целостное изменение: внутренний `FormControl` для input, конвейер пересобран от него с реактивным debounce, явная принудительная очистка в `toggle()`, восстановленный обработчик Enter. Фикс топологии SE-BUG-04 делает фиксы 01/02/03 маленькими; раздельная поставка перелопатила бы одни и те же 40 строк четыре раза.

**Фаза 2 — Блокеры доступности.**
IDs: SE-A11Y-01 (P0), SE-A11Y-02, опционально SE-A11Y-03/04; плюс регрессионный axe-спек. Независима от Фазы 1; может уйти первой, если поджимает релиз (SE-A11Y-01 — единственный P0). Новый ключ локали для метки контрола закрытия затрагивает `packages/components/core/locales/*` (все 5 локалей).

**Фаза 3 — Модернизация API и архитектуры.**
IDs: SE-ARCH-01..05, SE-API-01. `model()` для `isOpened`, сигнальные view-запросы + `effect()` для передачи фокуса, типизированный интерфейс/токен конфигурации, депубликация `value`. Изменения публичного API: `yarn run build:components`, затем `yarn run approve-api` (последовательно); ревью breaking change по видимости `value`. Делать после Фазы 1 — те же файлы, и рефакторинг на внутренний контрол приземляется там.

**Фаза 4 — Достройка тестов и документации.**
IDs: SE-TEST-02, SE-DOC-01. Playwright-сценарий взаимодействия (toggle → ввод → закрытие → фокус восстановлен) + документация полной поверхности инпутов/аутпутов/токена с примером режима Enter (`yarn build:docs-examples-module` после добавления примеров).

**Фаза 5 — Гигиена стилей.** Опционально.
IDs: SE-STYLE-01, SE-STYLE-02. Каркас токенов/темы и дедупликация имён иконок; видимых пользователю изменений не ожидается (защищено существующими скриншотами).

## 5. Стратегия верификации

Общие ворота (последовательно, никогда параллельно):
- `npx jest packages/components/search-expandable/search-expandable.spec.ts` — юнит-набор зелёный; новые поведенческие спеки используют реальные DOM-события, а не `component.value.next()`.
- `npx playwright test packages/components/search-expandable/e2e.playwright-spec.ts` — скриншоты неизменны для Фаз 1–4 (визуальной дельты не ожидается); обновлять только в Фазе 5, если токены сдвинут рендер.
- `yarn run build:components`, затем `yarn run check-api` — API guard; `approve-api` — только для намеренных изменений поверхности в Фазе 3.
- `yarn run eslint` / `yarn run stylelint` по затронутым файлам.

Проверки по фазам:
- **Фаза 1:** при `isEmitValueByEnterEnabled` набор текста не эмитит ничего до Enter, затем ровно один раз; `[emitValueTimeout]="500"` задерживает эмиссию на ~500 мс (`fakeAsync` + `tick`); «набрать и закрыть внутри окна» оставляет значение контрола `''`; программный `setValue()` оставляет контрол pristine и порождает ровно одну эмиссию `valueChanges`; `ngModel` и `formControl` ведут себя одинаково.
- **Фаза 2:** axe-скан свёрнутого и развёрнутого состояний даёт ноль нарушений; контрол закрытия активируется и Enter, **и** Space; у кнопки, input и контрола закрытия есть имя для скринридера.
- **Фаза 3:** двусторонняя привязка `[(isOpened)]` работает; `tools/public_api_guard/components/search-expandable.api.md` показывает типизированные `configuration`/токен и отсутствие `any`; нет NG0951 от чтения view-запросов (запросы остаются опциональными).
- **Фаза 4:** сборка документации рендерит новый пример (`yarn run docs:build`); Playwright-тест взаимодействия проходит в light/dark.

## Приложение A — Методология ревью

Исследовательский проход по всем 24 файлам пакета/dev/примеров плюс зависимость icon-button и `core/locales`; формат откалиброван по `REVIEW.select.md`/`REVIEW.popover.md`/`REVIEW.notification-center.md`. Каждая кандидатная находка адверсариально перепроверена по исходникам; три скорректированы (см. §3). Исторические утверждения проверены через `git log --follow` и `git show 17bc91dd~1:packages/components/filter-bar/filter-search.ts` (обработчик Enter до слияния), а также по карте переименований v20-схематика (`packages/schematics/src/migrations/v20-upgrade/data.ts:191-192` — только переименование тега, без миграции атрибутов). Публикуемый API сверен с `tools/public_api_guard/components/search-expandable.api.md`.

## Приложение B — Проверенные файлы

`packages/components/search-expandable/`: `search-expandable.ts` (296), `search-expandable.html` (40), `search-expandable.scss` (21), `search-expandable.module.ts`, `public-api.ts`, `index.ts`, `ng-package.json`, `search-expandable.spec.ts` (372), `e2e.ts`, `e2e.playwright-spec.ts`, `search-expandable.en.md`, `search-expandable.ru.md`, `examples.search-expandable.en.md`, `examples.search-expandable.ru.md`, `__screenshots__/01-{light,dark}.png`.
`packages/components-dev/search-expandable/`: `module.ts`, `template.html`, `main.ts`. `packages/docs-examples/components/search-expandable/`: `index.ts`, оба примера.
Перекрёстно проверены: `packages/components/icon/icon-button.component.ts`, `packages/components/core/locales/*.ts` (секции `searchExpandable`), `packages/components/filter-bar/filter-bar.ts` (потребитель), `packages/schematics/src/migrations/v20-upgrade/data.ts`, `tools/public_api_guard/components/search-expandable.api.md`, git-история пакета и удалённого `filter-bar/filter-search.ts`.
