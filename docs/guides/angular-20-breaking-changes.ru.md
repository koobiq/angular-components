Эти изменения вошли в **Koobiq v20.0.0** (2026-05-13) — переход на Angular 20. Пошаговый сценарий обновления описан в [гайде по миграции](/ru/main/migration); ниже — полный список ломающих изменений.

### Angular 20

- **angular:** обновление до Angular 20.3.21. `requiredAngularVersion` теперь `^20.0.0`. Все `peerDependencies` публикуемых пакетов нацелены на `^20.0.0`. Потребителям необходимо обновиться до Angular 20+.
- **node:** минимальная поддерживаемая версия Node.js теперь **20.19** (добавлено `"engines": { "node": ">=20.19" }`).
- **zone.js:** понижен до `~0.15.1` в соответствии с peer-требованием Angular 20.
- **components:** `KbqPopUpTrigger` (база tooltip / popover / notification-center / app-switcher) переведён на `Signal<T>` для `enterDelay`, `leaveDelay`, `stickToWindow`, `container`, `hideWithTimeout`, `preventClose` и `arrow`, чтобы существующие переопределения signal-input в подклассах проходили проверку типов. Потребители, читающие эти значения с инстанса триггера, должны вызывать их как сигналы (`.enterDelay()` и т. д.).
- **popover:** сломанная в рантайме мутация `set trigger(value)` для `hideWithTimeout`/`leaveDelay` (добавлена в DS-3677 #851 и незаметно сломана начиная с DS-4749 #1442) заменена на записываемые backing-сигналы; `leaveDelay` теперь `computed`-сигнал, комбинирующий пользовательский ввод и значение по умолчанию для hover-режима `500ms`.
- **form-field:** `KbqInput.placeholder`, `KbqInput.errorStateMatcher`, `KbqInputPassword.placeholder`, `KbqInputPassword.errorStateMatcher`, `KbqTextarea.placeholder`, `KbqTextarea.errorStateMatcher`, `KbqSelect.errorStateMatcher`, `KbqTagList.errorStateMatcher`, `KbqTreeSelect.errorStateMatcher`, `KbqSingleFileUploadComponent.errorStateMatcher`, `KbqMultipleFileUploadComponent.errorStateMatcher`, `KbqTagInput.placeholder`/`id` возвращены к примитивам `@Input` — они конфликтуют с типами интерфейсов (`CanUpdateErrorState`, `KbqFormFieldControl`, `KbqTagTextControl`), ожидающими «сырые» значения. Привязки в шаблонах через алиасы остаются прежними.
- **code-block:** `softWrap`, `viewAll`, `canDownload`, `activeFileIndex` теперь `model()`-сигналы (записываемые + bindable). Краткая запись атрибута без значения `<kbq-code-block canDownload>` больше не приводит к приведению типа — используйте `[canDownload]="true"`, `[activeFileIndex]="1"` и т. д.
- **textarea:** `freeRowsHeight` теперь `model()`-сигнал; краткая запись атрибута без значения не поддерживается, используйте `[freeRowsHeight]="160"`.
- **search-expandable / dl / radio / checkbox / toggle / sidepanel:** `isOpened` / `vertical` / `name` / `id` / `sidepanelResult` теперь `model()`-сигналы (внутри используйте `.set()` / `.update()`; двусторонняя привязка `[(x)]` снаружи работает).
- **modal:** `kbqOkText`, `kbqOkType`, `kbqRestoreFocus`, `kbqCancelText`, `kbqModalType`, `kbqComponent`, `kbqContent`, `kbqComponentParams`, `kbqFooter`, `kbqWidth`, `kbqSize`, `kbqWrapClassName`, `kbqClassName`, `kbqStyle`, `kbqTitle`, `kbqCloseByESC`, `kbqOnOk`, `kbqOnCancel` возвращены к обычным `@Input`/`@Output` в соответствии с `ModalOptions`. Программный API (через `KbqModalService`) остаётся прежним.
- **notification-center / app-switcher:** удалены переопределения signal-input `placement` (конфликтовавшие с `KbqPopUpTrigger.placement`) — placement снова настраивается через паттерн геттера/сеттера `@Input('kbqNotificationCenterPlacement')` / `@Input('kbqAppSwitcherPlacement')`, делегирующий в `super.updatePlacement(...)`. `arrow` в обоих теперь `Signal<boolean>` (соответствует новому контракту базового класса).
- **tabs:** `KbqPaginatedTabHeader.disablePagination` теперь `computed`, комбинирующий пользовательский ввод с записываемым fallback, устанавливаемым сеттером `vertical`. `KbqTabGroupComponent.animationDuration` — `computed`, разрешающий пользовательский ввод → значение по умолчанию `KBQ_TABS_CONFIG` → `'0ms'`. `KbqTabLink.disabled` возвращён к обычному `@Input` (соответствует `FocusableOption.disabled`).
- **dropdown:** `KbqDropdown.backdropClass` возвращён к `@Input` в соответствии с интерфейсом `KbqDropdownPanel`. Конструктор `KbqDropdownContent` больше не принимает `ComponentFactoryResolver` (удалён в Angular 20).
- **input-number:** убрано приведение в конструкторе через `@Attribute('step' | 'big-step' | 'min' | 'max')`; те же значения по умолчанию теперь задаются через `input(..., { transform: numberAttribute })`. Привязки в шаблоне `[step]="..."` по-прежнему работают; «голые» HTML-атрибуты приводятся через transform.
- **breadcrumbs:** `RdxRovingFocusGroupDirective.orientation` — `computed`-сигнал, комбинирующий алиас input `orientation` и внутреннее переопределение `setOrientation()`, вызываемое `KbqBreadcrumbs` (заменяет сломанное присваивание `inject(...).orientation = 'horizontal'`).
- **navbar / navbar-ic / filter-bar / datepicker / timepicker / splitter:** прямые присваивания readonly signal-input (`this.arrow = false`, `this.offset = 0`, `this.popover.preventClose = true`, `tooltip.enterDelay = ...`, `this.ghost.visible = ...` и т. д.) приведены к `any`, чтобы сохранить текущее поведение в рантайме. Перевод этого состояния на записываемые сигналы запланирован как доработка.

### Инструменты

- `ng-packagr` → `^20.3.2`.
- `@angular-builders/jest` → `20.0.0`.
- `@angular-eslint/*` → `^20.7.0`.
- `@typescript-eslint/*` → `^8.59.3` (ESLint остаётся на `8.57.1`).
- `@schematics/angular` → `20.3.21` (был зафиксирован на `18.2.21`).
- `@angular-devkit/architect` → `0.2003.21`.
- В корне каждой библиотеки/приложения добавлены отдельные файлы `tsconfig.spec.json`, расширяющие конфиг из корня workspace; пути `test.options.tsConfig` в `angular.json` теперь разрешаются от корня проекта (требуется миграциями схематиков v20).
- Юнит-тесты схематиков обновлены под вывод `@schematics/angular:application` из v20 (имена файлов изменились с `app.component.html` → `app.html`).

### Удаление устаревших API

Удалены давно устаревшие символы. Для упрощённой миграции используйте `ng update @koobiq/components@20` (схематики — TBD, отслеживается как доработка).

#### Удалённые пакеты

- **`@koobiq/components/navbar-ic`** — пакет удалён целиком. Перейдите на `@koobiq/components/navbar` (`KbqNavbar`, `KbqNavbarItem`, `KbqNavbarModule`).
- **`@koobiq/components/risk-level`** — пакет удалён целиком. Перейдите на `@koobiq/components/badge` (`KbqBadge` с `[outline]` и `[badgeColor]`). Примечание: плотность по умолчанию и enum цветов у Badge отличаются — проверьте визуальное соответствие.
- **`@koobiq/components-experimental/form-field`** — подпакет удалён. Перейдите на `@koobiq/components/form-field`. Экспериментальный пакет был переходным форком и теперь влит обратно.

#### Удалённые символы из core

- enum `AnimationCurves` → используйте `KbqAnimationCurves`.
- enum `MeasurementSystem` → используйте `KbqMeasurementSystem`.
- интерфейс `SizeUnitsConfig` → используйте `KbqSizeUnitsConfig`.
- `KbqCommonModule`, `KBQ_SANITY_CHECKS`, `mcSanityChecksFactory` → больше не используются.
- `toBoolean()` → используйте `booleanAttribute` из `@angular/core`.
- `RdxAccordionItemState` → используйте `KbqAccordionItemState`.
- `KbqCodeFile` → используйте `KbqCodeBlockFile`.
- токен `KBQ_SIDEPANEL_WITH_SHADOW` → удалён.
- поле `KbqSidepanelConfig.requiredBackdrop` → удалено (используется единый общий backdrop).
- `formatDataSize()` → используйте `getFormattedSizeParts()`.
- перегрузка `getFormattedSizeParts(value, precision, system)` с 3 аргументами → используйте вариант с 2 аргументами `getFormattedSizeParts(value, system)`.
- токен `KBQ_VALIDATION` и интерфейс `KbqValidationOptions` → удалены вместе с устаревшим пайплайном валидации.
- `kbqDisableLegacyValidationDirectiveProvider()` — no-op заглушка, оставленная после удаления `KbqValidateDirective`, тоже удалена в v20.0.0. Запустите `ng update @koobiq/components@20`, чтобы автоматически убрать вызовы и импорт; схематик также пометит получившиеся пустые массивы `providers: []` для ручной очистки.

#### Удалённые методы / входные параметры компонентов

- `KbqAutocompleteTrigger.openPanel()` → используйте `open()`.
- `KbqClampedText.toggleIsCollapsed()` → используйте `toggle()`.
- input `KbqDivider.inset` → удалён.
- `KbqTagList`: `multiple`, `compareWith`, `emitOnTagChanges`, `orientation`, `selectionModel`, `tagChanges`, `setSelectionByValue()` — все не использовались, удалены.
- `KbqTagInput`: `countOfSymbolsForUpdateWidth`, `updateInputWidth()` — не использовались, удалены.
- `KbqFormField.canShowStepper` → используйте `hasStepper` (степпер всегда виден, если задан).
- input `KbqAppSwitcherTrigger.apps` → используйте `sites` с массивом из одного элемента.

#### Удалённая валидация

- **`KbqValidateDirective`** — устаревшая директива валидации удалена целиком. Новое поведение опирается исключительно на `ErrorStateMatcher`. Потребителям, полагавшимся на устаревший паттерн «показывать ошибки только после blur/submit», следует явно подключить `ShowOnSubmitErrorStateMatcher` (или аналогичный) через input `errorStateMatcher` или провайдер `ErrorStateMatcher`. Поведение «ленивой валидации» (не показывать required до submit) больше недоступно.

#### Удалённый API валидации file-upload

- интерфейсы `KbqInputFile`, `KbqInputFileLabel` — удалены.
- тип `KbqFileValidatorFn` → удалён.
- функция `isCorrectExtension()` → используйте `FileValidators.isCorrectExtension` (`ValidatorFn`).
- `KbqMultipleFileUploadComponent.errors`, `customValidation`, `hasErrors` → используйте `FormControl.errors` и валидаторы `FormControl`.
- `KbqSingleFileUploadComponent.errors`, `customValidation` → то же самое.

#### Удалённый API модальных окон

- `ModalOptions.kbqComponentParams` → используйте поле `data` + `inject(KBQ_MODAL_DATA)` в дочернем компоненте.
- `@Input` `KbqModalComponent.kbqComponentParams` → удалён.

#### Удалённый API filter-bar

- Output `KbqFilters.onSaveAsNew` → используйте `onSave` с `status === 'newFilter'`.
- **`KbqFilterBarSearch`** компонент (`<kbq-filter-search>`) — удалён. Используйте `<kbq-search-expandable [formControl]="searchControl" />`. Примечание: `kbq-search-expandable` требует привязки `FormControl`/`NgModel`.

#### Удалённые директивы form-field

- **`KbqDatepickerToggle`** компонент (`<kbq-datepicker-toggle>`) — удалён. Используйте `<kbq-datepicker-toggle-icon>` (`KbqDatepickerToggleIconComponent`).
- **`KbqFormFieldWithoutBorders`** директива (`<kbq-form-field kbqFormFieldWithoutBorders>`) — удалена. Используйте input `noBorders` у `KbqFormField`: `<kbq-form-field noBorders>`.

#### Удалённые триггеры-модификаторы tooltip

- Директивы **`KbqWarningTooltipTrigger`** (`[kbqWarningTooltip]`) и **`KbqExtendedTooltipTrigger`** (`[kbqExtendedTooltip]`) удалены. Используйте базовую директиву `[kbqTooltip]` с новым публичным input `kbqTooltipModifier`:

    ```html
    <!-- было -->
    <div #tooltip="kbqWarningTooltip" [kbqWarningTooltip]="msg" />
    <!-- стало -->
    <div #tooltip="kbqTooltip" kbqTooltipModifier="warning" [kbqTooltip]="msg" />
    ```

    Для расширенного варианта `[kbqTooltipHeader]` теперь также доступен на базовом триггере:

    ```html
    <!-- было -->
    <button [kbqExtendedTooltip]="content" [kbqTooltipHeader]="header"></button>
    <!-- стало -->
    <button kbqTooltipModifier="extended" [kbqTooltip]="content" [kbqTooltipHeader]="header"></button>
    ```

    Сеттеры `KbqDatepickerInput.kbqValidationTooltip` и `KbqTimepicker.kbqValidationTooltip` теперь принимают `KbqTooltipTrigger` (базовый класс) вместо `KbqWarningTooltipTrigger`.

### Миграция

Потребители могут запустить автоматическую миграцию:

```bash
ng update @koobiq/components@20
```

Она вызывает схематик `v20-upgrade`, который переписывает ваш код на месте:

- Импорты из `@koobiq/components/navbar-ic` / `risk-level` / `components-experimental/form-field` переназначаются на сохранившиеся пакеты (`navbar`, `badge`, `components/form-field`).
- Переименования идентификаторов в `.ts`-файлах (`KbqNavbarIc*` → `Kbq*`, `KbqRiskLevel*` → `KbqBadge*`, `KbqWarningTooltipTrigger` / `KbqExtendedTooltipTrigger` → `KbqTooltipTrigger`, `KbqDatepickerToggle` → `KbqDatepickerToggleIconComponent`, `KbqFilterBarSearch` → `KbqSearchExpandable`, `RdxAccordionItemState` → `KbqAccordionItemState`, `KbqCodeFile` → `KbqCodeBlockFile`, `AnimationCurves` → `KbqAnimationCurves`, `MeasurementSystem` → `KbqMeasurementSystem`, `SizeUnitsConfig` → `KbqSizeUnitsConfig`, `KbqFormFieldRef` → `KbqFormField`).
- Переименования токенов / функций (`toBoolean(` → `booleanAttribute(`, `isCorrectExtension(` → `FileValidators.isCorrectExtension(`, `formatDataSize(` → `getFormattedSizeParts(`, `kbqComponentParams:` → `data:`); удалённые токены `KBQ_VALIDATION`, `KBQ_SANITY_CHECKS`, `KBQ_SIDEPANEL_WITH_SHADOW` убраны из импортов.
- Переименования методов инстансов (`.openPanel(` → `.open(`, `.toggleIsCollapsed(` → `.toggle(`, `.focusViaKeyboard(` → `.focus(`).
- Селекторы в шаблонах (`<kbq-filter-search>` → `<kbq-search-expandable>`, `<kbq-datepicker-toggle>` → `<kbq-datepicker-toggle-icon>`, `<kbq-risk-level>` → `<kbq-badge>`, `<kbq-navbar-ic*>` → `<kbq-navbar*>`).
- Атрибуты в шаблонах (`kbqFormFieldWithoutBorders` → `noBorders`, `[kbqWarningTooltip]` → `kbqTooltipModifier="warning" [kbqTooltip]`, `[kbqExtendedTooltip]` → `kbqTooltipModifier="extended" [kbqTooltip]`, template-ref `="kbqWarningTooltip"` → `="kbqTooltip"`).
- CSS-классы в SCSS (`.kbq-risk-level` → `.kbq-badge`, `.kbq-navbar-ic` → `.kbq-navbar` и т. д.).

Схематик выводит предупреждения для структурных изменений, которые нельзя безопасно исправить автоматически:

- Слушатели `(onSaveAsNew)` у `<kbq-filters>` — перейдите на `(onSave)` и ветвитесь по `$event.status === 'newFilter'`.
- `[customValidation]` / `[errors]` у компонентов file-upload — используйте валидаторы `FormControl` / читайте `FormControl.errors`.
- `[apps]` у `<button kbqAppSwitcher>` — оберните в один сайт `[sites]="[{ id, name, apps }]"`.

После запуска схематика **проверьте диф перед коммитом**: миграция работает на регулярных выражениях и не переписывает значения в локальных переменных, ре-экспортах и алиасных импортах.
