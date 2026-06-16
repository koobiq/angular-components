Эти изменения вошли в **Koobiq v20.0.0** (2026-05-13) — переход на Angular 20. Пошаговый сценарий обновления описан в [гайде по миграции](/ru/main/migration); ниже — полный список ломающих изменений.

### Angular 20

**Angular 20**. Библиотека обновлена до Angular 20: requiredAngularVersion стал `^20.0.0`, все peerDependencies публикуемых пакетов нацелены на `^20.0.0`. Потребителям необходимо обновиться до Angular 20+. Минимальная версия Node.js — **24.16** и zone.js приведён в соответствие с peer-требованием Angular 20.

**Code block**. Устаревший input `canLoad` переименован в `canDownload`, а `codeFiles` — в `files`. Старые имена пока работают (помечены `@deprecated`), но будут удалены в следующем мажорном релизе. Схематик `v20-upgrade` автоматически переписывает привязки в шаблонах (`[canLoad]` → `[canDownload]`, `[codeFiles]` → `[files]`) и предупреждает о программном обращении к `.canLoad` / `.codeFiles`, которое нужно поправить вручную.

**Dropdown**. Код, наследовавший `KbqDropdownContent`, больше не получает `ComponentFactoryResolver` в конструкторе (удалён в Angular 20).

### Инструменты

Обновлены зависимости инструментов:

| Пакет                     | Версия    |
| ------------------------- | --------- |
| ng-packagr                | ^20.3.2   |
| @angular-builders/jest    | 20.0.0    |
| @angular-eslint/\*        | ^20.7.0   |
| @typescript-eslint/\*     | ^8.60.1   |
| ESLint                    | ^9.0.0    |
| @schematics/angular       | 20.3.27   |
| @angular-devkit/architect | 0.2003.27 |

В корне каждой библиотеки/приложения добавлены отдельные файлы **tsconfig.spec.json**, расширяющие конфиг из корня workspace. Пути **test.options.tsConfig** в angular.json теперь разрешаются от корня проекта (требуется миграциями схематиков v20).

Юнит-тесты схематиков обновлены под вывод **@schematics/angular:application** из v20 (имена файлов изменились с app.component.html → app.html).

### Удаление устаревших API

Удалены давно устаревшие символы. Для упрощенной миграции используйте `ng update @koobiq/components@20` (вызывает схематик `v20-upgrade`).

#### Пакеты

**Navbar IC**. Пакет @koobiq/components/navbar-ic удален целиком — перейдите на @koobiq/components/navbar (KbqNavbar, KbqNavbarItem, KbqNavbarModule).

**Risk level**. Пакет @koobiq/components/risk-level удален целиком — используйте @koobiq/components/badge (KbqBadge с `[outline]` и `[badgeColor]`); обратите внимание, что плотность по умолчанию и enum цветов у Badge отличаются — проверьте визуальное соответствие.

**Form field (experimental)**. Подпакет @koobiq/components-experimental/form-field удален — перейдите на @koobiq/components/form-field; экспериментальный пакет был переходным форком и теперь влит обратно.

**CDK (Core)**. Пакет @koobiq/cdk удалён целиком; его утилиты a11y, keycodes и testing теперь находятся в @koobiq/components/core. Удалите @koobiq/cdk из package.json и импортируйте эти символы из @koobiq/components/core (схематик v20-upgrade переназначает импорты автоматически).

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

**Form field**. Свойство KbqFormField.canShowStepper заменено на `hasStepper` (степпер всегда виден, если задан).

**App switcher**. У триггера KbqAppSwitcherTrigger.apps заменен на `sites` с массивом из одного элемента.

#### Валидация

Директива **KbqValidateDirective** удалена целиком. Новое поведение опирается исключительно на **ErrorStateMatcher**. Потребителям, полагавшимся на устаревший паттерн «показывать ошибки только после blur/submit», следует явно подключить **ShowOnSubmitErrorStateMatcher** (или аналогичный) через инпуты **errorStateMatcher** или провайдер **ErrorStateMatcher**. Поведение «ленивой валидации» больше недоступно (не показывать required до submit).

#### API валидации File upload

- Интерфейсы KbqInputFile и KbqInputFileLabel удалены, тип KbqFileValidatorFn также удален.
- Функция isCorrectExtension() заменена на FileValidators.isCorrectExtension (тип ValidatorFn).
- `KbqMultipleFileUploadComponent`: удалены `errors`, `customValidation` и `hasErrors` — используйте `FormControl.errors` и валидаторы `FormControl`.
- KbqSingleFileUploadComponent: удалены errors и customValidation — то же самое.

#### API модальных окон

**ModalOptions.kbqComponentParams** заменяется полем **data** плюс **inject(KBQ_MODAL_DATA)** в дочернем компоненте. @Input KbqModalComponent.kbqComponentParams удален.

#### API Filter bar

**Filter bar**. Output KbqFilters.onSaveAsNew заменен на `onSave` с `status === 'newFilter'`. Компонент KbqFilterBarSearch `<kbq-filter-search>` удален — используйте `<kbq-search-expandable [formControl]="searchControl" />`; обратите внимание, что kbq-search-expandable требует привязки FormControl/NgModel.

#### Директивы Form field

Компонент KbqDatepickerToggle (`<kbq-datepicker-toggle>`) удален — используйте `<kbq-datepicker-toggle-icon>` (KbqDatepickerToggleIconComponent).

Директива KbqFormFieldWithoutBorders (`<kbq-form-field kbqFormFieldWithoutBorders>`) удалена — используйте input noBorders у KbqFormField: `<kbq-form-field noBorders>`.

#### Триггеры-модификаторы Tooltip

Директивы KbqWarningTooltipTrigger (`[kbqWarningTooltip]`) и KbqExtendedTooltipTrigger (`[kbqExtendedTooltip]`) удалены. Используйте базовую директиву `[kbqTooltip]` с новым публичным input `kbqTooltipModifier`:

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

| Старое имя                | Новое имя                        |
| ------------------------- | -------------------------------- |
| KbqNavbarIc\*             | KbqNavbar\*                      |
| KbqRiskLevel\*            | KbqBadge\*                       |
| KbqWarningTooltipTrigger  | KbqTooltipTrigger                |
| KbqExtendedTooltipTrigger | KbqTooltipTrigger                |
| KbqDatepickerToggle       | KbqDatepickerToggleIconComponent |
| KbqFilterBarSearch        | KbqSearchExpandable              |
| RdxAccordionItemState     | KbqAccordionItemState            |
| KbqCodeFile               | KbqCodeBlockFile                 |
| AnimationCurves           | KbqAnimationCurves               |
| MeasurementSystem         | KbqMeasurementSystem             |
| SizeUnitsConfig           | KbqSizeUnitsConfig               |
| KbqFormFieldRef           | KbqFormField                     |
| DropdownPositionX/Y       | KbqDropdownPositionX/Y           |

**Токены и функции**. Обновляются: toBoolean( → booleanAttribute(, isCorrectExtension( → FileValidators.isCorrectExtension(, formatDataSize( → getFormattedSizeParts(, kbqComponentParams: → data:;

Убираются из импортов удаленные токены: KBQ_VALIDATION, KBQ_SANITY_CHECKS, KBQ_SIDEPANEL_WITH_SHADOW

**Методы инстансов**. Обновляются: .openPanel( → .open(, .toggleIsCollapsed( → .toggle(, .focusViaKeyboard( → .focus(.

**Селекторы в шаблонах**. Обновляются: `<kbq-filter-search>` → `<kbq-search-expandable>`, `<kbq-datepicker-toggle>` → `<kbq-datepicker-toggle-icon>`, `<kbq-risk-level>` → `<kbq-badge>`, `<kbq-navbar-ic*>` → `<kbq-navbar*>`.

**Атрибуты в шаблонах**. Обновляются: `kbqFormFieldWithoutBorders` → `noBorders`, `[kbqWarningTooltip]` → `kbqTooltipModifier="warning" [kbqTooltip]`, `[kbqExtendedTooltip]` → `kbqTooltipModifier="extended" [kbqTooltip]`, template-ref `="kbqWarningTooltip"` → `="kbqTooltip"`.

**CSS классы в SCSS**. Обновляются: `.kbq-risk-level` → `.kbq-badge`, `.kbq-navbar-ic` → `.kbq-navbar` и т. д.

**Ручные исправления**. Схематик выводит предупреждения для структурных изменений, которые нельзя безопасно исправить автоматически: слушатели `(onSaveAsNew)` у `<kbq-filters>` нужно перевести на `(onSave)` с ветвлением по `$event.status === 'newFilter'`; атрибуты `[customValidation]` / `[errors]` у file-upload компонентов нужно заменить валидаторами `FormControl`; атрибут `[apps]` у `<button kbqAppSwitcher>` нужно обернуть в один сайт `[sites]="[{ id, name, apps }]"`.

**После миграции**. Проверьте диф перед коммитом: миграция работает на регулярных выражениях и не переписывает значения в локальных переменных, ре-экспортах и алиасных импортах.
