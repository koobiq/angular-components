# Ревью компонента: `split-button`

> Область: `packages/components/split-button` · Коммит `af6e64fe` · 2026-07-04
> Подготовлено многомерным ревью (параллельные исследовательские проходы + ручная адверсариальная верификация каждой находки по исходникам). Подтверждено 19 находок (P0×1, P1×2, P2×8, P3×8); 2 кандидата опровергнуты при верификации (см. Приложение A).

---

## 1. Резюме

- `KbqSplitButton` — маленький, сфокусированный композит (174 строки): стилизует две спроецированные `KbqButton` как единый контрол и подключает опциональный `KbqDropdownTrigger`. Базовая логика проброса (style/color/disabled → вложенные кнопки) корректна и покрыта 27 зелёными Jest-кейсами (8.9 с, всё проходит на `af6e64fe`).
- **Блокер релиза — доступность.** Ни `KbqSplitButton`, ни лежащий в основе `KbqDropdownTrigger` не выставляют `aria-haspopup`/`aria-expanded`/`aria-controls` (во всём пакете `dropdown` нет ни одного ARIA-атрибута), а каждый поставляемый пример — доки, e2e, юнит-фикстуры — использует icon-only кнопку меню без доступного имени. Скринридер объявляет безымянную кнопку, не давая понять, что она открывает меню (WCAG 4.1.2, 2.4.6). Исправление разделяется с пакетом `dropdown`.
- **Жизненный цикл — самое слабое место кода.** Единственная RxJS-подписка компонента (`buttons.changes`) никогда не отписывается, а 50-мс `setTimeout` и переживает уничтожение компонента, и падает с `TypeError`, когда у хоста нет client rects (скрытая вкладка, `display: none`), потому что `getClientRects()[0]` деструктурируется без проверки.
- **Публичный API несёт легаси-долг.** Три accessor-инпута (`kbqStyle`, `color`, `disabled`) с устаревшими TODO «Skipped for migration» соседствуют с одним signal-инпутом (`panelAutoWidth`); getter и setter `kbqStyle` асимметричны по типам (записываем `'outline'`, читаем `'kbq-button_outline'`); переопределение `color` молча отключает сброс к `defaultColor`, который предоставляет базовый `KbqColorDirective`.
- **Тесты хорошо покрывают статику и совсем не покрывают динамику.** Все 27 юнит-кейсов работают со статическими шаблонами; единственный реактивный путь компонента (`buttons.changes`), очистка при destroy и доступность не покрыты вовсе. Playwright даёт 4 скриншота в 3 тестах, тёмная тема — только в одном.
- Настоящие сильные стороны, которые стоит сохранить: `OnPush`, host-объект вместо `@HostBinding`, standalone-компонент с NgModule-обёрткой для легаси-потребителей, полностью токенизированный SCSS без хардкода цветов.

## 2. Оценочная карта

| Измерение | Оценка | P0 | P1 | Комментарий |
|---|---|---|---|---|
| Архитектура и конвенции | C+ | 0 | 0 | Мёртвый второй слот `<ng-content>`; смешанный API signal/accessor-инпутов с устаревшими TODO миграции; декораторный content-запрос рядом с signal-запросом. |
| RxJS и жизненный цикл | D | 0 | 1 | Единственная подписка компонента течёт; неотменяемый `setTimeout` срабатывает после destroy; нигде нет `DestroyRef`/`OnDestroy`. |
| Корректность | C+ | 0 | 1 | Незащищённый деструктуринг `getClientRects()[0]` бросает исключение на скрытом хосте; валидация контента выполняется после (а не до) update-вызовов. |
| Доступность | D | 1 | 0 | Нет popup-семантики и доступного имени у триггера меню (совместно с `dropdown`); нет `role="group"`; нет a11y-тестов при общем требовании AXE в репозитории. |
| Производительность | B+ | 0 | 0 | Крошечный компонент, `OnPush`; незначительный churn classList на каждом `buttons.changes` несущественен. |
| Публичный API и типы | C+ | 0 | 0 | Асимметрия get/set у `kbqStyle` ломает round-trip; переопределение `color` отменяет семантику сброса базового класса; конструктор дублирует механизм `defaultColor`. |
| Тесты | B− | 0 | 0 | 27 зелёных кейсов с хорошим покрытием статики; нулевое покрытие `buttons.changes`, очистки при destroy, ARIA, использования атрибутного селектора. |
| Шаблоны и стили | B | 0 | 0 | Токенизированный SCSS, аккуратные селекторы состояний; дублирующийся слот проекции в шаблоне; смешение `:before`/`::before` в файле темы. |

## 3. Приоритизированные находки (дедуплицированы, верифицированы)

### P0 — Блокеры релиза

**SPB-A11Y-01 · У триггера меню нет popup-семантики и доступного имени (совместно с `dropdown`)** — `packages/components/dropdown/dropdown-trigger.directive.ts:108-116`, `packages/docs-examples/components/split-button/split-button-overview/split-button-overview-example.ts:21-23`.
Host-объект `KbqDropdownTrigger` задаёт только `class`, `[class.kbq-pressed]` и обработчики мыши/клавиатуры — ни `aria-haspopup`, ни `aria-expanded`, ни `aria-controls`; grep по всему пакету `dropdown` не находит ни одного ARIA-атрибута. Вдобавок каждый поставляемый пример split-button (обзор в доках, e2e-компонент, юнит-фикстуры) рендерит триггер меню как `<button kbq-button><i kbq-icon="kbq-chevron-down-s_16"></i></button>` — icon-only кнопку без `aria-label` и без визуально скрытого текста. Пользователь скринридера слышит безымянную кнопку и не может узнать, что она открывает меню и открыто ли оно (WCAG 4.1.2 Name/Role/Value, 2.4.6 Headings and Labels). Собственный AGENTS.md репозитория требует прохождения AXE и WCAG AA.
**Fix:** в `KbqDropdownTrigger` добавить host-биндинги `'[attr.aria-haspopup]': '"menu"'`, `'[attr.aria-expanded]': 'opened'` и `[attr.aria-controls]` на id панели, пока она открыта (это чинит сразу всех потребителей dropdown, а не только split-button). В доках и всех примерах split-button добавить `aria-label` на icon-only триггер (например, `aria-label="Дополнительные действия"`); задокументировать как обязательное для icon-only триггеров. Связано с SPB-DOC-01 и SPB-TEST-02.

### P1 — Высокий приоритет

**SPB-BUG-01 · Подписка на `buttons.changes` никогда не отписывается** — `packages/components/split-button/split-button.ts:120-125`.
`ngAfterContentInit` подписывается на `this.buttons.changes.pipe(delay(0))` без `takeUntilDestroyed`, без сохранённой `Subscription`, и класс вообще не реализует destroy-хук. Каждый уничтоженный экземпляр `KbqSplitButton` оставляет живого подписчика; `delay(0)` вдобавок переносит эмиссии в очередь макрозадач, так что уведомление может выполнить update-колбэки уже *после* уничтожения компонента, трогая отсоединённый DOM через `updateClasses()`.
**Fix:** заинжектить `DestroyRef` (`private readonly destroyRef = inject(DestroyRef)`) и добавить `takeUntilDestroyed(this.destroyRef)` перед `subscribe` (важно: `ngAfterContentInit` — не injection context, поэтому форма `takeUntilDestroyed()` без параметра там не сработает). Добавить регрессионный тест destroy-пути (см. SPB-TEST-01).

**SPB-BUG-02 · Неотменяемый 50-мс таймер разыменовывает `getClientRects()[0]` без проверки** — `packages/components/split-button/split-button.ts:161-171`.
При установленном `panelAutoWidth` метод `updateDropdownParams` планирует `setTimeout(..., 50)` и внутри деструктурирует `const { width } = this.nativeElement.getClientRects()[0]`. Два дефекта: (a) id таймера нигде не сохраняется и не очищается, поэтому колбэк срабатывает после destroy (и перевзводится на каждой эмиссии `buttons.changes`); (b) `getClientRects()` возвращает **пустой** `DOMRectList`, когда у элемента нет layout-боксов — предок с `display: none`, отсоединённый узел после destroy, схлопнутый контейнер — тогда `[0]` — это `undefined`, и деструктуринг бросает `TypeError: Cannot destructure property 'width' of undefined`. Юнит-тест маскирует это, мокая `getClientRects` всегда возвращать rect (`split-button.spec.ts:304`).
**Fix:** заменить сырой таймер на `afterNextRender` (привязан к инжектору, самоуничтожается) или сохранять id и чистить через `DestroyRef.onDestroy`; читать `getBoundingClientRect().width` (никогда не пустой) или проверять `rects.length` перед деструктурингом; пропускать обновление при нулевой ширине. Добавить регрессионный тест со скрытым хостом.

### P2 — Стоит исправить

**SPB-ARCH-01 · Дублирующийся `<ng-content select="[kbq-button]" />` — второй слот мёртв** — `packages/components/split-button/split-button.ts:20-24`.
Инлайн-шаблон объявляет один и тот же селектор дважды. Angular распределяет каждый подходящий проецируемый узел в **первый** совпавший слот, поэтому второй `<ng-content>` никогда ничего не получает; он лишь вводит сопровождающих в заблуждение, будто существует два отдельных слота (например, по одному на кнопку). На runtime это не влияет — это мёртвый код шаблона в самом сердце компонента.
**Fix:** свернуть до одного `<ng-content select="[kbq-button]" />`. Если исходное намерение было «ровно две кнопки» — валидировать через уже существующий запрос `buttons` (предупреждение при `buttons.length > 2`), а не через слоты проекции.

**SPB-BUG-03 · Валидация контента выполняется после update-вызовов и бросает синхронно** — `packages/components/split-button/split-button.ts:109-118`.
`ngAfterContentInit` сначала выполняет все пять `update*`-вызовов на потенциально пустом списке `buttons` и только потом бросает `kbq-split-button must contain at least one button`. Апдейты молча превращаются в no-op, затем throw прерывает change detection посреди цикла — ошибка всплывает как необработанное исключение CD, которое трудно проследить до проблемного шаблона (юнит-тест в `split-button.spec.ts:46-50` подтверждает, что throw вылетает из `detectChanges()`).
**Fix:** перенести проверку в первую строку хука. Рассмотреть понижение до `console.error`/throw только в dev-режиме, чтобы неправильно сконфигурированный шаблон деградировал, а не убивал весь проход CD в проде.

**SPB-API-01 · Переопределение `color` молча отключает сброс к значению по умолчанию** — `packages/components/split-button/split-button.ts:71-77`, база: `packages/components/core/common-behaviors/color.ts:100-117`.
Setter базового `KbqColorDirective` маппит falsy-значение в `this.defaultColor` (явная поддержка сброса). Переопределение в split-button начинается с `if (!value) return;`, так что `[color]=""` или программный сброс проглатываются — компонент навсегда сохраняет предыдущий цвет (юнит-тест даже закрепляет это поведение: `should not update color when an empty value is set`, `split-button.spec.ts:162-172`). При этом конструктор присваивает `this.color = KbqComponentColors.ContrastFade` вместо использования поля `defaultColor`, созданного ровно для этого.
**Fix:** задать `this.defaultColor = KbqComponentColors.ContrastFade` и удалить ранний return, делегировав обработку falsy базовому setter; сохранить проброс `updateColor(...)`. Перенацелить закрепляющий юнит-тест на исправленную семантику.

**SPB-API-02 · Getter и setter `kbqStyle` асимметричны по типам; getter по совместительству — поставщик host-класса** — `packages/components/split-button/split-button.ts:50-59`, host: `split-button.ts:30`.
Setter принимает «сырой» стиль (`'outline'` / `KbqButtonStyles.Outline`), а getter возвращает префиксованный CSS-класс (`'kbq-button_outline'`), потому что host-биндинг `'[class]': 'kbqStyle'` использует его для селекторов темы (`_split-button-theme.scss` матчит `.kbq-split-button.kbq-button_filled...`). Round-trip ломается: `sb.kbqStyle = sb.kbqStyle` даёт класс `kbq-button_kbq-button_outline`. Объявленный тип getter (`string`) тоже скрывает контракт от потребителей.
**Fix:** сделать инпут симметричным (getter возвращает то, что принял setter) и вынести вычисление класса в отдельный protected-getter для host-биндинга (например, `protected get hostStyleClass() { return `kbq-button_${this._kbqStyle}`; }`). Это изменение, видимое в API, — провести через `yarn run check-api`/`approve-api` в Фазе 3.

**SPB-A11Y-02 · Хост не выставляет семантику группировки** — `packages/components/split-button/split-button.ts:28-34`.
Хост — просто стилизованный контейнер `<kbq-split-button>`: две соседние кнопки без программной связи. Вспомогательные технологии воспринимают их как две несвязанные кнопки; визуальный разделитель — CSS `::before` (корректно декоративный). Паттерн WAI-ARIA для split-кнопок рекомендует группировать пару.
**Fix:** добавить `role="group"` в host-объект плюс опциональный инпут доступного имени (`aria-label`) и задокументировать рекомендацию. Низкорисково, естественно объединяется с изменением SPB-A11Y-01.

**SPB-ARCH-02 · Смешанный API инпутов: три легаси-accessor рядом с одним signal-инпутом** — `packages/components/split-button/split-button.ts:45,48-91`.
`panelAutoWidth` — современный `input<boolean>()`, тогда как `kbqStyle`, `color`, `disabled` — пары accessor-`@Input`, каждая с устаревшим комментарием автомиграции «Skipped for migration because: Accessor inputs cannot be migrated as they are too complex.» Тот же паттерн есть в `button`/`button-group`/`core` (это долг всего репозитория, а не изобретение split-button), но смесь внутри одного класса на 174 строки делает стиль API бессвязным и блокирует переписывание логики проброса на сигналы.
**Fix:** мигрировать три accessor на `input()` с проброской через `effect` (или transform-функции), скоординировав с идентичной миграцией в `button`/`button-group`, чтобы императивные записи `button.kbqStyle = ...` продолжали работать. Если координация откладывается — как минимум удалить устаревшие TODO и задокументировать accessors как осознанное решение.

**SPB-TEST-01 · Единственный реактивный путь кода (`buttons.changes`) не покрыт тестами** — `packages/components/split-button/split-button.spec.ts` (весь файл), цель: `split-button.ts:120-125`.
Все 27 кейсов используют статические шаблоны; ни один тест не добавляет и не удаляет кнопку после инициализации, поэтому подписка на `buttons.changes` — код, ради которого появились `delay(0)`, переразметка классов и повторный `updateDropdownParams`, — ни разу не выполняется в сьюте. Поведение при destroy (фиксы SPB-BUG-01/02) сегодня также нечем протестировать.
**Fix:** добавить кейсы с кнопками под `@if`: (a) появляется вторая кнопка → классы/стиль/цвет применяются заново, host-класс `styles-for-nested` переключается; (b) кнопка удаляется → классы `first`/`second` переназначаются; (c) фикстура уничтожается до срабатывания колбэков `delay(0)`/`setTimeout(50)` → нет ошибок и записей в DOM (использовать `jest.spyOn(console, 'error')` + fake timers).

**SPB-TEST-02 · Полное отсутствие тестов доступности** — `packages/components/split-button/split-button.spec.ts`.
Сьют проверяет только CSS-классы и проброс инпутов. Ничто не проверяет ARIA-атрибуты, доступные имена или клавиатурное поведение — при том, что AGENTS.md требует прохождения AXE каждым компонентом. Пробелы SPB-A11Y-01/02 остались незамеченными именно потому, что ни один тест не мог их поймать.
**Fix:** после фиксов Фазы 2 добавить спеки: у триггера `aria-haspopup="menu"`, `aria-expanded` переключается с состоянием открытия, icon-only триггер с `aria-label` экспонирует имя, хост несёт `role="group"`. Внедрить `jest-axe` для smoke-проверки «нет нарушений» на overview-фикстуре, если/когда репозиторий его добавит.

### P3 — Желательно / гигиена

**SPB-STYLE-01 · Скопированный JSDoc: «Whether the checkbox is disabled.»** — `packages/components/split-button/split-button.ts:79`.
Док-комментарий инпута `disabled` скопирован из чекбокса. Он утекает в подсказки IDE и генерируемую документацию.
**Fix:** переформулировать: «Whether the split-button (and all nested buttons) is disabled.»

**SPB-STYLE-02 · Магические 50 мс с расплывчатым комментарием** — `packages/components/split-button/split-button.ts:162-163`.
«we need to use a timeout of about 50ms to wait for the styles to apply» кодирует гонку layout константой; на медленном кадре ширина читается слишком рано, на быстром — 50 мс потерянной задержки.
**Fix:** поглощается переработкой SPB-BUG-02 — `afterNextRender` полностью убирает магическое число. Если задержка всё же нужна, дать константе имя и объяснить фактическую зависимость.

**SPB-STYLE-03 · Один приватный метод — стрелочное поле, остальные — обычные методы** — `packages/components/split-button/split-button.ts:154`.
`updateDropdownParams = () => {...}` — единственный стрелочный член класса; он никогда не передаётся как колбэк, так что привязка ничего не даёт, а стиль расходится с `updateClasses`/`updateColor`/`updateStyle`/`updateDisabledState`.
**Fix:** преобразовать в обычный приватный метод.

**SPB-STYLE-04 · В файле темы смешаны `:before` и `::before`** — `packages/components/split-button/_split-button-theme.scss:66,99,104,110` против `:8,16,23`.
Одно- и двухдвоеточный синтаксис псевдоэлементов смешан в одном файле (базовый `split-button.scss` последовательно использует `::before`).
**Fix:** нормализовать к `::before`; рассмотреть включение соответствующего правила stylelint для всего репозитория.

**SPB-ARCH-03 · Декораторный content-запрос + обычные getters вместо signal-запроса + `computed()`** — `packages/components/split-button/split-button.ts:40,95-101`.
`@ContentChildren(KbqButton)` стоит рядом с уже мигрированным signal-запросом `contentChild(KbqDropdownTrigger)`; `firstDisabled`/`secondDisabled` — обычные getters, перевычисляемые host-биндингами на каждом цикле CD. Signal-запрос `contentChildren(KbqButton)` + два `computed()` сделали бы производное состояние реактивным и вовсе удалили бы ручную подписку на `changes` (что заодно структурно чинит SPB-BUG-01). Предпочесть опциональную (не-`required`) форму запроса — репозиторий уже обжигался на `.required`-запросах, бросающих NG0951 в прод-сборках.
**Fix:** мигрировать в Фазе 4 вместе с SPB-ARCH-02; блок `buttons.changes.subscribe` превращается в `effect` на сигнале запроса.

**SPB-DOC-01 · В документации нет раздела о доступности** — `packages/components/split-button/split-button.en.md`, `split-button.ru.md`.
Доки описывают стили, контент, состояния и рекомендации, но ни слова о клавиатурном взаимодействии и обязательном `aria-label` для icon-only триггера меню — ровно то упущение, которое породило SPB-A11Y-01 в каждом потребителе, копирующем примеры.
**Fix:** добавить раздел «Доступность» (EN+RU): обязательный `aria-label` на icon-only триггерах, клавиатурная модель (Tab достигает обеих кнопок, Enter/Space активирует, клавиши меню — как в dropdown), семантика группировки.

**SPB-TEST-03 · Покрытие Playwright: тёмная тема только в одном тесте, нет состояний взаимодействия** — `packages/components/split-button/e2e.playwright-spec.ts:11-37`.
Три теста дают 4 скриншота; только «with title, prefix and suffix» захватывает тёмную тему. E2e-компонент (`e2e.ts`) рендерит богатую матрицу 6 стилей × 13 состояний, но ни один скриншот не фиксирует открытый dropdown или поведение разделителя при клавиатурном фокусе (`_split-button-theme.scss:28-35`).
**Fix:** добавить тёмные варианты для первых двух тестов и один скриншот с открытым dropdown; e2e-компонент это уже умеет.

**SPB-TEST-04 · Гигиена спеки: чужая фикстура внутри сьюта, лишний `detectChanges`** — `packages/components/split-button/split-button.spec.ts:210-219`.
Сьют «disabled input» (построенный вокруг `TestAppInputs`) создаёт внутри одного теста несвязанную фикстуру `TestApp`, а оставшийся `fixture.detectChanges()` на собственной фикстуре сьюта тестом не используется. Безвредно, но сбивает с толку.
**Fix:** перенести кейс в сьют `firstDisabled/secondDisabled` (он уже использует `TestApp`) и убрать лишний `detectChanges()`.

## 4. Рекомендуемые фазы исправлений

**Фаза 1 — Жизненный цикл и защита от падений.**
IDs: SPB-BUG-01, SPB-BUG-02, SPB-BUG-03 + регрессионные тесты из SPB-TEST-01(c).
Самодостаточна внутри `split-button.ts`; без изменений API и внешней координации. `DestroyRef` + `takeUntilDestroyed` + защищённое чтение ширины — один коммит. Тесты destroy/скрытого хоста писать первыми (fail → pass).

**Фаза 2 — Доступность (плюс общее изменение в `dropdown`).**
IDs: SPB-A11Y-01, SPB-A11Y-02, SPB-DOC-01, SPB-TEST-02.
Host-биндинги `aria-haspopup`/`aria-expanded` принадлежат `KbqDropdownTrigger` и приносят пользу каждому потребителю dropdown — оформить отдельным PR в `packages/components/dropdown` со своим ревью, затем обновить примеры/доки split-button (`aria-label` на icon-only триггерах, `role="group"` на хосте). Это снимает P0.

**Фаза 3 — Чистка публичного API.**
IDs: SPB-API-01, SPB-API-02, SPB-ARCH-01.
Переход на `defaultColor`, симметричный `kbqStyle`, единственный слот проекции. Видимо в API: выполнить `yarn run build:components`, затем `yarn run check-api`, и `approve-api` для намеренного диффа. Обновить закрепляющий юнит-тест сброса цвета.

**Фаза 4 — Реактивная модернизация.**
IDs: SPB-ARCH-02, SPB-ARCH-03, SPB-STYLE-02 (поглощается), SPB-STYLE-03.
Signal-запрос `contentChildren()` + `computed()` + `effect` заменяет ручную подписку, а accessor-инпуты мигрируют на `input()`. Миграцию accessors координировать с идентичным долгом в `button`/`button-group`; если координация буксует — выпустить отдельно часть с запросом/`computed`: она уже удаляет подписку.

**Фаза 5 — Гигиена.**
IDs: SPB-STYLE-01, SPB-STYLE-04, SPB-TEST-03, SPB-TEST-04.
Док-комментарий, нормализация псевдоэлементов, дополнительные скриншоты, чистка спеки. Можно безопасно влить в любую из фаз выше.

## 5. Стратегия верификации

**Общие гейты (на каждую фазу):**
- `npx jest packages/components/split-button/split-button.spec.ts` (базовая линия на `af6e64fe`: 27/27 зелёные, ~9 с)
- `yarn run eslint && yarn run stylelint && yarn run prettier`
- `yarn run build:components`, **затем** `yarn run check-api` (`approve-api` — только при намеренном изменении публичного API, Фаза 3)

**Фаза 1:** новые Jest-кейсы — уничтожение фикстуры до срабатывания колбэков `delay(0)`/таймера (fake timers, проверка отсутствия ошибок и записей в DOM после destroy); скрытый хост (`display: none`) с `panelAutoWidth` → нет `TypeError`; динамическое добавление/удаление кнопки переприменяет классы.
**Фаза 2:** Jest-проверки `aria-haspopup`/`aria-expanded`/`aria-label`/`role="group"`; `npx jest packages/components/dropdown/dropdown.spec.ts` для общего изменения триггера; ручной проход NVDA/VoiceOver по overview-примеру; AXE-проверка страницы документации.
**Фаза 3:** обновлённые кейсы сброса цвета и round-trip `kbqStyle`; дифф API-guard просмотрен и одобрен.
**Фаза 4:** повторный прогон полного сьюта; убедиться, что подписки на `buttons.changes` не осталось (код-ревью) и `firstDisabled`/`secondDisabled` обновляются через сигналы при динамических кнопках.
**Фаза 5:** `npx playwright test packages/components/split-button/e2e.playwright-spec.ts` с новыми скриншотами (light/dark, открытый dropdown); stylelint зелёный после нормализации `::before`.

## Приложение A — Методология ревью

Два параллельных исследовательских прохода (глубокий разбор компонента; извлечение формата ревью), затем ручная верификация каждой находки-кандидата по исходникам на `af6e64fe`. Каждая находка выше подтверждена чтением указанных строк; номера строк — из рабочего дерева на момент ревью.

Опровергнуто при верификации (исключено из находок):
1. *«Компонент не standalone»* — неверно: в декораторе нет `standalone: false`, значит компонент standalone по умолчанию Angular v19+; `KbqSplitButtonModule` (`split-button.module.ts`) импортирует/экспортирует standalone-компонент как осознанную обёртку репозитория для поддержки легаси.
2. *«Guard на `undefined` в `updateDisabledState` скрывает баги»* — guard (`split-button.ts:149`) осознанный: он не даёт затереть индивидуальные привязки `disabled` кнопок, когда групповой инпут не был задан (`_disabled` не инициализирован намеренно).

Также исправлено: первичный автоматический проход сообщил «16 тест-кейсов»; фактическое число — 27 блоков `it()` (проверено чтением спеки и прогоном Jest).

## Приложение B — Проверенные файлы

- `packages/components/split-button/split-button.ts` (174 строки — прочитан целиком)
- `packages/components/split-button/split-button.module.ts`
- `packages/components/split-button/split-button.spec.ts` (427 строк — прочитан целиком; выполнен: 27/27 зелёные)
- `packages/components/split-button/split-button.scss`, `_split-button-theme.scss` (прочитаны целиком)
- `packages/components/split-button/e2e.ts`, `e2e.playwright-spec.ts`
- `packages/components/split-button/split-button.en.md`, `split-button.ru.md`, `examples.split-button.*.md`
- `packages/components/dropdown/dropdown-trigger.directive.ts` (секции host/ARIA/клавиатуры; ARIA-grep по всему пакету)
- `packages/components/button/button.component.ts` (`KbqButtonStyles`, паттерн accessor-инпутов), `button-group.ts` (родственный паттерн)
- `packages/components/core/common-behaviors/color.ts` (контракт `KbqColorDirective`)
- `packages/docs-examples/components/split-button/*` (7 примеров; overview прочитан целиком)
- `packages/components-dev/split-button/*`
- `tools/public_api_guard/components/split-button.api.md`
- История git: `git log -- packages/components/split-button` (компонент добавлен в `898cdfe0`, тесты добавлены в `c0c56da4`, последнее содержательное изменение — апгрейд Angular 20 `17bc91dd`)
