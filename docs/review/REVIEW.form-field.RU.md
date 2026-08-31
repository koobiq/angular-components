# Компонент `form-field` Koobiq — код-ревью и план улучшений

> Охват: `packages/components/form-field` + общие абстракции `core`, которые он использует (`core/form-field/form-field-ref`, `core/common-behaviors/color`) · Коммит `96fee28c` · 2026-07-01
> Подготовлено автоматическим многоагентным ревью (8 измерений + состязательная проверка каждой находки + критик полноты). Подтверждено 63 находки (3×P0, 5×P1, 22×P2, 33×P3); ещё 9 кандидатов от критика; 2 отклонено. Используйте как высокосигнальную отправную точку; перепроверяйте перед действиями. Англоязычный оригинал — [`docs/REVIEW/REVIEW.form-field.md`](./REVIEW.form-field.md).
> Находки с пометкой **(shared)** лежат в `core` и затрагивают другие компоненты; находки **(cross-package)** требуют правок в пакетах контролов (`input` / `select` / `textarea`), которые реализуют `KbqFormFieldControl`. Документ — это ревью и дорожная карта; исходный код им не меняется.

---

## 1. Краткое резюме

- **Доступность — главный риск и единственный блокер релиза.** `KbqFormField` — контейнер, который использует каждый текстовый контрол, но он так и не выстраивает программные связи, нужные скринридеру: он собирает hint-ы/error-ы (у каждого сгенерирован `id`), но **никогда не пишет `aria-describedby`** на контрол; у `kbq-error` **нет `role`/`aria-live`**, и он монтируется/размонтируется под `@if (invalid)`, поэтому текст ошибки не объявляется ни при фокусе, ни при появлении; cleaner и password-toggle — это **иконочные, несемантические контролы без роли и без доступного имени**; а `KbqInput` не задаёт `aria-invalid`. Это прямо нарушает требование AGENTS.md «MUST pass AXE / WCAG AA». Здесь сосредоточены **3×P0 + 1×P1**.
- **Подтверждено независимо.** Поиск по репозиторию не находит **ни одного `aria-describedby`** в цепочке form-field/input, а host `KbqInput` задаёт только `id`/`placeholder`/`disabled`/`required` — без `aria-invalid` (он есть только у `KbqTextarea`, непоследовательно). Обзорное ревью монорепозитория (`docs/REVIEW/REVIEW.md`) независимо фиксирует те же пробелы (`A11Y-19`, `A11Y-22`, `BUG-40`, `BUG-41`).
- **Реальный баг порчи валидаторов.** `KbqFormField` императивно вызывает `control.setErrors({ passwordStrength: true })` из обработчика `stateChanges` (`form-field.ts:351`). `setErrors` **заменяет** весь объект ошибок, поэтому у поля пароля с `required`/`pattern`/асинхронными валидаторами эти ошибки теряются, как только проверка сложности не проходит — сообщения исчезают, а состояние формы становится неконсистентным.
- **Четыре неограниченные утечки подписок, все одной формы.** `stateChanges` (и Subject `checkRule`) подписываются без `takeUntilDestroyed` в `KbqPasswordHint` (×2), `KbqPasswordToggle` и в самом `KbqFormField` — последняя единственная в `form-field.ts` подписка, где отсутствует защита, которую используют все соседние. Каждая удерживает уничтоженный компонент и продолжает дёргать CD на мёртвом view. Все чинятся одной строкой.
- **Пакет функционально крепкий, но в середине миграции и со слабой типизацией.** Он корректно использует standalone + OnPush + host-биндинги повсюду (нет `@HostBinding`/`ngClass`/`ngStyle`), но смешивает сигнальные query с легаси-декораторами `@ContentChild`/`@Input`, лезет в подтипы контролов через `as any`-«утиную типизацию» (обходы циклической зависимости `#DS-3893`/`#DS-2915`), типизирует общий `KBQ_FORM_FIELD_REF.control` и публичную поверхность `rule`/`trim` как `any`, а также содержит опечатку в имени `_fiedset-theme.scss` и чужие `styleUrls`, которые запаковывают CSS input/timepicker/datepicker/textarea/tags в каждого потребителя form-field.
- **Два легаси-движка несут основной долг.** `KbqPasswordHint` (движок правил на `setTimeout`, помеченный в модуле как «Legacy», но без `@deprecated` и без тестов) и `KbqTrim` (monkey-patch `registerOnChange`, тихо обрезающий значения) концентрируют большинство находок по корректности, жизненному циклу и тестам. `KbqReactivePasswordHint` — предполагаемая замена и эталонный паттерн (`afterNextRender` + `takeUntilDestroyed`).
- **Что сильно.** Соблюдение соглашений (standalone/OnPush/host-биндинги), паттерн жизненного цикла `KbqReactivePasswordHint`, использование `output()`/`inject()`/`takeUntilDestroyed` в `KbqStepper` и чистое BEM-именование токенов дают хорошие швы для рефакторинга. Большинство находок — гигиена (33×P3); действенное ядро мало и хорошо ограничено.
- **В покрытии тестами реальные дыры.** Целые публичные единицы не покрыты — легаси-движок `KbqPasswordHint`, троица `KbqFieldset` и `KbqTrim`; prefix/suffix/hint покрыты только снапшотами; и **нет ни одного теста ARIA/AXE/клавиатуры** в пакете, чей главный риск — доступность.

## 2. Оценочная таблица

| Измерение | Оценка | P0 | P1 | Комментарий |
|---|---|---|---|---|
| Доступность | F | 3 | 1 | Нет `aria-describedby`; у ошибки нет live-region; cleaner/toggle — безымянные несемантические контролы; нет `aria-invalid` на input. **Блокер релиза.** |
| Корректность | C+ | 0 | 1 | `setErrors({passwordStrength})` затирает все прочие валидаторы; guard `PasswordRules.Length` мёртв + NaN-проверки длины; несколько нелогических геттеров. |
| RxJS и жизненный цикл | C+ | 0 | 3 | Четыре неограниченные подписки на `stateChanges` (password-hint ×2, password-toggle, form-field); неочищаемый `setTimeout`. |
| Архитектура и соглашения | C | 0 | 0 | Смесь декораторных/сигнальных query; немигрированные `@Input()`; касты `as any` к контролам; `KBQ_FORM_FIELD_REF.control: any`; легаси `KbqPasswordHint`/`KbqTrim`. |
| Публичный API и типы | B− | 0 | 0 | `any` на публичной поверхности (`rule`, `trim`, ref); `ae-forgotten-export` (`KbqNumberInput`); отсутствует `exportAs`; `abstract open?()`; легаси-движок без `@deprecated`. |
| Производительность | B | 0 | 0 | Безусловный `detectChanges()` при init; ~13 нечистых геттеров шаблона; per-instance dev `console.warn` в `mixinColor`. |
| Шаблоны и стили | B− | 0 | 0 | Опечатка `_fiedset-theme.scss`; чужие `styleUrls` (раздувание + связность); мёртвые/почти-мёртвые селекторы; дублированный блок hint; `!important`. |
| Тесты | C | 0 | 0 | Легаси `KbqPasswordHint`, `KbqFieldset`, `KbqTrim` не покрыты; prefix/suffix/hint только снапшоты; нет ARIA/AXE/клавиатуры; дубль + холостой тест. |

## 3. Приоритизированные находки (дедуплицированы, проверены)

### P0 — Блокеры релиза (доступность)

**FF-A11Y-02 · Hint-ы и error-ы никогда не связываются с контролом через `aria-describedby`** **(cross-package)** — `form-field.ts:519` (`initializeHint`); `hint.ts:15` (`'[attr.id]': 'id()'`).
`KbqHint`/`KbqError`/`KbqPasswordHint` задают сгенерированный host `id`, form-field их собирает, но `aria-describedby` на нативный элемент контрола не пишется никогда. Поиск `aria-describedby` в form-field/input не находит ничего; host `KbqInput` задаёт только `id`/`placeholder`/`disabled`/`required`. Поэтому сгенерированные id — мёртвый груз, а текст hint/error визуально рядом, но программно не связан — пользователь скринридера, сфокусировавшись на поле, его не услышит. WCAG 1.3.1 / 3.3.2.
**Исправление:** вычислять множество describing-id в `KbqFormField` (hint-ы + reactive/password hint-ы + error-ы при наличии) и применять его к контролу через контракт `setDescribedByIds`, добавленный в `KbqFormFieldControl` и реализованный на host `KbqInput`/`KbqSelect`/`KbqTextarea` — по образцу form-field Angular Material. Связано с FF-A11Y-03.

**FF-A11Y-03 · У `kbq-error` нет `role`/`aria-live`, а `@if (invalid)` мешает надёжному объявлению** *(объединяет находки «нет live-region» и «@if teardown»)* — `error.ts:14` (host); `form-field.html:38` (`@if (invalid)`).
`KbqError` задаёт только `class: 'kbq-error'` и переиспользует `hint.html`; во всём пакете нет ни `role="alert"`, ни `aria-live`. Хуже того, ошибка монтируется/размонтируется под `@if (invalid)`, поэтому live-region, добавленный на проецируемый узел, вставляется *уже с содержимым* — что скринридеры часто не объявляют. Вместе с FF-A11Y-02 ошибка невидима и при появлении, и при фокусе. WCAG 4.1.3.
**Исправление:** рендерить **постоянную** обёртку-live-region в области hint (`aria-live="polite" aria-atomic="true"`, всегда в DOM) и переключать только её внутреннее содержимое по `invalid`, а не добавлять/удалять весь проецируемый узел `kbq-error`. Также связать `aria-describedby` контрола с id ошибки (вместе с FF-A11Y-02), чтобы она находилась при фокусе.

**FF-A11Y-01 · Cleaner — несемантическая цель клика `<div>`: нет роли, нет доступного имени, нет Space** *(объединяет FF-STYLE-08)* — `form-field.html:22`.
Обёртка cleaner — это `<div class="kbq-form-field__cleaner" (click)="clearValue($event)" (keydown.enter)="clearValue($event)">`; проецируемый `KbqCleaner` (расширяет `KbqIconButton`) рендерит голый фокусируемый `<i>` **без `role` и без доступного имени**, а обёртка обрабатывает только Enter, не Space. Поэтому контрол очистки объявляется как безымянная фокусируемая графика и, в отличие от нативной кнопки, не срабатывает по Space. WCAG 4.1.2 / 2.1.1. (Enter уже работает за счёт всплытия — пробелы это роль, имя и Space, а не полная неработоспособность с клавиатуры.)
**Исправление:** задать `role="button"` + локализуемый `aria-label` (см. FF-I18N-01) на фокусируемом элементе (`tabindex=0` cleaner) и добавить `(keydown.space)` с `preventDefault`. Предпочтительно рендерить cleaner как нативный `<button type="button">`, чтобы роль/имя/клавиатура появились сами.

> FF-A11Y-01/02/03 — одна логическая единица: цепочка контрол → describedby → live-region ошибки должна приземлиться вместе, чтобы быть согласованной и проходить AXE.

### P1 — Высокие

**FF-LOGIC-03 · `setErrors({ passwordStrength: true })` затирает все прочие валидаторы контрола** — `form-field.ts:351`.
В `ngAfterContentInit` обработчик `stateChanges` вызывает `this.control().ngControl?.control?.setErrors({ passwordStrength: true })`, когда у password-hint есть ошибка и контрол не в фокусе. `AbstractControl.setErrors` **заменяет** весь объект ошибок. Любая ошибка `required`/`pattern`/async стирается и заменяется только `{ passwordStrength: true }`; сообщения, привязанные к `hasError('required')`, исчезают, а остальные валидаторы не перезапускаются до смены значения.
**Исправление:** объединять — `const c = this.control().ngControl?.control; c?.setErrors({ ...(c.errors ?? {}), passwordStrength: true });` — и удалять только этот ключ, когда сложность проходит. Лучше: выставить настоящую функцию-валидатор, а не мутировать ошибки из контейнера.

**FF-RXJS-04 · У подписки `stateChanges` (сила пароля) в `KbqFormField` нет `takeUntilDestroyed`** — `form-field.ts:347`.
`this.control().stateChanges.pipe(startWith(), delay(0)).subscribe(...)` — **единственная** подписка в файле без защиты — `initializeControl` (`:506`), `initializePrefixAndSuffix` (`:515`), `initializeHint` (`:522`) и `runFocusMonitor` (`:465`) используют `takeUntilDestroyed(this.destroyRef)`. После уничтожения она продолжает мутировать ошибки возможно ещё живого `FormControl` (см. FF-LOGIC-03) и удерживает мёртвый компонент.
**Исправление:** добавить `takeUntilDestroyed(this.destroyRef)` в pipe (`destroyRef` уже инжектирован на `:132`).

**FF-RXJS-01 · `KbqPasswordHint` подписывается на `stateChanges` и Subject `checkRule` без отписки** — `password-hint.ts:149`.
Внутри `setTimeout` создаются `control.stateChanges.subscribe(this.checkValue)` и `(...).checkRule.subscribe(...)` без `takeUntilDestroyed`, без сохранённой подписки и без `ngOnDestroy`. Оба потока принадлежат контролу и переживают hint, поэтому каждый созданный-и-уничтоженный hint остаётся подписанным и продолжает дёргать `markForCheck` на мёртвом view.
**Исправление:** захватить `destroyRef` как поле и пропустить обе подписки через `takeUntilDestroyed(this.destroyRef)`.

**FF-RXJS-03 · `KbqPasswordToggle` подписывается на `stateChanges` без отписки** — `password-toggle.ts:137`.
`this.formField?.control()?.stateChanges.subscribe(this.updateState)` без защиты; существующий `ngOnDestroy` (`:152`) вызывает только `focusMonitor.stopMonitoring(...)`. Замыкание `updateState` (вызывающее `markForCheck`) остаётся подписанным на долгоживущий поток после уничтожения.
**Исправление:** `takeUntilDestroyed(this.destroyRef)` либо сохранить `Subscription` и отписаться в существующем `ngOnDestroy`.

**FF-A11Y-04 · Password-toggle — иконочный `<i>` без роли, доступного имени и состояния переключения** — `password-toggle.ts:43`.
Toggle рендерит `<i [kbq-icon-button]="iconClass">` внутри `<ng-content>`; фокусируемый `<i>` не имеет `role`, доступного имени и `aria-pressed`/`aria-expanded`, отражающего показан/скрыт. Всплывающий тултип не является доступным именем. Пользователь скринридера слышит безымянную фокусируемую графику и не узнаёт состояние показан/скрыт. WCAG 4.1.2.
**Исправление:** на фокусируемом элементе (предпочтительно перестроив в нативный `<button type="button">`, владеющий обработчиками клавиатуры) добавить `role="button"`, локализуемый `aria-label` из `hidden` (см. FF-I18N-01) и `[attr.aria-pressed]="!hidden"`.

### P2 — Следует исправить

**Доступность**
- **FF-A11Y-05 · Нет `aria-invalid` на контроле** **(cross-package)** — невалидное состояние только через классы (`ng-invalid`, `kbq-form-field_invalid`). `KbqInput` (`input.ts:34-44`) и `KbqSelect` не задают `aria-invalid`; есть только у `KbqTextarea` (`textarea.component.ts:43`). **Исправление:** добавить `[attr.aria-invalid]="errorState"` на host `KbqInput`/`KbqSelect`; `aria-required` для не-нативных контролов.
- **FF-A11Y-06 · Fieldset помечается через `legend.innerText`, а не `aria-labelledby`; нативный `<legend>` использован неверно** *(объединяет критик про «невалидный legend»)* — `fieldset.ts:55,68`. `ariaLabel = computed(() => this.legend()?.nativeElement?.innerText)` пуст до раскладки, не реагирует на i18n и дублирует видимый текст; нативный `<legend>` вне `<fieldset>` (`e2e.ts:66`) не имеет a11y-семантики. **Исправление:** дать `[kbqLegend]` сгенерированный id и задать `[attr.aria-labelledby]` на host; убрать label из innerText.
- **FF-I18N-01 · У иконочных контролов нет локализуемых доступных имён; пакет не использует `KbqLocaleService`** *(критик)* — `password-toggle.ts:45`, cleaner, stepper. Каждое исправление a11y-имени (FF-A11Y-01/04/07) захардкодит English/Russian, если не брать строку из сервиса локализации koobiq, которым пользуются другие компоненты. Считать зависимостью локализации для работ Фазы 1.
- **FF-A11Y-10 · `KbqTrim` тихо обрезает значения, портя ввод, где пробелы значимы** *(критик)* — `form-field.ts:559`. Применяется по умолчанию ко всем `[kbqInput]`/`[kbqTextarea]`; хвостовой пробел в пароле/коде срезается без индикации, а модель расходится с видимым значением до перерисовки. **Исправление:** сделать обрезку opt-in (или исключить password-input) и держать видимое значение в синхроне.

**Корректность**
- **FF-LOGIC-01/02 · Guard `PasswordRules.Length` мёртв → NaN-проверки длины всегда false** — `password-hint.ts:129,175`. `min`/`max` — `input<number>(undefined!)`, поэтому `(this.min() || this.max()) === null` никогда не истинно и guard «нужны min/max» не срабатывает; `checkLengthRule` затем сравнивает `value.length >= undefined` (`NaN`, всегда false), поэтому пароль правильной длины считается неверным и может навесить ошибку `passwordStrength` на весь контрол. **Исправление:** guard через `== null` для обеих границ; коалесцировать в проверке (`min ?? 0`, `max ?? Infinity`).

**Публичный API и типы**
- **FF-API-01 / FF-ARCH-03 · `KBQ_FORM_FIELD_REF.control` типизирован `any`** **(shared)** — `core/form-field/form-field-ref.ts:10`. Общий ref (TODO `#DS-2915`) убивает проверку типов в каждой точке инъекции (`KbqPasswordHint`/`KbqReactivePasswordHint`/`KbqStepper`/`KbqPasswordToggle`/`core/select/common.ts`) и разрешает касты `as any`. **Исправление:** типизировать как `Signal<KbqFormFieldControl<unknown>>`; узкие касты оставить только для членов подтипов. Затем `approve-api`.
- **FF-API-02/03 · `regExpPasswordValidator` с ключами-значениями enum + `rule: input<PasswordRules | any>`** — `password-hint.ts:29,70`. `| any` схлопывает публичный `rule` в `any` (снапшот `InputSignal<any>`); выведенный тип экспортируемого валидатора — `{1;2;3;4:RegExp}` по *значениям* enum, хрупок к перестановке и без `Length`/`Custom`. **Исправление:** `input<PasswordRules>()` и `Partial<Record<PasswordRules, RegExp>>`. `approve-api`.
- **FF-API-04 · `KbqNumberInput` — `ae-forgotten-export`** — `stepper.ts:11`. `connectTo(numberInput: KbqNumberInput)` и `get control(): KbqNumberInput` выносят неэкспортированный тип на поверхность (предупреждение `form-field.api.md:306`). **Исправление:** экспортировать реальный интерфейс `KbqNumberInputControl` (закрывает `#DS-3893`) или пометить члены `@docs-private`.
- **FF-API-05 · Отсутствует `exportAs` у `KbqSuffix`/`KbqFieldsetItem` (и `KbqLegend`)** — `suffix.ts:4`, `fieldset.ts:22,13`. У соседей `KbqPrefix`/`KbqLabel` он есть. **Исправление:** добавить `exportAs` для паритета template-ref. Не ломающее; `approve-api`.
- **FF-API-06 · `KbqTrim.trim(value: any): any` на публичной поверхности** — `form-field.ts:551`. Нарушает правило «без `any`»; тело осмысленно обрабатывает только `string`. **Исправление:** `trim(value: unknown): unknown` либо `@docs-private`.

**Производительность**
- **FF-PERF-01 · Безусловный `detectChanges()` в `ngAfterViewInit`** — `form-field.ts:373`. `runFocusMonitor` не мутирует связанное значение синхронно, значит комментарий устарел, и каждый form-field форсирует полный лишний проход CD при init (дорого на страницах с множеством форм). **Исправление:** `markForCheck()` или удалить.

**Жизненный цикл**
- **FF-RXJS-02 · В `KbqPasswordHint` id `setTimeout` не очищается** — `password-hint.ts:148`. Нет сохранённого id, нет `ngOnDestroy`; при быстром создании/уничтожении отложенный колбэк выполняется на разрушенном компоненте (`control()` может бросить / установить утечку FF-RXJS-01 на сироте). **Исправление:** заменить на `afterNextRender`/`timer(0).pipe(takeUntilDestroyed())` (по образцу `KbqReactivePasswordHint`).

**Шаблоны, стили и сборка**
- **FF-STYLE-02 / FF-BUILD-01 · Чужие `styleUrls` раздувают и связывают entry point** — `form-field.ts:90`. `styleUrls` тянет SCSS `../input`, `../timepicker`, `../datepicker`, `../textarea`, `../tags`, поэтому каждый потребитель form-field грузит CSS компонентов, которые не использует, а любой рефакторинг этих файлов молча меняет вывод form-field (и ломает его сборку). **Исправление:** перенести стилизацию каждого контрола в его тему; если директива действительно не может владеть стилями — задокументировать и завязать на тему контрола.
- **FF-STYLE-05 · Селектор «сам-в-себе» задаёт высоту только вложенным полям** — `form-field.scss:74`. `.kbq-form-field .kbq-form-field:not(.kbq-form-field-type-textarea)` матчит только form-field, вложенный в другой, поэтому отдельно стоящее поле не получает `--kbq-form-field-size-height` из этого правила; подразумевался `&`. **Исправление:** заменить на `&:not(.kbq-form-field-type-textarea)` (проверить раскладку) или удалить мёртвое правило; добавить комментарий на английском.

**Тесты**
- **FF-TEST-02 · Легаси-движок правил `KbqPasswordHint` полностью не покрыт** — `password-hint.ts:64`. Тестируется *reactive*-hint; легаси-диспетчер Length/regex/Custom, все три throw-пути, машина состояний `checkValue` и экспортируемые `hasPasswordStrengthError`/`regExpPasswordValidator` не покрыты. **Исправление:** добавить `password-hint.spec.ts`, прогоняющий каждое значение `PasswordRules`.
- **FF-TEST-03 · `KbqFieldset`/`KbqLegend`/`KbqFieldsetItem` не покрыты; e2e только скриншот** — `fieldset.ts:58`. `role="group"` и aria-label из innerText могут молча регрессировать. **Исправление:** `fieldset.spec.ts` с проверкой роли и aria-label против текста legend и host-классов.
- **FF-TEST-04 · `KbqTrim` (trim / no-trim / не-строка) не покрыт** — `form-field.ts:535`. Регрессия перехвата `registerOnChange` молча испортит значения. **Исправление:** спек: значение с пробелами → обрезано; `no-trim` сохраняет; не-строка проходит без изменений.
- **FF-TEST-06 · Тесты prefix/suffix/hint только снапшотные** — `form-field.spec.ts:317`. Снапшоты фиксируют сериализованную структуру, но не проверяют контракт (host-класс, форвардинг `id()`, переключатели `fillTextOff`/`compact`). **Исправление:** заменить на явные проверки host-класса/атрибутов.
- **FF-TEST-07 · Ноль проверок ARIA/AXE/клавиатуры во всём наборе** — `form-field.spec.ts:296`. Нет проверок `aria-describedby`/`aria-invalid`/`role`/AXE; password-toggle только `.click()`, без клавиш. **Исправление:** добавить ARIA-проверки (после Фазы 1), нажимать toggle по Enter/Space, запустить jest-axe на репрезентативных шаблонах, добавить interactive/reduced-motion e2e.

### P3 — Желательно / гигиена

- **Модернизация архитектуры** — мигрировать `@ContentChild`/`@ContentChildren` в сигнальные query (**FF-ARCH-01**, `form-field.ts:171` — это **ломающее изменение публичного API**: `cleaner`/`passwordToggle`/`hint`/`passwordHints`/`prefix`/`suffix` становятся `Signal`; `approve-api`); мигрировать оставшиеся `@Input()` в `input()`/`model()` (**FF-ARCH-02**, `hint.ts:28`, `password-hint.ts:76`, `password-toggle.ts:80`); снизить связность наследования с внутренностями базовых классов (**FF-ARCH-05/06**, `cleaner.ts:22`, `reactive-password-hint.ts:59`); нетипизированный monkey-patch `KbqTrim` (**FF-ARCH-08**, `form-field.ts:535`); защитить `KbqStepper.connectTo` от двойного вызова (**FF-ARCH-09/FF-RXJS-05**, `stepper.ts:118` — подписки на output чистятся автоматически, поэтому это надёжность, не утечка); гигиена teardown `mouseUp`/document-mouseup в `KbqStepper` (**FF-RXJS-06**, `stepper.ts:145`).
- **(shared) Устаревший `mixinColor`** (**FF-ARCH-07**, `core/common-behaviors/color.ts:42`) — всё ещё поставляется рядом с `KbqColorDirective`; `color` остаётся легаси-аксессором `@Input`. Сделать grep `mixinColor(`, затем удалить; мигрировать `color` в сигнал + host-биндинг `[class]`.
- **Честность типов в корректности** — геттеры, объявленные `boolean`, но возвращающие не-boolean: `shouldForward` (**FF-LOGIC-04**, `:451`, возвращает `null`/объект → `!!`), `canShowCleaner` (**FF-LOGIC-05**, `:330`, возвращает значение модели; прячет cleaner для числового `0`), `disabled`/`hasFocus` (**FF-LOGIC-06**, `:266,334`, возвращают `undefined`); мёртвый `this.cleaner = null` перед throw (**FF-LOGIC-07**, `:341`); устаревший `event.keyCode` для ESCAPE/F8 (**FF-LOGIC-08**, `:418`); машина состояний `checkValue` / неинициализированный `lastControlValue` (**FF-LOGIC-09**) и отставание цвета reactive-hint от `icon()` на один такт `delay(0)` (**FF-LOGIC-10**).
- **Производительность** — превратить ~13 нечистых геттеров шаблона в `computed()` (**FF-PERF-02**, `form-field.html:19`; следует за миграцией query); поставить once-guard на dev `console.warn` в `mixinColor` (**FF-PERF-03**, `color.ts:80`); мемоизировать разрешённый контрол в геттерах password-hint/toggle/stepper (**FF-PERF-04**).
- **Стили** — переименовать `_fiedset-theme.scss` → `_fieldset-theme.scss` и две ссылки `@use`/`@include` (**FF-STYLE-01**); удалить мёртвый `.kbq-form-field_without-borders` **только после** закрытия окна миграции `schematics/.../v20-upgrade/data.ts:261` (**FF-STYLE-03**); согласовать дублированный блок `.kbq-form-field__hint` между `form-field.html` и `fieldset.ts` (в копии fieldset нет guard `invalid`) (**FF-STYLE-04**); задокументировать браузерную базу `:has()` (**FF-STYLE-06**); упростить избыточную комбинацию `visibility`/`cdk-visually-hidden`/`aria-hidden` на toggle (**FF-STYLE-07**); задокументировать контракт глобальных классов `ViewEncapsulation.None` (**FF-STYLE-09**); заменить `!important` в no-borders/in-overlay на косвенность через токены (**FF-STYLE-10**).
- **Публичный API** — убрать противоречивый `abstract open?()` → простой опциональный (**FF-API-07**, `form-field-control.ts:53`); добавить `@deprecated` легаси `KbqPasswordHint`/`PasswordRules`/`regExpPasswordValidator`/`hasPasswordStrengthError` и ужесточить видимость членов (**FF-API-08 / FF-API-10**, `password-hint.ts:64`, `public-api.ts:9`); заменить асимметричный аксессор-input `content` на сигнал + `computed()` (**FF-API-09**, `password-toggle.ts:80`).
- **Тесты** — удалить побайтово дублированный тест `'…invalid … initially'` (**FF-TEST-08**, `form-field.spec.ts:456,462`); заставить `validate.spec.ts` проверять поведение Kbq, а не собственные валидаторы Angular, или влить `KbqTrim` (**FF-TEST-09**).
- **Консистентность SSR** *(критик)* — стандартизировать на `afterNextRender`/`isPlatformBrowser` для DOM/тайминг-подключений: `setTimeout`-подписка `KbqPasswordHint` (**FF-SSR-01**), `fromEvent(document,…)` `KbqStepper` (**FF-SSR-02**), `stateChanges`-подписка `KbqPasswordToggle` (**FF-SSR-03**) сегодня выполняются на сервере, в отличие от reactive-hint, рискуя рассинхроном гидрации.

**Отклонено при проверке (исключено):** **FF-TEST-01** «`KbqStepper` полностью не покрыт» — поведение stepper *покрыто* вне папки. **FF-TEST-05** «throw для cleaner в number-input + ESCAPE-очистка не покрыты» — throw покрыт в `input/input-number.spec.ts`.

## 4. Рекомендованные фазы устранения

**Фаза 1 — Блокеры доступности (должны приземлиться вместе).**
ID: FF-A11Y-01..06 + FF-A11Y-10 + FF-I18N-01 + FF-TEST-07 (регресс-защита). Цепочка контрол → `aria-describedby` → live-region ошибки (01/02/03) идёт единым изменением; 04/05/06 параллелятся. **Cross-package:** добавить контракт `setDescribedByIds` в `KbqFormFieldControl` и `aria-invalid` в `KbqInput`/`KbqSelect`; брать доступные имена из `KbqLocaleService`. Сначала писать спеки AXE/ARIA (fail → pass). Разблокирует релиз.

**Фаза 2 — Жизненный цикл и корректность.**
ID: FF-RXJS-01/03/04 + FF-RXJS-02 (механический `takeUntilDestroyed`/`afterNextRender` — копировать паттерн `KbqReactivePasswordHint`), FF-LOGIC-03 (слияние ошибок — сделать рано), FF-LOGIC-01/02 (правило Length) + FF-TEST-02/04 как регресс-защита. Низкий риск.

**Фаза 3 — Производительность и стили.**
ID: FF-PERF-01/03, FF-STYLE-01/03/04/05/10 и вынос чужих `styleUrls` (FF-STYLE-02 / FF-BUILD-01). Запустить `yarn run styles:build-all` и сравнить.

**Фаза 4 — Миграция на современный Angular, API и типы (за SemVer-воротами).**
ID: FF-ARCH-01/02/05..09, FF-ARCH-07 (`mixinColor`), FF-API-01..10, FF-LOGIC-04..10, FF-PERF-02/04, FF-STYLE-06/07/09, FF-SSR-01/02/03, FF-TEST-03/06/08/09. Собрать API-меняющие пункты (миграция query, удаление `any`, мёртвый экспорт, дженерики, `exportAs`, `@deprecated`) и запустить `approve-api` один раз; ломающие части (типы сигнальных query, ужесточение видимости членов) запланировать на мажор. FF-A11Y-05 (aria-invalid) зависит от тех же host контролов, что затрагиваются в Фазе 1.

## 5. Стратегия верификации

**Общие ворота (по фазам):**
- `npx jest packages/components/form-field` (unit) — и `packages/components/input` / `select` / `textarea` для кросс-пакетной a11y-работы.
- `yarn run eslint && yarn run stylelint && yarn run prettier`.
- `yarn run build:components` **затем** `yarn run check-api` (и `yarn run approve-api` только когда публичный API меняется намеренно — Фаза 4; guard читает `dist/*.d.ts`, поэтому сначала сборка).

**Фаза 1 (a11y):** новые jest-спеки a11y — контрол получает `aria-describedby` со ссылкой на каждый id hint/error и `aria-invalid` при ошибке; постоянный `aria-live` объявляет вставку ошибки; cleaner и password-toggle фокусируемы, `role="button"`, именованы (локализованно) и срабатывают по Enter **и** Space; toggle выставляет `aria-pressed`; fieldset использует `aria-labelledby`. При внедрении jest-axe — `expect(await axe(...)).toHaveNoViolations()` на шаблонах label+input+hint+error, password и fieldset. Ручной проход NVDA/VoiceOver. e2e: добавить interactive/focus-скриншоты и проверку `prefers-reduced-motion` для stepper.

**Фаза 2 (жизненный цикл/корректность):** создать/уничтожить множество hint-ов/toggle-ов и проверить, что число наблюдателей `stateChanges` контрола не растёт; поле пароля с `required` + слабый пароль сохраняет ошибку `required` после `setErrors` (FF-LOGIC-03); hint `PasswordRules.Length` с валидной длиной — `checked`, а без min/max — бросает при init (FF-LOGIC-01/02).

**Фаза 3 (производительность/стили):** проверить отсутствие лишнего синхронного прохода CD при init form-field; `yarn run styles:build-all` и diff бандла form-field, чтобы убедиться, что чужой CSS ушёл; визуально проверить высоту отдельно стоящего поля после правки селектора `&`.

**Фаза 4 (миграция/API):** после изменений query + `any` + мёртвого экспорта → `yarn run check-api`, просмотреть `tools/public_api_guard/components/{form-field,core}.api.md`, затем `approve-api`; проверить, что типизированные потребители компилируются. Полный регресс: `yarn run unit:components` + `yarn run e2e:components` перед merge.

---

## Приложение A — Методология ревью

Ревью подготовлено 8 параллельными агентами (архитектура, RxJS/жизненный цикл, корректность, доступность, производительность, публичный API/типы, тесты, шаблоны/стили), каждый читал исходники напрямую. Затем каждая сырая находка состязательно проверялась независимым агентом против реального кода (перепроверка номеров строк, владения потоками, пересмотр severity); несколько были понижены при проверке (например, миграция `contentChild` до P3, когда всплыла её ломающая-API цена; «утечка» подписок output stepper — до гигиены). Критик полноты затем выявил 9 дополнительных кандидатов (консистентность SSR, i18n доступных имён, взаимодействие с `@if (invalid)` live-region, мутация значений `KbqTrim`, неверное использование `<legend>`), которые **не** проверялись независимо и помечены *(критик)*. Из 65 сырых находок 63 подтверждены и 2 отклонены. Две самые значимые находки (нет `aria-describedby` в пакете; нет `aria-invalid` на `KbqInput`) дополнительно проверены вручную. Обзорное ревью монорепозитория (`docs/REVIEW/REVIEW.md`) независимо фиксирует те же пункты (`A11Y-19` describedby/invalid/live, `A11Y-22` семантика cleaner, `BUG-40`/`BUG-41` утечки toggle/form-field).

## Приложение B — Просмотренные файлы

`packages/components/form-field/`: `form-field.ts` (+ `KbqTrim`), `form-field-control.ts`, `form-field.html`, `cleaner.ts`, `error.ts`, `hint.ts`/`hint.html`, `label.ts`, `prefix.ts`, `suffix.ts`, `password-hint.ts`, `reactive-password-hint.ts`, `password-toggle.ts`, `stepper.ts`, `fieldset.ts`, `form-field.module.ts`, `public-api.ts`, `index.ts`, все `*.scss` (`form-field`, `_form-field-theme`, `form-field-tokens`, `hint`, `_hint-theme`, `hint-tokens`, `fieldset`, `_fiedset-theme`, `fieldset-tokens`, `cleaner`, `stepper`, `password-toggle`), `form-field.spec.ts`, `validate.spec.ts`, `e2e.ts`, `e2e.playwright-spec.ts`, `form-field.api.md`.
Общий `core` (находки **(shared)**): `core/form-field/form-field-ref.ts`, `core/common-behaviors/color.ts`.
Кросс-пакетные контролы, упомянутые в дорожной карте a11y (**(cross-package)**): `input/input.ts`, `select/select.component.ts`, `textarea/textarea.component.ts`.
