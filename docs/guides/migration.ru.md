## Как обновиться с Koobiq 17

Новые версии включают улучшения, но содержат **ломающие изменения**; их нужно применять постепенно.

### План обновления

1. **До 18.5.3**: безопасная база с обновлением темизации и иконок.
2. **18.6**: обновление токенов.
3. **18.22**: изменение атрибутов компонентов.
4. **20.0.0**: переход на Angular 20: удаление устаревших API и переименование пакетов.
5. **20.2.0**: переход API filter-bar на сигналы.
6. **21.0.0**: единый механизм ширины выпадающей панели.

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

**Code block**: устаревшие input `canLoad` / `codeFiles` переименованы в `canDownload` / `files`. Привязки в шаблонах схематик переписывает автоматически; программное обращение (`.canLoad`, `.codeFiles`) нужно поправить вручную.

### 5. Обновление filter-bar (20.2.0)

В версии 20.2.0 публичный API `KbqFilterBar` переведён на сигналы. Привязки в шаблонах (`[filter]`, `[(filter)]`, `[pipeTemplates]`) и вывод `(filterChange)` продолжают работать — ломается только программное чтение: теперь оно требует вызова.

| Параметр                                                                    | Было                    | Стало                                                       |
| --------------------------------------------------------------------------- | ----------------------- | ----------------------------------------------------------- |
| `filter`                                                                    | accessor                | `ModelSignal<KbqFilter \| null>` — запись через `.set(...)` |
| `pipeTemplates`                                                             | accessor                | `InputSignal<KbqPipeTemplate[]>`                            |
| `isChanged` / `isDisabled` / `isReadOnly` / `isSaved` / `isSavedAndChanged` | getter                  | `Signal<boolean>`                                           |
| `onChangePipe`                                                              | `EventEmitter<KbqPipe>` | `OutputEmitterRef<KbqPipe>`                                 |

#### Запуск миграции

Изменения применяет схематик `filter-bar-signals` (запускается автоматически):

```bash
ng update @koobiq/components@20
```

Или вручную — например, если вы уже обновились на 20.2.0. С предпросмотром без записи — `--fix=false`:

```bash
ng g @koobiq/components:filter-bar-signals --project <your project>
```

#### Что исправляется автоматически

**Чтение и запись в TypeScript** (для получателей с аннотацией типа `KbqFilterBar` / `KbqFilterBarHost`):

- filterBar.filter → filterBar.filter(),
- filterBar.filter = next → filterBar.filter.set(next),
- filterBar.filter?.name → filterBar.filter()?.name,
- this.filterBar.isChanged → this.filterBar.isChanged()

**Чтение через ссылку в шаблоне** (`#ref` на `<kbq-filter-bar>`, во внешних `.html` и в inline-шаблонах):

- ref.isChanged → ref.isChanged()

**Переименования:**

- KbqFilterBarRefresher → KbqFilterRefresher (старое имя пока ре-экспортируется как алиас, поэтому сборку не ломает)

Все замены идемпотентны — повторный запуск не удваивает вызов.

#### Что нужно поправить вручную

Схематик подсветит предупреждениями то, что нельзя переписать безопасно:

**KbqFilterBar.changes**: устарело → читайте `filterBar.filter()` внутри `effect(...)` или слушайте `(filterChange)`.

**KbqFilters.preparePopover()**: удалён → `openSaveAsNewFilterPopover()` / `openChangeFilterNamePopover()`.

**Запросы viewChild(KbqFilterBar)**: возвращают экземпляр компонента, поэтому чтение становится двойным вызовом — `this.filterBar().filter()`.

**KBQ_FILTER_BAR_PIPES**: теперь `Map<KbqPipeType, Type<KbqBasePipe>>` (был массив кортежей) → оберните записи в `new Map([...])`.

Схематик не покрывает следующие изменения — проверьте их самостоятельно:

**[filters] у kbq-filters**: input стал обязательным.

**KbqPipeState.state**: accessor → `InputSignal<T | null>` (важно для кастомных pipe).

**KbqPipeTreeSelectComponent**: удалены `template` и `filteredOptions`. У **KbqFilters** поля `popoverOffset` и `popoverSize` стали `protected`.

Получатели схематик определяет только по явной аннотации типа, поэтому алиасы (`const fb = this.filterBar; fb.filter`) остаются нетронутыми — их нужно поправить вручную.

### 6. Унификация ширины панели (21.0.0)

В версии 21.0.0 `autocomplete`, `select`, `tree-select`, `timezone` и `dropdown` начали вычислять ширину выпадающей панели одним общим механизмом. У всех них теперь одинаковый набор из трёх инпутов — `panelWidth`, `panelMinWidth` и `panelMaxWidth` — с одинаковым смыслом:

| `panelWidth`            | Ширина панели                                            |
| ----------------------- | -------------------------------------------------------- |
| не задан (по умолчанию) | по контенту, но не уже триггера и не уже `panelMinWidth` |
| `'auto'`                | по ширине триггера, но не уже `panelMinWidth`            |
| число или CSS-строка    | ровно это значение; `panelMinWidth` не применяется       |

Кроме того, панели теперь ограничены сверху **640px** через токен `--kbq-panel-size-width-max`. Потолок мягкий: он ограничивает рост панели по контенту, но никогда не делает её уже триггера и не обрезает явный `panelWidth`. Менять его можно глобально — задав токен на `:root`, по компоненту — через его собственный токен (`--kbq-dropdown-size-container-width-max` продолжает работать), или для отдельного экземпляра — через `panelMaxWidth`.

#### Запуск миграции

Схематик `autocomplete-panel-width-auto` запускается автоматически:

```bash
ng update @koobiq/components@21
```

Или вручную:

```bash
ng g @koobiq/components:autocomplete-panel-width-auto --project <your project>
```

#### Что исправляется автоматически

**`panelWidth="auto"` у `<kbq-autocomplete>`** → `panelWidth="fit-content"`. Раньше у autocomplete значение `auto` уходило в CSS как есть, и панель сжималась по контенту. Теперь оно означает «по ширине хоста» — как уже было у `kbq-select`. `fit-content` сохраняет прежнее поведение. Переписываются обе формы — статическая (`panelWidth="auto"`) и связанная (`[panelWidth]="'auto'"`); динамическое значение (`[panelWidth]="expr"`) пропускается с предупреждением.

`auto` по-прежнему проходит проверку типов и рендерится, просто панель раскладывается иначе — но это не единственное молчаливое изменение в релизе, см. пункт про `panelWidth={{0}}` ниже.

#### Что нужно исправить вручную

**`panelWidth`, `panelMinWidth` и `panelMaxWidth` стали сигнальными инпутами.** Чтение теперь требует вызова, а запись стала невозможна — это единственное изменение релиза без автоматического пути миграции, потому что записать в сигнальный инпут извне в рантайме нечем.

```ts
// Было
@ViewChild(KbqSelect) select: KbqSelect;
this.select.panelWidth = 'auto';
const w = this.select.panelWidth;

// Стало — привязывайте из шаблона
// <kbq-select [panelWidth]="panelWidth">
panelWidth: KbqPanelWidth = 'auto';
const w = this.select.panelWidth();
```

У `kbq-tree-select` это уже были сигналы, поэтому его изменение не касается. `KbqDropdownPanel.panelWidth` / `panelMinWidth` / `panelMaxWidth` по той же причине типизированы как `Signal<...>`.

**Панели больше не растут по контенту шире 640px.** У `kbq-select`, `kbq-tree-select` и `kbq-autocomplete` потолка не было вообще, поэтому панель с длинным текстом опций могла растягиваться сколь угодно широко — теперь она останавливается на 640px. Панелей, чья ширина берётся от триггера или из явного `panelWidth`, это не касается. Чтобы вернуть прежнее поведение, задайте `--kbq-panel-size-width-max: none` на `:root`, либо поднимите потолок для конкретного инстанса через `panelMaxWidth`.

**`panelWidth="auto"` у `kbq-select` и `kbq-tree-select`** больше не опускается ниже `panelMinWidth` (по умолчанию 200). Триггер уже 200px раньше давал панель ровно по ширине триггера, теперь — 200px. Если вы на это полагались, поставьте `panelMinWidth="0"`. Автоматической миграции для этого нет — затрагивает ли вас изменение, зависит от отрендеренной ширины триггера.

**`panelWidth={{0}}` у `<kbq-autocomplete>`** теперь трактуется как явно заданная ширина, а не как «не задано» — панель рендерится ровно в `0px` вместо подстройки по контенту. Раньше `getOverlaySize()` проверял `panelWidth` на истинность, поэтому `0` попадал в ветку по контенту; `select`/`tree-select` уже считали `0` явной шириной до этого релиза, и теперь autocomplete с ними согласован. Это важно только если `panelWidth` привязан к выражению, которое может вернуть `0` (у буквального `panelWidth="0"` нет осмысленного применения); схематик это не переписывает, так как зависит от значения в рантайме, а не от статического атрибута в шаблоне.

**У `kbq-timezone-select` больше нет собственных дефолтов ширины.** Он объявлял `panelWidth: 'auto'` и `panelMinWidth: 640` — оба переопределения удалены, поэтому теперь он наследует дефолты селекта: меню растёт по контенту, не бывает уже поля и уже 200px и останавливается на 640px. На практике панель раньше в точности совпадала с полем (минимум `640` не доходил до DOM между 20.0.0 и 20.1.0), так что видимое изменение — меню теперь расширяется под длинные названия таймзон. Чтобы вернуть прежнее поведение «по ширине поля», задайте `panelWidth="auto"`.

**`[panelMinWidth]="null"`** теперь сохраняет пол по ширине триггера. Раньше он давал невалидный `NaNpx`, который браузер отбрасывал, снимая все минимумы.

**`KbqDropdown.triggerWidth`** устарел и ни на что не влияет (его никто не читает с 20.0.0). Чтобы панель dropdown совпадала не с триггером, а с другим элементом, задайте `KbqDropdownTrigger.widthOrigin`. У `kbq-split-button` это делает `panelAutoWidth` — и теперь он работает, а раньше писал в `triggerWidth` и не делал ничего.

**Минимальная ширина `kbq-dropdown` теперь измеряется через `getBoundingClientRect()`** (полный border-box триггера) вместо `getComputedStyle().width` минус границы (старый, некорректно считавшийся content-box). У триггера с отступами или границей панель станет шире, чем раньше, ровно на эту величину; триггер без границ и отступов это не затрагивает.

### После миграции

Миграция работает на регулярных выражениях и не переписывает алиасные импорты, локальные переменные и ре-экспорты — **проверьте диф перед коммитом**, пересоберите проект и прогоните тесты. Полный список ломающих изменений — на странице [Ломающие изменения — Angular 20](https://github.com/koobiq/angular-components/blob/main/docs/guides/angular-20-breaking-changes.ru.md).
