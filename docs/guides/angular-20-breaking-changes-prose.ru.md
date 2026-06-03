Эти изменения вошли в **Koobiq v20.0.0** (2026-05-13) — переход на Angular 20. Пошаговый сценарий обновления описан в [гайде по миграции](/ru/main/migration-prose); ниже — полный список ломающих изменений.

### Angular 20

**Angular 20**. Библиотека обновлена до Angular 20.3.21: requiredAngularVersion стал `^20.0.0`, все peerDependencies публикуемых пакетов нацелены на `^20.0.0`. Потребителям необходимо обновиться до Angular 20+. Минимальная версия Node.js — **20.19** (добавлено `"engines": { "node": ">=20.19" }`), zone.js понижен до `~0.15.1` в соответствии с peer-требованием Angular 20.

**Popup trigger**. Переведен на `Signal<T>` для enterDelay, leaveDelay, stickToWindow, container, hideWithTimeout, preventClose и arrow, чтобы существующие переопределения signal-input в подклассах проходили проверку типов. Потребители, читающие эти значения с инстанса триггера, должны вызывать их как сигналы (`.enterDelay()` и т. д.).

**Popover**. Сломанная в рантайме мутация `set trigger(value)` для hideWithTimeout/leaveDelay заменена на записываемые backing-сигналы; leaveDelay теперь computed-сигнал, комбинирующий пользовательский ввод и значение по умолчанию для hover-режима 500ms.

**Form field**. Ряд свойств возвращено к примитивам @Input — они конфликтуют с типами интерфейсов (CanUpdateErrorState, KbqFormFieldControl, KbqTagTextControl), ожидающими «сырые» значения. Привязки в шаблонах через алиасы остаются прежними. Затронуты следующие свойства:

- KbqInput.placeholder
- KbqInput.errorStateMatcher
- KbqInputPassword.placeholder
- KbqInputPassword.errorStateMatcher
- KbqTextarea.placeholder
- KbqTextarea.errorStateMatcher
- KbqSelect.errorStateMatcher
- KbqTagList.errorStateMatcher
- KbqTreeSelect.errorStateMatcher
- KbqSingleFileUploadComponent.errorStateMatcher
- KbqMultipleFileUploadComponent.errorStateMatcher
- KbqTagInput.placeholder/id

**Code block**. Поля softWrap, viewAll, canDownload, activeFileIndex стали model-сигналами (записываемые + bindable) — краткая запись без значения `<kbq-code-block canDownload>` больше не приводит к приведению типа, используйте `[canDownload]="true"`, `[activeFileIndex]="1"` и т. д.

**Textarea**. freeRowsHeight стал model-сигналом: краткая запись без значения не поддерживается, используйте `[freeRowsHeight]="160"`.

**Search expandable, DL, Radio, Checkbox, Toggle, Sidepanel**. Поля isOpened, vertical, name, id, sidepanelResult стали model-сигналами — внутри используйте `.set()` / `.update()`, двусторонняя привязка `[(x)]` снаружи работает.

**Modal**. Возвращены к обычным @Input/@Output в соответствии с ModalOptions компоненты (программный API через KbqModalService остается прежним):

- kbqOkText, 
- kbqOkType, 
- kbqRestoreFocus, 
- kbqCancelText, 
- kbqModalType, 
- kbqComponent, 
- kbqContent, 
- kbqComponentParams, 
- kbqFooter, 
- kbqWidth, 
- kbqSize, 
- kbqWrapClassName, 
- kbqClassName, 
- kbqStyle, 
- kbqTitle, 
- kbqCloseByESC, 
- kbqOnOk, 
- kbqOnCancel.

**Notification center, App switcher**. Удалены переопределения signal-input placement (конфликтовавшие с KbqPopUpTrigger.placement) — placement снова настраивается через паттерн геттера/сеттера @Input, делегирующий в super.updatePlacement(...). arrow в обоих теперь `Signal<boolean>` (соответствует новому контракту базового класса).

**Tabs**. KbqPaginatedTabHeader.disablePagination стал computed, комбинирующим пользовательский ввод с записываемым fallback, устанавливаемым сеттером vertical. KbqTabGroupComponent.animationDuration — computed, разрешающий пользовательский ввод → значение по умолчанию KBQ_TABS_CONFIG → '0ms'. KbqTabLink.disabled возвращен к обычному @Input (соответствует FocusableOption.disabled).

**Dropdown**. KbqDropdown.backdropClass возвращен к @Input в соответствии с интерфейсом KbqDropdownPanel; конструктор KbqDropdownContent больше не принимает ComponentFactoryResolver (удален в Angular 20).

**Input number**. Убрано приведение через `@Attribute('step' | 'big-step' | 'min' | 'max')` в конструкторе — те же значения по умолчанию задаются через `input(..., { transform: numberAttribute })`; привязки `[step]="..."` по-прежнему работают.

**Breadcrumbs**. RdxRovingFocusGroupDirective.orientation стал computed-сигналом, комбинирующим алиас input orientation и внутреннее переопределение setOrientation(), — это заменяет сломанное прямое присваивание `inject(...).orientation = 'horizontal'`.

**Navbar, Filter bar, Datepicker, Timepicker, Splitter**. Прямые присваивания readonly signal-input (`this.arrow = false`, `this.offset = 0`, `this.popover.preventClose = true`, `tooltip.enterDelay = ...`, `this.ghost.visible = ...` и т. д.) приведены к **any** для сохранения текущего поведения в рантайме; перевод на записываемые сигналы запланирован как доработка.

### Инструменты

Обновлены зависимости инструментов: 

| Пакет | Версия | Примечание |
|-------|--------|-----------|
| ng-packagr | ^20.3.2 | |
| @angular-builders/jest | 20.0.0 | |
| @angular-eslint/* | ^20.7.0 | |
| @typescript-eslint/* | ^8.59.3 | |
| ESLint | 8.57.1 | остается на текущей версии |
| @schematics/angular | 20.3.21 | было 18.2.21 |
| @angular-devkit/architect | 0.2003.21 | |

В корне каждой библиотеки/приложения добавлены отдельные файлы **tsconfig.spec.json**, расширяющие конфиг из корня workspace. Пути **test.options.tsConfig** в angular.json теперь разрешаются от корня проекта (требуется миграциями схематиков v20). 

Юнит-тесты схематиков обновлены под вывод **@schematics/angular:application** из v20 (имена файлов изменились с app.component.html → app.html).

### Удаление устаревших API

Удалены давно устаревшие символы. Для упрощенной миграции используйте `ng update @koobiq/components@20` (схематики — TBD, отслеживается как доработка).

#### Пакеты

**Navbar IC**. Пакет @koobiq/components/navbar-ic удален целиком — перейдите на @koobiq/components/navbar (KbqNavbar, KbqNavbarItem, KbqNavbarModule).

**Risk level**. Пакет @koobiq/components/risk-level удален целиком — используйте @koobiq/components/badge (KbqBadge с `[outline]` и `[badgeColor]`); обратите внимание, что плотность по умолчанию и enum цветов у Badge отличаются — проверьте визуальное соответствие.

**Form field (experimental)**. Подпакет @koobiq/components-experimental/form-field удален — перейдите на @koobiq/components/form-field; экспериментальный пакет был переходным форком и теперь влит обратно.

#### Символы из Core

**Enums и interfaces**. Enum `AnimationCurves` удален (используйте KbqAnimationCurves), enum `MeasurementSystem` удален (используйте KbqMeasurementSystem), интерфейс `SizeUnitsConfig` удален (используйте KbqSizeUnitsConfig). Символы KbqCommonModule, KBQ_SANITY_CHECKS и mcSanityChecksFactory больше не используются и удалены.

**Функции преобразования**. Функция toBoolean() заменена на booleanAttribute из @angular/core. Функция formatDataSize() заменена на getFormattedSizeParts(); перегрузка с тремя аргументами (value, precision, system) заменена двухаргументной (value, system).

**Состояния и компоненты**. Символ RdxAccordionItemState заменен на KbqAccordionItemState, KbqCodeFile — на KbqCodeBlockFile.

**Токены и конфигурация**. Токен KBQ_SIDEPANEL_WITH_SHADOW удален, поле KbqSidepanelConfig.requiredBackdrop тоже удалено (используется единый общий backdrop).

**Валидация**. Токен KBQ_VALIDATION и интерфейс KbqValidationOptions удалены вместе с устаревшим пайплайном валидации. Функция kbqDisableLegacyValidationDirectiveProvider() — no-op заглушка, оставленная после удаления KbqValidateDirective, — тоже удалена в v20.0.0; запустите `ng update @koobiq/components@20`, чтобы автоматически убрать вызовы и импорт; схематик также пометит получившиеся пустые массивы `providers: []` для ручной очистки.

#### Методы и входные параметры компонентов

**Autocomplete trigger**. Метод KbqAutocompleteTrigger.openPanel() заменен на open().

**Clamped text**. Метод KbqClampedText.toggleIsCollapsed() заменен на `toggle()`.

**Divider**. Input `KbqDivider.inset` удален.

**Tag list**. Удалены все неиспользуемые поля и методы: multiple, compareWith, emitOnTagChanges, orientation, selectionModel, tagChanges, setSelectionByValue().

**Tag input**. Удалены countOfSymbolsForUpdateWidth и updateInputWidth().

**Form field**. Метод KbqFormField.canShowStepper заменен на `hasStepper` (степпер всегда виден, если задан).

**App switcher**. У триггера KbqAppSwitcherTrigger.apps заменен на `sites` с массивом из одного элемента.

#### Валидация

Директива **KbqValidateDirective** удалена целиком. Новое поведение опирается исключительно на **ErrorStateMatcher**. Потребителям, полагавшимся на устаревший паттерн «показывать ошибки только после blur/submit», следует явно подключить **ShowOnSubmitErrorStateMatcher** (или аналогичный) через инпуты **errorStateMatcher** или провайдер **ErrorStateMatcher**. Поведение «ленивой валидации» больше недоступно (не показывать required до submit).

#### API валидации File upload

- Интерфейсы KbqInputFile и KbqInputFileLabel удалены, тип KbqFileValidatorFn также удален. 
- Функция isCorrectExtension() заменена на FileValidators.isCorrectExtension (тип ValidatorFn).
- 'KbqMultipleFileUploadComponent: удалены errors, customValidation и hasErrors — используйте FormControl.errors и валидаторы FormControl. 
- KbqSingleFileUploadComponent: удалены errors и customValidation — то же самое.

#### API модальных окон

**ModalOptions.kbqComponentParams** заменяется полем **data** плюс **inject(KBQ_MODAL_DATA)** в дочернем компоненте. @Input KbqModalComponent.kbqComponentParams удален.

#### API Filter bar

**Filter bar**. Output KbqFilters.onSaveAsNew заменен на `onSave` с `status === 'newFilter'`. Компонент KbqFilterBarSearch `<kbq-filter-search>` удален — используйте `<kbq-search-expandable [formControl]="searchControl" />`; обратите внимание, что kbq-search-expandable требует привязки FormControl/NgModel.

#### Директивы Form field

Компонент KbqDatepickerToggle (`<kbq-datepicker-toggle>`) удален — используйте `<kbq-datepicker-toggle-icon>` (KbqDatepickerToggleIconComponent).

Директива KbqFormFieldWithoutBorders (`<kbq-form-field kbqFormFieldWithoutBorders>`) удалена — используйте input noBorders у KbqFormField: `<kbq-form-field noBorders>`.

#### Триггеры-модификаторы Tooltip

Директивы KbqWarningTooltipTrigger (`[kbqWarningTooltip]`) и KbqExtendedTooltipTrigger (`[kbqExtendedTooltip]`) удалены. Используйте базовую директиву `[kbqTooltip] с новым публичным input kbqTooltipModifier`:

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

**Datepicker, Timepicker**. Сеттеры KbqDatepickerInput.kbqValidationTooltip и KbqTimepicker.kbqValidationTooltip теперь принимают KbqTooltipTrigger (базовый класс) вместо KbqWarningTooltipTrigger.

### Миграция

**V20 upgrade**. Потребители могут запустить автоматическую миграцию с помощью команды `ng update @koobiq/components@20`. Она вызывает схематик `v20-upgrade`, который переписывает ваш код на месте.

**Импорты и пакеты**. Импорты из @koobiq/components/navbar-ic, risk-level и components-experimental/form-field переназначаются на сохранившиеся пакеты (navbar, badge, components/form-field).

**Идентификаторы в .ts файлах**. Переименованы идентификаторы: 

| Старое имя | Новое имя |
|-----------|-----------|
| KbqNavbarIc* | Kbq* |
| KbqRiskLevel* | KbqBadge* |
| KbqWarningTooltipTrigger | KbqTooltipTrigger |
| KbqExtendedTooltipTrigger | KbqTooltipTrigger |
| KbqDatepickerToggle | KbqDatepickerToggleIconComponent |
| KbqFilterBarSearch | KbqSearchExpandable |
| RdxAccordionItemState | KbqAccordionItemState |
| KbqCodeFile | KbqCodeBlockFile |
| AnimationCurves | KbqAnimationCurves |
| MeasurementSystem | KbqMeasurementSystem |
| SizeUnitsConfig | KbqSizeUnitsConfig |
| KbqFormFieldRef | KbqFormField |

**Токены и функции**. Обновляются: toBoolean( → booleanAttribute(, isCorrectExtension( → FileValidators.isCorrectExtension(, formatDataSize( → getFormattedSizeParts(, kbqComponentParams: → data:; 

Убираются из импортов удаленные токены: KBQ_VALIDATION,KBQ_SANITY_CHECKS, KBQ_SIDEPANEL_WITH_SHADOW

**Методы инстансов**. Обновляются: .openPanel( → .open(, .toggleIsCollapsed( → .toggle(, .focusViaKeyboard( → .focus(.

**Селекторы в шаблонах**. Обновляются: `<kbq-filter-search>` → `<kbq-search-expandable>`, `<kbq-datepicker-toggle>` → `<kbq-datepicker-toggle-icon>`, `<kbq-risk-level>` → `<kbq-badge>`, `<kbq-navbar-ic*>` → `<kbq-navbar*>`.

**Атрибуты в шаблонах**. Обновляются: `kbqFormFieldWithoutBorders` → `noBorders`, `[kbqWarningTooltip]` → `kbqTooltipModifier="warning" [kbqTooltip]`, `[kbqExtendedTooltip]` → `kbqTooltipModifier="extended" [kbqTooltip]`, template-ref `="kbqWarningTooltip"` → `="kbqTooltip"`.

**CSS классы в SCSS**. Обновляются: `.kbq-risk-level` → `.kbq-badge`, `.kbq-navbar-ic` → `.kbq-navbar` и т. д.

**Ручные исправления**. Схематик выводит предупреждения для структурных изменений, которые нельзя безопасно исправить автоматически: слушатели `(onSaveAsNew)` у `<kbq-filters>` нужно перевести на `(onSave)` с ветвлением по `$event.status === 'newFilter'`; атрибуты `[customValidation]` / `[errors]` у file-upload компонентов нужно заменить валидаторами `FormControl`; атрибут `[apps]` у `<button kbqAppSwitcher>` нужно обернуть в один сайт `[sites]="[{ id, name, apps }]"`.

**После миграции**. Проверьте диф перед коммитом: миграция работает на регулярных выражениях и не переписывает значения в локальных переменных, ре-экспортах и алиасных импортах.
