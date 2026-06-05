## Как обновиться с Koobiq 17

Новые версии включают улучшения, но содержат **ломающие изменения**; их нужно применять постепенно.

### План обновления

1. **До 18.5.3**: безопасная база с обновлением темизации и иконок.
2. **18.6**: обновление токенов.
3. **18.22**: изменение атрибутов компонентов.
4. **20.0.0**: переход на Angular 20: удаление устаревших API и переименование пакетов.

### 1. Обновление до 18.5.3

```bash
npm install @koobiq/cdk@18.5.3
npm install @koobiq/components@18.5.3
npm install @koobiq/icons@^9.0.0
npm install @koobiq/design-tokens@~3.7.3
npm install @koobiq/angular-luxon-adapter@18.5.3
npm install @koobiq/date-adapter@^3.1.3
npm install @koobiq/date-formatter@^3.1.3
npm install luxon
npm install @messageformat/core
```

#### Новая темизация

Теперь темизация более простая и строится на основе CSS-переменных. [Темизация. Как использовать](https://koobiq.io/ru/main/theming/overview#как-использовать?).

Примеры:

- [apps/docs/src/main.scss](https://github.com/koobiq/angular-components/blob/main/apps/docs/src/main.scss)
- [apps/docs/src/styles/\_theme-kbq.scss](https://github.com/koobiq/angular-components/blob/main/apps/docs/src/styles/_theme-kbq.scss)

#### Обновление пакета иконок

Установите новую версию иконок:

```bash
npm install @koobiq/icons@9.1.0
```

Чтобы обновить названия иконок в шаблонах, используйте инструмент для обновления (схематик):

```bash
ng g @koobiq/angular-components:new-icons-pack --project <your project>
```

### 2. Обновление токенов (18.6.x)

Были удалены устаревшие токены цветов и переименованы токены параметров типографики.

Скрипт заменит названия классов и CSS-переменных на новые и подсветит места, где нужно удалить (заменить) устаревшие цвета:

```bash
ng g @koobiq/angular-components:css-selectors --fix=true --project <your project>
```

Для ручного контроля добавьте `--fix=false`. Скрипт подсветит места, где нужно удалить (заменить) цвета и названия типографики:

```bash
ng g @koobiq/angular-components:css-selectors --fix=false --project <your project>
```

### 3. Обновление атрибутов (18.22.0)

Изменились имена атрибутов компонентов:

- **KbqLoaderOverlay**: compact → size
- **KbqEmptyState**: big → size

Схематик автоматически заменит атрибуты:

```bash
ng g @koobiq/angular-components:loader-overlay-size-attr --project <your project>
ng g @koobiq/angular-components:empty-state-size-attr --project <your project>
```

### 4. Обновление до Angular 20

В версии 20.0.0 библиотека переведена на Angular 20. Это крупный релиз: удалены давно устаревшие API и переименована часть пакетов. Требования: **Angular 20+** и **Node.js ≥ 20.19**.

Удалите `@koobiq/cdk` из `package.json` — пакет был объединён с `@koobiq/components/core`.

#### Запуск миграции

Большую часть изменений применяет схематик `v20-upgrade` (запускается автоматически):

```bash
ng update @koobiq/components@20
```

Или вручную. С предпросмотром без записи — `--fix=false`:

```bash
ng g @koobiq/components:v20-upgrade --project <your project>
```

#### Что исправляется автоматически

**Перемещения пакетов:**

- @koobiq/components/navbar-ic → navbar
- risk-level → badge
- @koobiq/components-experimental/form-field → @koobiq/components/form-field
- @koobiq/cdk/{a11y,keycodes,testing} → @koobiq/components/core

**Классы, токены, функции:**

- KbqNavbarIc* → Kbq*,
- KbqRiskLevel* → KbqBadge*,
- toBoolean → booleanAttribute,
- formatDataSize → getFormattedSizeParts

**Методы инстансов:**

- .openPanel() → .open(),
- .toggleIsCollapsed() → .toggle(),
- .focusViaKeyboard() → .focus().

**Шаблоны:**

- kbq-filter-search → kbq-search-expandable,
- kbq-datepicker-toggle → kbq-datepicker-toggle-icon,
- kbqFormFieldWithoutBorders → noBorders,
- [kbqWarningTooltip] → kbqTooltipModifier="warning" [kbqTooltip].

**SCSS:**

- .kbq-risk-level → .kbq-badge,
- .kbq-navbar-ic → .kbq-navbar и др.

#### Что нужно поправить вручную

Схематик подсветит предупреждениями то, что нельзя переписать безопасно:

**(onSaveAsNew) у kbq-filters**: слушайте `(onSave)` и проверяйте `$event.status === 'newFilter'`.

**File upload**. Атрибуты `[customValidation]` и `[errors]` → валидаторы `FormControl` / `FormControl.errors`.

**App switcher**. `[apps]` → `[sites]="[{ id, name, apps }]"`.

**Валидация.** Удалены **KbqValidateDirective** и **kbqDisableLegacyValidationDirectiveProvider()** → используйте **ErrorStateMatcher** (например `ShowOnSubmitErrorStateMatcher`).

**Модалки**: ModalOptions.kbqComponentParams → поле data + inject(KBQ_MODAL_DATA).

**«Голый» атрибут больше не подвергается приведению типов**: `<kbq-code-block canDownload>` → `[canDownload]="true"`, `[freeRowsHeight]="160"`. Чтение enterDelay/arrow с инстанса триггера (tooltip/popover) → теперь вызовы сигналов: `trigger.enterDelay()`.

### После миграции

Миграция работает на регулярных выражениях и не переписывает алиасные импорты, локальные переменные и ре-экспорты — **проверьте диф перед коммитом**, пересоберите проект и прогоните тесты. Полный список ломающих изменений — на странице [Ломающие изменения — Angular 20](/ru/main/angular-20-breaking-changes-prose).
