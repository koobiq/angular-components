## Как обновиться с Koobiq 17

Новые версии включают улучшения, но содержат **ломающие изменения**; их нужно применять постепенно.

### План обновления

1. **До 18.5.3**: безопасная база с обновлением темизации и иконок.
2. **18.6**: обновление токенов.
3. **18.22**: изменение атрибутов компонентов.
4. **20.0.0**: переход на Angular 20: удаление устаревших API и переименование пакетов.
5. **20.2.0**: переход API filter-bar на сигналы.
6. **20.2.0**: единый механизм ширины выпадающей панели.
7. **20.3.0**: удаление механизма понижения оверлея.
8. **20.3.0**: переход API app-switcher на сигналы.
9. **20.3.0**: ревью кнопки — атрибуты хоста, владение в группе и стили.
10. **20.3.0**: поддерживаемые цвета кнопки — свой дефолтный цвет у каждого стиля.
11. **20.3.0**: ревью группы кнопок — ARIA-семантика, навигация с клавиатуры и сигнальные входы.
12. **20.3.0**: ревью поля формы — сигналы, доступность и удаление `mixinColor`.
13. **20.3.0**: ревью сервиса темизации — сигналы, режим `auto` и сохранение выбора из коробки.
14. **20.3.0**: явные prefix- и suffix-слоты для содержимого тегов.
15. **20.3.0**: устаревание overlayscrollbars-реализации Scrollbar.
16. **20.3.0**: типизация слоя локализации — типизированный `getParams`, частичные данные локали и сигналы.
17. **20.3.0**: `multiple` у списка и дерева стал обычным изменяемым input.
18. **20.3.0**: ревью компонентов — сокрытие внутренних членов, переход входов на сигналы и исправления поведения.
19. **20.3.0**: удаление устаревших событий file-upload `fileQueueChanged`/`fileQueueChange`.

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

Теперь темизация более простая и строится на основе CSS-переменных. [Темизация](https://koobiq.io/ru/main/theming/overview).

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

### 6. Унификация ширины панели (20.2.0)

В версии 20.2.0 `autocomplete`, `select`, `tree-select`, `timezone` и `dropdown` вычисляют ширину выпадающей панели через единый механизм. У всех теперь один набор из трех инпутов — `panelWidth`, `panelMinWidth` и `panelMaxWidth` — с одинаковым поведением:

| `panelWidth`            | Ширина панели                                                  |
| ----------------------- | -------------------------------------------------------------- |
| не задан (по умолчанию) | по содержимому, но не меньше ширины триггера и `panelMinWidth` |
| `'auto'`                | по ширине триггера, но не меньше `panelMinWidth`               |
| число или CSS-строка    | ровно это значение; `panelMinWidth` не применяется             |

Кроме того, панели ограничены сверху 640 px через токен `--kbq-panel-size-width-max`. Ограничение мягкое: оно сдерживает только рост по содержимому, не делает панель меньше ширины триггера и не уменьшает явно заданный `panelWidth`. Менять его можно глобально — задав токен на `:root`, по компоненту — через собственный токен (`--kbq-dropdown-size-container-width-max` продолжает работать) или для отдельного экземпляра — через `panelMaxWidth`.

#### Запуск миграции

Схематик `autocomplete-panel-width-auto` запускается автоматически:

```bash
ng update @koobiq/components@20
```

Или вручную:

```bash
ng g @koobiq/components:autocomplete-panel-width-auto --project <your project>
```

#### Что исправляется автоматически

**`panelWidth="auto"` у `<kbq-autocomplete>`** → `panelWidth="fit-content"`. Раньше у Autocomplete значение `auto` передавалось в CSS как есть, и панель сжималась по содержимому. Теперь оно означает «по ширине хоста» — как уже было у `kbq-select`. `fit-content` сохраняет прежнее поведение. Переписываются обе формы — статическая (`panelWidth="auto"`) и связанная (`[panelWidth]="'auto'"`); динамическое значение (`[panelWidth]="expr"`) пропускается с предупреждением.

`auto` по-прежнему проходит проверку типов и рендерится, но панель раскладывается иначе — и это не единственное тихое изменение в релизе, см. пункт про `panelWidth={{0}}` ниже.

#### Что нужно исправить вручную

**`panelWidth`, `panelMinWidth` и `panelMaxWidth` стали сигнальными инпутами.** Чтение теперь требует вызова, а запись невозможна — это единственное изменение релиза без автоматической миграции, потому что записать в сигнальный инпут извне в рантайме нельзя.

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

У `kbq-tree-select` это уже были сигналы, поэтому изменение его не затрагивает. `KbqDropdownPanel.panelWidth` / `panelMinWidth` / `panelMaxWidth` по той же причине типизированы как `Signal<...>`.

**Панели больше не растут по содержимому шире 640 px.** У `kbq-select`, `kbq-tree-select` и `kbq-autocomplete` потолка не было, поэтому панель с длинным текстом опций могла растягиваться сколь угодно широко — теперь она останавливается на 640 px. Панели, чья ширина задана триггером или явным `panelWidth`, это не затрагивает. Чтобы вернуть прежнее поведение, задайте `--kbq-panel-size-width-max: none` на `:root` либо поднимите потолок для отдельного экземпляра через `panelMaxWidth`.

**`panelWidth="auto"` у `kbq-select` и `kbq-tree-select`** больше не опускается ниже `panelMinWidth` (по умолчанию 200). У триггера шириной меньше 200 px панель раньше повторяла его ширину, теперь она 200 px. Если вы на это полагались, поставьте `panelMinWidth="0"`. Автоматической миграции для этого нет — затрагивает ли вас изменение, зависит от ширины триггера.

**`panelWidth={{0}}` у `<kbq-autocomplete>`** теперь трактуется как явно заданная ширина, а не как «не задано» — панель рендерится ровно в `0px` вместо подстройки по содержимому. Раньше `getOverlaySize()` проверял `panelWidth` на истинность, поэтому `0` попадал в ветку по содержимому; `select`/`tree-select` уже считали `0` явной шириной до этого релиза, и теперь Autocomplete с ними согласован. Это важно, только если `panelWidth` привязан к выражению, которое может вернуть `0` (у буквального `panelWidth="0"` нет осмысленного применения); схематик это не переписывает, так как зависит от значения в рантайме, а не от статического атрибута в шаблоне.

**У `kbq-timezone-select` больше нет собственных дефолтов ширины.** Он объявлял `panelWidth: 'auto'` и `panelMinWidth: 640` — оба переопределения удалены, поэтому теперь он наследует дефолты селекта: меню растет по содержимому, не бывает меньше ширины поля или 200 px и останавливается на 640 px. На практике панель раньше в точности совпадала с полем (минимум `640` не доходил до DOM между 20.0.0 и 20.1.0), так что видимое изменение — меню теперь расширяется под длинные названия таймзон. Чтобы вернуть прежнее поведение «по ширине поля», задайте `panelWidth="auto"`.

**`[panelMinWidth]="null"`** теперь сохраняет нижнюю границу по ширине триггера. Раньше он приводил к невалидному `NaNpx`, который браузер отбрасывал, снимая все минимумы.

**`KbqDropdown.triggerWidth`** устарел и ни на что не влияет (не используется с 20.0.0). Чтобы панель Dropdown совпадала не с триггером, а с другим элементом, задайте `KbqDropdownTrigger.widthOrigin`. У `kbq-split-button` это делает `panelAutoWidth` — и теперь он работает, а раньше писал в `triggerWidth` и ничего не делал.

**Минимальная ширина `kbq-dropdown` теперь измеряется через `getBoundingClientRect()`** (полный border-box триггера) вместо `getComputedStyle().width` минус границы (старый, некорректно считавшийся content-box). У триггера с отступами или границей панель станет шире, чем раньше, ровно на эту величину; триггер без границ и отступов это не затрагивает.

### 7. Удаление механизма понижения оверлея (20.3.0)

До 20.3.0 открытая панель `dropdown`, `select` или `popover` понижала **общий для всего приложения** `.cdk-overlay-container` с `z-index: 1000` до `999`, вешая на него класс `.cdk-overlay-container_dropdown`. Смысл был в том, чтобы при скролле панель уезжала под липкие `kbq-navbar` / `kbq-top-bar`. Инпут `KbqDropdownTrigger.demoteOverlay` отключал это для отдельного триггера, а маркерный токен `KBQ_DROPDOWN_HOST` — его предоставляли `KbqNavbar` и `KbqTopBar` — переключал значение по умолчанию в `false`, чтобы дропдаун внутри шапки не оказался за собственным триггером.

Механизм удалён целиком: инпут, токен, класс и правило в стилях. Он работал с контейнером, а не с отдельными оверлеями, поэтому не мог понизить одну панель, не понизив вместе с ней все остальные оверлеи — модалки, sidepanel'ы, тосты и тултипы, — и делал это от имени того компонента, который открылся первым.

**Теперь контейнер оверлеев всегда остаётся на `z-index: 1000`, поэтому панели показываются поверх `kbq-navbar` и `kbq-top-bar`, а не уезжают под них.**

#### Запуск миграции

Схематик `dropdown-demote-overlay` запускается автоматически:

```bash
ng update @koobiq/components@20
```

Или вручную:

```bash
ng g @koobiq/components:dropdown-demote-overlay --project <your project>
```

#### Что исправляется автоматически

**Атрибут `demoteOverlay` удаляется из шаблонов** во всех формах — `demoteOverlay`, `demoteOverlay="false"` и `[demoteOverlay]="expr"` — в `.html` и в инлайновых литералах `template:`.

К `.ts` шаблонные правила применяются только внутри инлайновых шаблонов, поэтому компонент-обертка, пробрасывающая инпут, сохраняет собственное поле:

```ts
// Было
@Component({
    template: `
        <button [kbqDropdownTriggerFor]="menu" [demoteOverlay]="demote">…</button>
    `
})
export class MyTrigger {
    @Input() demote = false;
}

// Стало — удаляется только привязка; `demote` остаётся мёртвым кодом, на который укажет компилятор
@Component({
    template: `
        <button [kbqDropdownTriggerFor]="menu">…</button>
    `
})
export class MyTrigger {
    @Input() demote = false;
}
```

**Элементы `{ provide: KBQ_DROPDOWN_HOST, … }` массива провайдеров удаляются** вместе со ставшим невалидным импортом `KBQ_DROPDOWN_HOST` и с массивом `providers`, если после удаления он остался пустым.

#### Что нужно исправить вручную

**Программное обращение к `demoteOverlay`.** Чтение или присваивание (`this.trigger.demoteOverlay = false`) не переписывается, а сопровождается предупреждением: удалять инструкцию не всегда безопасно, и компилятор всё равно на неё укажет. Отключать больше нечего — строку нужно удалить.

**Провайдеры, которые схематик не смог переписать.** Провайдер, объявленный вне массива провайдеров (`export const HOST_PROVIDER = { provide: KBQ_DROPDOWN_HOST, … };`), или вызов `inject(KBQ_DROPDOWN_HOST)` попадают в предупреждение об оставшемся `KBQ_DROPDOWN_HOST`. Их нужно убрать вручную.

**Правила `.cdk-overlay-container_dropdown` в ваших стилях** стали мертвыми — класс больше не проставляется. Об этом выводится предупреждение. Если правило было переопределением, отключавшим понижение, оно теперь просто не нужно.

**Панели, которые раньше уезжали под липкую шапку, теперь показываются поверх неё.** Если вы на это полагались, опустите свою шапку ниже z-index контейнера оверлеев (библиотека использует `$overlay-container-z-index: 1000`), а не пытайтесь вернуть понижение — оно опускало все оверлеи, а не только панель.

**Панели `kbq-select` и popover внутри `kbq-navbar` / `kbq-top-bar` этим релизом чинятся.** Они вешали понижение безусловно и не имели опции отключения, поэтому отрисовывались за той самой шапкой, внутри которой находились. Делать ничего не нужно — это баг, который удаление и устраняет.

### 8. Переход API app-switcher на сигналы (20.3.0)

В версии 20.3.0 у `KbqAppSwitcherTrigger` поля `selectedApp` и `selectedSite` перешли с обычного `@Input()` (и парного `output()`) на `model()`, а ревью компонента убрало несколько членов, которые ничего не делали. Привязки в шаблонах продолжают работать — `[selectedApp]`, `[(selectedSite)]` и `(selectedAppChange)` не изменились, — поэтому ломается только программное обращение и чтение через ссылочную переменную шаблона `#ref="kbqAppSwitcher"`.

| Член                                                                                | Было                  | Стало                                                                    |
| ----------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------ |
| `selectedApp`                                                                       | свойство `@Input()`   | `ModelSignal<KbqAppSwitcherApp \| undefined>` — запись через `.set()`    |
| `selectedSite`                                                                      | accessor              | `ModelSignal<KbqAppSwitcherSite \| undefined>` — **значение изменилось** |
| `selectedAppChange` / `selectedSiteChange`                                          | `output()`            | неявные выходы моделей выше                                              |
| `header` / `footer`                                                                 | свойства              | удалены                                                                  |
| `KbqAppSwitcherComponent.isTrapFocus` / `updateTrapFocus()`                         | публичный API         | удалены                                                                  |
| `KbqAppSwitcherDropdownApp.getIcon()`                                               | публичный метод       | удалён                                                                   |
| `KbqAppSwitcherListItem.collapsed`                                                  | свойство              | `ModelSignal<boolean>`                                                   |
| Инпуты `app` / `site` у `KbqAppSwitcherListItem` / `-DropdownApp` / `-DropdownSite` | необязательные инпуты | обязательные сигналы `input.required`                                    |

#### Запуск миграции

Изменения применяет схематик `app-switcher-signals` (запускается автоматически):

```bash
ng update @koobiq/components@20
```

Или вручную — например, если вы уже обновились до 20.3.0. Посмотреть без записи — `--fix=false`:

```bash
ng g @koobiq/components:app-switcher-signals --project <your project>
```

#### Что исправляется автоматически

**Чтения и записи в TypeScript** (для получателей с аннотацией `KbqAppSwitcherTrigger`):

- trigger.selectedApp → trigger.selectedApp(),
- trigger.selectedApp = app → trigger.selectedApp.set(app),
- trigger.selectedApp.name → trigger.selectedApp().name,
- trigger.selectedAppChange.subscribe(fn) → trigger.selectedApp.subscribe(fn) — `ModelSignal` реализует `OutputRef`, поэтому сигнатура подписки та же

**Чтения через ссылочную переменную шаблона** (`#ref="kbqAppSwitcher"`, во внешних `.html` и в инлайновых шаблонах):

- switcher.selectedApp → switcher.selectedApp()

Все замены идемпотентны: обращение, за которым уже идёт `()`, `.set`, `.update`, `.asReadonly` или `.subscribe`, не трогается, поэтому повторный запуск схематика не удваивает вызов.

Учтите, что `selectedApp()` имеет тип `KbqAppSwitcherApp | undefined`. Там, где старое свойство читалось без проверки на `undefined`, компилятор теперь попросит `!` или `?.` — сузить тип нужно вам.

#### Что нужно исправить вручную

Схематик выводит предупреждения на то, что нельзя переписать безопасно:

**`selectedSite` не переписывается, потому что изменилось его значение.** Старый геттер возвращал площадку с уже сгруппированными для отрисовки приложениями, модель возвращает то значение, которое в неё положили. Читайте `trigger.selectedSite()` для исходной площадки и `trigger.parsedSelectedSite()` для сгруппированной, а записывайте через `trigger.selectedSite.set(site)`. `selectedSiteChange` теперь неявный выход модели и тоже отдаёт исходную площадку.

**`selectedAppChange.emit(app)`**: больше не эмиттер → `trigger.selectedApp.set(app)`.

**`header` / `footer`**: удалены. Всплывающая панель их никогда не показывала: значение просто уезжало в оверлей и терялось — строку нужно удалить.

**`isTrapFocus` / `updateTrapFocus()`**: удалены из `KbqAppSwitcherComponent`. Его шаблон никогда не привязывал `[cdkTrapFocus]`, поэтому они ничего не делали.

**`KbqAppSwitcherDropdownApp.getIcon()`**: удалён. Инлайновую разметку очищает `KbqAppSwitcherIconSanitizer`, а отрисовывает сам компонент.

**Инлайновая разметка `icon` теперь очищается** по строгому списку разрешённых SVG-элементов: `<script>`, `<style>`, `<foreignObject>`, HTML-элементы, все обработчики `on*` и любые ссылки на внешние ресурсы удаляются, а разметка, которая меняет структуру при повторном разборе, отбрасывается целиком — тогда строка использует `iconSrc`. Проверьте иконки, которые на это полагаются; для иконок, приходящих с сервера, лучше использовать `iconSrc`.

Следующие изменения схематик не покрывает — проверьте их самостоятельно:

**`KbqAppSwitcherModule` больше не предоставляет `FocusTrapFactory` / `FOCUS_TRAP_INERT_STRATEGY`.** App-switcher никогда не отрисовывал focus trap, а эти провайдеры действуют на весь инжектор: они подменяли инертную стратегию CDK заглушкой для всех остальных focus trap в той же области. Если приложение на это полагалось, объявите их явно там, где они действительно нужны.

**`defaultGroupBy`** теперь идентифицирует синтетическую группу приложений по имени типа, а не пустым `id`.

**Всплывающая панель скрывается, когда уезжает за пределы предка, помеченного `kbq-hide-nested-popup`** (например, тела вкладки). Условие, которое раньше это подавляло, не выполнялось никогда, поэтому поведение фактически новое.

Схематик находит получателей только по явной аннотации типа, поэтому алиасы (`const t = this.trigger; t.selectedApp`) остаются нетронутыми — их нужно поправить вручную.

### 9. Ревью кнопки (20.3.0)

Ревью `[kbq-button]` изменило сразу три несвязанные вещи. Периода устаревания ни у одной из них нет — старое поведение просто исчезло, — но сборку ломает только одна.

**Атрибуты на хосте теперь выбираются по тегу.** До 20.3.0 отключённая кнопка рендерила `disabled` _и_ `aria-disabled="true"` независимо от того, чем был хост. На якоре `disabled` — невалидный атрибут, браузер его игнорировал, а `aria-disabled` на нативной `<button>` лишь повторял то, что уже сказано нативным атрибутом. Теперь каждый хост получает тот атрибут, который к нему применим:

| Хост                             | Было                                | Стало                                                          |
| -------------------------------- | ----------------------------------- | -------------------------------------------------------------- |
| `<button kbq-button [disabled]>` | `disabled` + `aria-disabled="true"` | `disabled`                                                     |
| `<a kbq-button [disabled]>`      | `disabled` + `aria-disabled="true"` | `aria-disabled="true"` + `tabindex="-1"` + `.kbq-disabled`     |
| `<button kbq-button>`            | `tabindex="0"`                      | без `tabindex` — нативная кнопка и так в порядке обхода        |
| `<a kbq-button>` без `href`      | без роли                            | `role="button"` — никуда не ведёт, поэтому объявляется кнопкой |

**Группа больше не перекрывает то, чем владеет кнопка.** `KbqButtonGroupRoot` пробрасывал свои `kbqStyle` и `color` во все вложенные кнопки при каждом обновлении, включая те, что задавали значения сами. Теперь такая кнопка считается владельцем, и группа её не трогает. `disabled` тоже стал аддитивным: отключение группы отключает всех детей, но обратное включение больше не включает кнопку, отключённую собственным инпутом. Геттер `disabled` возвращает `boolean | undefined` и остаётся `undefined`, пока инпут не привязан, — непривязанная группа ничего не включает принудительно.

**Стили.** Четыре физических миксина скругления заменены логическими, утилита `.kbq-progress` переехала в `kbq-core()`, и удалены две кастомные проперти, которые никто не читал.

#### Запуск миграции

Схематик `button-state-and-styles` запускается автоматически:

```bash
ng update @koobiq/components@20
```

Или вручную:

```bash
ng g @koobiq/components:button-state-and-styles --project <your project>
```

#### Что исправляется автоматически

**Удалённые миксины скругления переписываются.** `border-right-radius`, `border-left-radius`, `border-top-radius` и `border-bottom-radius` удалены из `core/styles/common/_groups-mixins.scss` и `core/styles/common/_groups.scss` (второй ре-экспортируется через `core/styles/common/_index.scss`). Непроверенные стили просто не соберутся — это единственное обязательное механическое изменение релиза:

```scss
// Было
@include border-right-radius(0);
@include groups-mixins.border-top-radius(var(--kbq-size-border-radius));

// Стало
@include border-inline-end-radius(0);
@include groups-mixins.border-block-start-radius(var(--kbq-size-border-radius));
```

Замена привязана к `@include`, поэтому настоящее CSS-свойство (`border-top-left-radius`), кастомная проперть (`--border-top-radius`) или комментарий со старым именем не трогаются.

**Это не просто переименование.** `border-inline-end-radius` следует за `dir`, поэтому при `dir="rtl"` скругляет те углы, которых `border-right-radius` не касался. Так и задумано — библиотека перевела на логические свойства и свои групповые стили, и отступы иконок, — но физически свёрстанный RTL-макет изменится.

#### Что нужно исправить вручную

**Кнопки, владеющие инпутом внутри группы**, выводятся с именем файла и номером строки. Схематик разбирает ваши шаблоны и сообщает о кнопке, только если она находится внутри группы _и_ задаёт собственные `kbqStyle`, `color` или `disabled`:

```html
<div kbqButtonGroupRoot [kbqStyle]="groupStyle">
    <button kbq-button [kbqStyle]="ownStyle">Сообщит — группа здесь больше не выигрывает</button>
    <button kbq-button>Не сообщит — по-прежнему наследует от группы</button>
</div>
```

Уберите привязку, если хотели значение группы, или оставьте, если хотели переопределение. Раньше возможны были оба прочтения — поэтому об этом сообщается, а не переписывается.

**Изменения API `KbqButtonGroupRoot` и `KbqButtonCssStyler`** выводятся предупреждениями. У группы `disabled` теперь `boolean | undefined`; у стайлера `nativeElement` стал `readonly`, а `icons` типизирован как `Signal<readonly KbqIcon[]>` вместо `readonly any[]` — присваивания и нетипизированный доступ перестанут компилироваться.

**Селекторы и проверки, построенные на атрибуте `disabled`.** `a[kbq-button][disabled]` теперь не срабатывает никогда — используйте `.kbq-disabled` или `[aria-disabled="true"]`. Селекторы на `<button kbq-button>` продолжают работать, но селектор по `aria-disabled` на нативной кнопке больше не сработает. Стили, где встречаются одновременно `kbq-button` и `[disabled]`, и TypeScript с вызовами `getAttribute('disabled')` / `hasAttribute('disabled')` выводятся предупреждениями.

**`.kbq-progress` эмитится только из `kbq-core()`.** Раньше правило приезжало трижды — из `button.css`, `toggle.css` и `dropdown-item.css`, — а теперь эмитится один раз, из готовой темы. Импорт `core/styles/common/animation` больше не отдаёт ни правило, ни keyframes: они живут в миксине `kbq-progress()`. Если вы подключаете готовую тему, всё уже на месте; если тянете CSS отдельных компонентов без темы — добавьте `@include animation.kbq-progress();`.

**Кастомные проперти `--kbq-button-icon-size-vertical-padding` и `--kbq-button-icon-size-content-padding` удалены.** Их никто не читал и до 20.3.0, так что переопределение и раньше ни на что не влияло — просто удалите его. Иконочные кнопки используют `--kbq-button-icon-size-horizontal-padding` и `--kbq-button-size-content-padding`.

**Кастомным данным локали нужна секция `a11y`.** В данные локали добавлены доступные имена встроенных иконочных кнопок — крестики modal, popover, sidepanel, content panel и центра уведомлений, навигация календаря, сохранение и отмена в inline-edit. Данные, зарегистрированные через `KBQ_LOCALE_DATA` или `addLocale()` без этой секции, откатятся на строки ru-RU. Добавьте секцию либо передайте `kbqA11yLocaleConfigurationProvider(...)`.

**Снапшоты и тесты, ищущие узлы в DOM.** Помимо таблицы атрибутов выше: каждый `[kbqDropdownTriggerFor]` теперь рендерит `aria-expanded`, а встроенные иконочные кнопки — локализованный `aria-label`. Это добавления, а не удаления, но разметка меняется.

**Предупреждение в dev-режиме про безымянные иконочные кнопки.** Иконочная `[kbq-button]` без `aria-label`, `aria-labelledby`, `title` и текста теперь пишет предупреждение в консоль в dev-сборке. Это только диагностика, ничего не ломается, — но указывать оно будет на ваши кнопки, потому что иконка не даёт доступного имени.

### 10. Поддерживаемые цвета кнопки (20.3.0)

`color` у кнопки принимал любое значение `KbqComponentColors` / `ThemePalette`, но `kbq-button-theme()` описывал только те пары, которые определены в дизайн-системе:

| `kbqStyle`    | Поддерживаемые цвета          |
| ------------- | ----------------------------- |
| `filled`      | `contrast`, `contrast-fade`   |
| `outline`     | `theme-fade`, `contrast-fade` |
| `transparent` | `theme`, `contrast`           |

Под любую другую комбинацию не подходило ни одно правило, и кнопка проваливалась в оформление браузера — серую системную кнопку. Заметнее всего это было на `transparent` без явного цвета: общий дефолт был `contrast-fade`, а он не входит в две пары, которые описывал прозрачный блок.

Теперь у каждого стиля свой дефолтный цвет, у каждого стиля появилось безусловное запасное правило, а `color` сужен до четырёх значений. `transparent` по умолчанию — `contrast`, а не `contrast-fade`: он не красит ни заливку, ни границу, поэтому цвет выбирает только текст, и «выцветшего» прозрачного варианта в дизайн-системе нет.

#### Запуск миграции

Схематик `button-supported-colors` запускается автоматически:

```bash
ng update @koobiq/components@20
```

Или вручную:

```bash
ng g @koobiq/components:button-supported-colors --project <your project>
```

#### Что исправляется автоматически

**Неподдерживаемый цвет, записанный литералом, удаляется** с хостов `[kbq-button]`, `kbq-button-group`, `[kbqButtonGroupRoot]` и `kbq-split-button`. Обрабатываются формы `color="error"`, `[color]="'error'"` и `bind-color="'error'"` со значениями `error`, `warning`, `success`, `empty`, `primary`, `secondary`, `info`:

```html
<!-- Было -->
<button kbq-button color="error">Удалить</button>

<!-- Стало -->
<button kbq-button>Удалить</button>
```

**Вид при этом не меняется.** Кнопка и раньше рисовалась дефолтным цветом своего стиля: под неподдерживаемый цвет не подходило ни одно правило темы, а новое безусловное правило даёт ровно те же токены, что и ветка дефолтного цвета. Удаляется значение, которое ни на что не влияло, — и вместе с ним ошибка типов.

#### Что нужно исправить вручную

**Цвет из члена перечисления** — `[color]="colors.Error"` — выводится с именем файла и номером строки, но не переписывается: выражение не разрешается, поэтому по одному имени члена нельзя доказать, из какого оно перечисления. Уберите привязку, чтобы остаться на дефолте стиля, либо выберите поддерживаемый цвет. Так же сообщается о программных присваиваниях вида `button.color = KbqComponentColors.Error`.

**Поля, типизированные `KbqComponentColors` / `ThemePalette`.** Широкий тип больше не присваивается в `color` кнопки — сузьте до `KbqButtonColor`:

```ts
type Action = {
    style: KbqButtonStyleInput; // было KbqButtonStyles | string
    color: KbqButtonColor; // было KbqComponentColors
};
```

Отдельно проверьте значения, собираемые внутри функций обратного вызова `Array.from` / `map`: без аннотации возвращаемого типа член перечисления расширяется до всего перечисления и перестаёт присваиваться, даже если все значения поддерживаемые.

```ts
Array.from({ length: 3 }, (_, i): Action => ({ color: KbqComponentColors.ContrastFade, style: '' }));
```

**`kbqOkType`** у `KbqModalComponent` и `ModalOptions` сужен со `string` до `KbqButtonColor` — он задаёт цвет предопределённой кнопки OK.

**Стили, нацеленные на `.kbq-button_transparent.kbq-contrast-fade`**, выводятся предупреждением: селектор больше не срабатывает, потому что прозрачная кнопка теперь `contrast`. Нацельте его на `.kbq-contrast` — или удалите, если это был обходной путь для прозрачной кнопки, которая не оформлялась.

**Изменения без текстовой сигнатуры.** Прозрачная кнопка без явного цвета рисуется в `contrast` вместо `contrast-fade`, а геттер `color` возвращает соответственно. Пара «стиль + цвет», не определённая в дизайн-системе, рисуется дефолтом стиля вместо системной кнопки. `KbqButtonGroupRoot` больше не рассылает цвет, который ему не задавали, — каждая вложенная кнопка следует дефолту своего стиля; цвет, привязанный к группе, по-прежнему этот дефолт перекрывает.

### 11. Ревью группы кнопок (20.3.0)

Ревью `kbq-button-toggle` дало компоненту ту семантику, с которой он всегда себя вёл. Группа с одиночным выбором теперь объявляется как `radiogroup` из радиокнопок и управляется так же; группа с `multiple` — как `group` из кнопок-переключателей.

#### Что изменилось в разметке и на клавиатуре

| Место                                                  | Было                            | Стало                                                                                   |
| ------------------------------------------------------ | ------------------------------- | --------------------------------------------------------------------------------------- |
| `<kbq-button-toggle-group>`                            | нет роли, нельзя задать имя     | `role="radiogroup"`, либо `role="group"` с `multiple`; `aria-label` теперь озвучивается |
| `<kbq-button-toggle-group>`, одиночный выбор           | нет ориентации                  | `aria-orientation` вслед за `vertical`                                                  |
| внутренний `<button>`, одиночный выбор                 | нет роли и состояния            | `role="radio"` + `aria-checked`                                                         |
| внутренний `<button>`, `multiple` или отдельная кнопка | нет состояния                   | `aria-pressed`                                                                          |
| Tab в группе с одиночным выбором                       | каждая кнопка — точка табуляции | одна точка табуляции: выбранная кнопка либо первая доступная                            |
| стрелки                                                | ничего                          | перемещают фокус вместе с выбором; `Home`/`End` — к краям группы                        |

Раньше выбор читался только по классу `.kbq-selected`, которого вспомогательные технологии не видят. Разницу заметят тесты, которые считают точки табуляции, снимают разметку или управляют группой стрелками.

**Кнопке из одних иконок нужно имя.** `aria-label` и `aria-labelledby` стали входными параметрами `KbqButtonToggle` и передаются на внутреннюю кнопку. Кнопка, в которой нет ничего кроме иконок и у которой нет имени, выводит предупреждение в dev-сборке — это только диагностика, но она укажет на вашу разметку, потому что глиф иконки помечен `aria-hidden`.

**`[kbq-button]` больше не удаляет `role` с хоста, который не является ссылкой.** Привязка на хосте записывала `null` поверх того, что задал потребитель. Ссылок это не касается: `<a kbq-button>` без `href` по-прежнему объявляется как `role="button"`.

#### Запуск миграции

Изменения применяет схематик `button-toggle-signals-and-aria` (запускается автоматически):

```bash
ng update @koobiq/components@20
```

Или вручную:

```bash
ng g @koobiq/components:button-toggle-signals-and-aria --project <your project>
```

#### Что исправляется автоматически

**Чтение двух входов, ставших сигналами** — у получателей с аннотацией типа `KbqButtonToggleGroup` и через ссылку `#ref="kbqButtonToggleGroup"` в шаблоне (во внешних `.html` и в inline-шаблонах):

- group.vertical → group.vertical(),
- group.multiple → group.multiple()

Получатели определяются в пределах файла: распознаются явная аннотация типа, импорт под алиасом (`KbqButtonToggleGroup as Group`) и инициализатор `viewChild()` / `contentChild()` / `inject()`, а вложенное объявление с тем же именем перекрывает группу и не переписывается как она. Остаётся получатель, тип которого объявлен в другом файле (`const g = this.group; g.multiple`), — о нём схематик сообщает отдельно. Все замены идемпотентны — повторный запуск не удваивает вызов.

**Кнопки из одних иконок без доступного имени перечисляются с номером строки.** В список попадает каждый `<kbq-button-toggle>`, в содержимом которого есть иконка и нет ни одного текста, и у которого нет `aria-label` / `aria-labelledby`. `title` не считается: он остаётся на `<kbq-button-toggle>`, тогда как доступное имя вычисляется для внутренней `<button>`, и атрибут до неё не доходит. Текст схематик придумать не может, но находит места, где сработает новое dev-предупреждение.

#### Что нужно исправить вручную

**`vertical` и `multiple` — сигнальные входы.** Привязки в шаблонах не меняются, чтение и запись из кода — меняются:

К чтению добавляется вызов, а записи деваться некуда: у `input()` нет `.set()` — привяжите вход в шаблоне и меняйте привязанное значение:

```ts
// Было
group.vertical = true;
if (group.multiple) { ... }

// Стало
this.isVertical = true; // <kbq-button-toggle-group [vertical]="isVertical">
if (group.multiple()) { ... }
```

**`emitChangeEvent()` принимает кнопку, с которой пришло изменение.** Раньше источник брался из выборки, а она пуста сразу после того, как в группе с `multiple` снята последняя выбранная кнопка, — `KbqButtonToggleChange.source` оказывался `undefined` вопреки собственному типу. Теперь группа передаёт кнопку, с которой было взаимодействие; собственный вызов нужно поправить так же:

```ts
// Было
group.emitChangeEvent();

// Стало
group.emitChangeEvent(toggle);
```

**Члены, которые не должны были быть публичными, удалены или сужены.** `buttonToggleGroup` стал `protected` (он был объявлен non-null, хотя для отдельной кнопки равен `null`), `icons` — приватным, а неиспользуемый view-запрос `mcButton` удалён. Используйте `focus()`, который теперь ставит фокус на внутреннюю кнопку, а не на хост, который фокус не принимает, либо новый `focusViaKeyboard()`.

**`type` и `iconType` стали getter-ами только для чтения**, а `type` теперь следует за `multiple` во время работы, а не фиксируется в `ngOnInit`.

**Типы уточнены.** `selected` — `KbqButtonToggle | KbqButtonToggle[] | null`, `buttonToggles()` — `readonly KbqButtonToggle[]`, `onTouched` и `registerOnTouched` принимают `() => void`, а `KBQ_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR` объявлен как `Provider`. `value` остался `any`.

**`disabled` у отдельной кнопки — настоящий `boolean`.** Раньше он возвращал ненайденную группу, то есть `null`, если сама кнопка не была отключена. Значение ложное в обоих случаях, но проверки `=== false` и `typeof` вели себя по-разному.

**`tabIndex` по умолчанию `null`**, а не `undefined` — как и было записано в его типе.

**Библиотека больше не вызывает `markForCheck()` у кнопки.** Кнопка выводит `checked` и `disabled` из сигналов группы и перерисовывается сама. Метод оставлен для обратной совместимости.

**`value`, которому не соответствует ни одна кнопка, сохраняется, а не отбрасывается.** Раньше группа сообщала только то, что выбрано, поэтому значение, присвоенное до того, как кнопки отрисованы, — или указывающее на кнопку, которая так и не появится, — возвращалось наружу пустой выборкой, затирая модель `[(value)]` и оставляя `NG0100`. Теперь присвоенное значение остаётся тем, что группа сообщает, пока его не заберёт кнопка, — тот же контракт, что описан у `KbqRadioGroup`, — а значит, оно применяется к кнопке, отрисованной позже:

```html
<!-- `group.value` равно 'blue' с самого начала; кнопка забирает его, когда `show` станет true -->
<kbq-button-toggle-group [(value)]="colour">
    @if (show()) {
    <kbq-button-toggle [value]="'blue'">Blue</kbq-button-toggle>
    }
</kbq-button-toggle-group>
```

Отсюда следует, что `value` может указывать на кнопку, которой нет в `selected`: `selected` сообщает только существующие кнопки, поэтому пока значение ждёт свою кнопку, там остаётся `null` (или `[]`). Код, считавший `group.value` доказательством наличия выборки, должен проверять `group.selected`. Действие пользователя заменяет ожидающее значение — как и выход из выборки кнопки, которая его держала.

**`valueChange` больше не повторяет только что присвоенное значение.** Событие отправляется, когда значение группы действительно меняется, а не на каждую запись: присвоение того, что группа уже сообщает, или того, что она возвращает без изменений, не отправляет ничего. Именно это не даёт перезаписать двустороннюю привязку. Код, использовавший `(valueChange)` как признак «было присвоение», и тест, считающий отправки во время инициализации, нужно перепроверить — `(change)` по-прежнему отправляется на каждое действие пользователя.

**Группа реализует `OnDestroy` и больше не отправляет события после разрушения.** Выбранная кнопка планирует своё удаление из выборки в микрозадаче, которая раньше переживала группу и доходила до неё с `valueChange` уже после того, как вся группа была уничтожена. Теперь группа игнорирует такую запоздавшую синхронизацию. Тест, проверявший прежнюю отправку, и код, который на неё опирался при очистке после разрушенной группы, нужно перепроверить.

**Стили.** Цвет рамки при фокусе с клавиатуры задаёт только тема, из токена `--kbq-button-toggle-item-states-focused-outline`; структурные стили больше не объявляют его из сырого `--kbq-states-line-focus-theme`, поэтому переопределение токена компонента работает независимо от порядка импортов. Тема также перестала обращаться к классу `.kbq-icon-button`, который `KbqButton` никогда не выставлял, — вместо него используется `.kbq-button-icon`.

### 12. Ревью поля формы (20.3.0)

Ревью `<kbq-form-field>` завершило перевод контейнера и семейства подсказок на сигналы, дало иконочным «крестику» и переключателю пароля настоящую семантику кнопки и удалило устаревший `mixinColor`. Большая часть изменений ломает сборку, но часть, связанная с доступностью, меняет разметку молча.

**Контентные запросы и геттеры `has*` стали сигналами.** `control`, `stepper` и `connectionContainerRef` были сигналами и раньше — они не менялись; остальное переехало в этом релизе:

| Член                                                                                                    | Было               | Стало                    |
| ------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------ |
| `cleaner`, `passwordToggle`                                                                             | `T \| null`        | `Signal<T \| undefined>` |
| `hint`, `passwordHints`, `prefix`, `suffix`                                                             | `QueryList<T>`     | `Signal<readonly T[]>`   |
| `hasCleaner`, `hasHint`, `hasPasswordHint`, `hasPasswordToggle`, `hasPrefix`, `hasStepper`, `hasSuffix` | геттер             | `Signal<boolean>`        |
| `hasError`, `hasLabel`, `hasReactivePasswordHint`                                                       | `protected` геттер | `protected` сигнал       |

**Инпуты подсказки стали сигналами.** `fillTextOff` и `compact` — теперь сигнальные инпуты у `KbqHint` и всего, что от него наследуется: `KbqError`, `KbqPasswordHint`, `KbqReactivePasswordHint`. `KbqPasswordHint.regex` стал `model()` — читается вызовом, пишется через `.set()`. Привязки в шаблоне (`[fillTextOff]`, `[compact]`, `[regex]`) не затронуты.

**«Крестик» и переключатель пароля теперь кнопки.** Оба были фокусируемыми картинками без роли и без доступного имени. `<kbq-cleaner>` рендерит `role="button"` и локализованный `aria-label` и срабатывает не только на <kbd>Enter</kbd>, но и на <kbd>Space</kbd>. Иконка переключателя рендерит `role="button"`, `aria-label`, зависящий от состояния («Показать пароль» / «Скрыть пароль»), и `aria-pressed`. Поскольку `aria-label` у «крестика» теперь задаётся привязкой на хосте, написанный вручную `[attr.aria-label]` перекрывается — его нужно перенести в новый инпут `[aria-label]`.

**Поле формы описывает свой контрол.** Подсказки и ошибка связаны с контролом через `aria-describedby`, `kbq-error` рендерит `role="alert"`, а `KbqInput` / `KbqInputPassword` / `KbqSelect` — `aria-invalid` (у `KbqSelect` ещё и `aria-required`). Сборку это не ломает — меняется разметка.

**`mixinColor` удалён.** Он был устаревшим, внутри библиотеки не использовался и на каждый экземпляр писал предупреждение в dev-режиме. Замена — `KbqColorDirective` с тем же инпутом `color`.

#### Запуск миграции

Схематик `form-field-signals` запускается автоматически:

```bash
ng update @koobiq/components@20
```

Или вручную:

```bash
ng g @koobiq/components:form-field-signals --project <your project>
```

#### Что исправляется автоматически

**Чтения переехавших членов становятся вызовами** — и в TypeScript, и через ссылочную переменную шаблона:

```ts
// Было
if (formField.hasCleaner && formField.hint.length && hint.fillTextOff) {
}

// Стало
if (formField.hasCleaner() && formField.hint().length && hint.fillTextOff()) {
}
```

```html
<!-- Было -->
<kbq-form-field #field="kbqFormField">…</kbq-form-field>
<span>{{ field.hasHint }}</span>

<!-- Стало -->
<span>{{ field.hasHint() }}</span>
```

Получатель определяется по явной аннотации типа (`KbqFormField`, `KbqHint`, `KbqError`, `KbqPasswordHint`, `KbqReactivePasswordHint`) — параметры, поля класса вместе с контентными запросами, параметры-свойства конструктора и типизированные локальные переменные.

**Записи в `KbqPasswordHint.regex` становятся `.set()`:** `hint.regex = /x/` → `hint.regex.set(/x/)`.

**Доступное имя «крестика» переезжает в инпут:** `<kbq-cleaner [attr.aria-label]="label" />` → `<kbq-cleaner [aria-label]="label" />`.

**Файл стилей с опечаткой переименован:** `_fiedset-theme.scss` стал `_fieldset-theme.scss`, поэтому `@use '…/form-field/fiedset-theme'` переписывается.

#### Что нужно исправить вручную

**API `QueryList` больше нет.** `hint`, `passwordHints`, `prefix` и `suffix` — сигналы над readonly-массивом, поэтому `.changes`, `.first`, `.last`, `.toArray()` и `.get(i)` отсутствуют. Реагируйте на запросы через `computed()` / `effect()` вместо подписки на `.changes`, а к элементам обращайтесь по индексу. Каждое вхождение выводится с именем файла.

**`cleaner` и `passwordToggle` возвращают `undefined`, а не `null`.** Строгое сравнение `=== null` молча перестаёт срабатывать — используйте проверку на истинность или `== null`.

**Присваивания в `fillTextOff` и `compact` больше не компилируются.** Это read-only сигнальные инпуты — задавайте их привязкой в шаблоне.

**Присваивания в контент-запросы `KbqFormField` тоже больше не компилируются** — `cleaner`, `passwordToggle`, `hint`, `passwordHints`, `prefix` и `suffix` стали read-only сигналами. `cleaner` был записываемым только из-за внутреннего костыля, которого больше нет, а остальные были `QueryList`, которому в тестах присваивали заглушку, чтобы подменить спроецированный контент. Проецируйте контент в поле формы вместо присваивания.

**`KbqPasswordHint.icon` стал `protected`.** Выводите состояние из `checked` / `hasError`, а не из имени иконки.

**`KBQ_FORM_FIELD_REF.control` типизирован.** Раньше это был `any`, поэтому `formField.control.placeholder` компилировался и молча давал `undefined` — ровно такая ошибка и была в самой библиотеке. Сначала вызывайте сигнал: `formField.control().placeholder`.

**Кастомным данным локали нужны ещё три ключа в `a11y`** — `clear`, `showPassword` и `hidePassword` — для доступных имён «крестика» и переключателя пароля. Литерал локали без них перестанет проходить проверку типов; данные, зарегистрированные через `KBQ_LOCALE_DATA`, откатятся на строки ru-RU.

**Движок правил `KbqPasswordHint` устарел.** `PasswordRules`, `regExpPasswordValidator` и `hasPasswordStrengthError` будут удалены в следующем мажорном релизе — переходите на `KbqReactivePasswordHint`, который выводит состояние из валидаторов контрола. `regExpPasswordValidator` к тому же типизирован как `Partial<Record<PasswordRules, RegExp>>`, поэтому индексация даёт `RegExp | undefined`; записей для `Length` и `Custom` в нём и не было.

**Три исправленные ошибки меняют поведение.** Провалившаяся проверка стойкости пароля вызывала `setErrors({ passwordStrength: true })`, стирая все остальные ошибки контрола, — теперь они объединяются. Подсказка с `PasswordRules.Length` сравнивала длину с `undefined`, поэтому пароль подходящей длины всегда считался неверным; границы теперь по умолчанию `0` и `Infinity`, а исключение бросается, только если не задан ни `min`, ни `max`. И подсказка теперь проверяет текущее значение контрола, а не ждёт, когда контрол окажется в фокусе со значением, отличным от последнего увиденного, — правило оставалось непроверенным для контрола, уже заполненного к моменту появления подсказки, то есть в обычной форме редактирования.

**Снапшоты и тесты, ищущие узлы в DOM.** Помимо ARIA-атрибутов выше, у генерируемого id `KbqPasswordHint` сменился префикс — с `kbq-hint-N` на `kbq-password-hint-N`, чтобы он перестал совпадать с `KbqHint`. Полагаться на генерируемый id не стоит, но селекторы по нему перестанут срабатывать.

**Стили, боровшиеся с `!important`.** `.kbq-form-field_no-borders` и `.kbq-form-field_in-overlay` использовали `!important`, чтобы перебить тему состояний; теперь они переопределяют токены `--kbq-form-field-*`. Итоговое значение то же, но переопределение, написанное специально ради победы над старым `!important`, можно упростить.

### 13. Ревью сервиса темизации (20.3.0)

`ThemeService` перешёл на сигналы, получил встроенный режим `auto`, следующий за темой ОС, и теперь сохраняет выбранный режим в `localStorage` из коробки. `ThemeService` продолжает работать под старым именем, а устаревшее поле `KbqTheme.selected` по-прежнему поддерживается в актуальном состоянии — ничего не сломается принудительно, но новый код стоит переводить на `KbqThemeService`.

**Теперь это `KbqThemeService`.** `ThemeService` экспортируется как `@deprecated`-алиас `KbqThemeService` и будет удалён в одном из будущих мажорных релизов. Схематика `ng update` для переименования нет — замените импорт, когда будет удобно.

**`current` (`BehaviorSubject<KbqTheme | null>`) устарел в пользу нескольких сигналов.** Он по-прежнему существует и остаётся синхронизирован, поэтому `current.value` и `current.pipe(...)` продолжают работать. `selection()` — сырое выбранное значение (`'auto'` либо имя конкретной темы); `auto()` — признак того, что сейчас выбран именно `'auto'`; `currentTheme()` — вычисленный объект `KbqTheme`, эквивалент `current.value`; `colorScheme()` — строго `'light' | 'dark'` полярность `currentTheme()`; используйте именно его, а не `name` темы, когда нужно узнать только светлая тема или тёмная (например, для CSS `light-dark()`).

```ts
// Было
themeService.current.pipe(map((theme) => theme?.className)).subscribe(...);

// Стало
themeService.currentTheme(); // читайте напрямую, либо оберните в toObservable(), если нужен поток
```

**`setTheme(index | theme)` устарел в пользу `selectTheme(name)`.** Выбор по индексу массива стал ненадёжным, как только `auto` перестал быть обычной зарегистрированной темой. `selectTheme(name)` выбирает любую зарегистрированную тему напрямую, включая встроенные `'light'`/`'dark'`; `setAuto()` и `toggle()` — два метода-помощника, оставленные для реально используемых в библиотеке случаев — `setLight()`/`setDark()` нет.

**Режим `auto` теперь обрабатывается внутри сервиса.** Если вы сами читали `window.matchMedia('(prefers-color-scheme: …)')` и переопределяли `className` темы, чтобы сымитировать пункт «как в системе» (как раньше делала дока), теперь вызывайте `themeService.setAuto()` и читайте `currentTheme()`/`colorScheme()` — слушатель ОС и обновление DOM теперь внутри сервиса.

**Сохранение выбора включено по умолчанию.** Выбор теперь сохраняется в `localStorage` (по умолчанию под ключом `kbq-theme-mode`) и восстанавливается при инициализации через токен `KBQ_THEME_STORE` — тот же паттерн подменяемого хранилища, что и у `KBQ_ACCORDION_STATE_STORE`. Если вы сохраняли выбор под другим ключом (как дока — под `docs_theme`), настройте `kbqThemeProvider({ storageKey: '…' })` вместо того, чтобы это убирать — так пользователи не потеряют сохранённые настройки, **если старое значение уже было именем режима или темы**. Если раньше вы хранили что-то другое (индекс, булево значение, …), напишите небольшой `KbqThemeStore`, оборачивающий `KbqThemeLocalStorageStore` и преобразующий результат `getSelection()` — пример такого подхода: `DocsThemeStore` в `apps/docs/src/app/services/theme-store.ts`. Также доступен `KbqThemeCookieStore` — для приложений с живым Angular SSR, которым нужно, чтобы уже первый серверный рендер учитывал сохранённый выбор посетителя; сначала прочитайте его doc-комментарий — для статически собранного сайта он не поможет.

**Кастомные темы и настройка через DI.** `setThemes()` по-прежнему принимает любой массив объектов `{ name, className, colorScheme? }` — `colorScheme` (`'light' | 'dark'`) необязателен: если задан, это собственная «полярность» темы, независимая от её `name`, и именно на неё опирается `colorScheme()` (а также `toggle()`); если не задан, `colorScheme()` для этой темы откатывается на предпочтение ОС. Новое: `kbqThemeProvider({ themes, mode, storageKey, autoLight, autoDark })` настраивает сервис через DI вместо императивных вызовов `setThemes()`/`setTheme()`. Активная тема всегда применяется как CSS-класс на `<body>` — от этого зависят стили `.kbq-light`/`.kbq-dark` дизайн-токенов, поэтому альтернативы через атрибут нет. `auto` разрешается в тему с именем `autoLight`/`autoDark` (по умолчанию `'light'`/`'dark'`) — задайте их, если ваш набор кастомных тем использует другие имена, иначе `auto` не совпадёт ни с одной зарегистрированной темой.

### 14. Явные слоты содержимого тегов (20.3.0)

До 20.3.0 каждый непосредственно спроецированный элемент с `kbq-icon` размещался перед текстом тега независимо от своего положения в шаблоне. Это неявное правило привязывало расположение иконок к селектору проекции компонента, поэтому разметку было легко сломать. Теперь у содержимого тега есть явные слоты `kbqTagPrefix` и `kbqTagSuffix`:

```html
<kbq-tag>
    <i kbqTagPrefix kbq-icon="kbq-circle-info_16"></i>
    Тег
    <i kbqTagSuffix kbq-icon="kbq-chevron-down-s_16"></i>
</kbq-tag>
```

`kbqTagRemove` и `kbqTagEditSubmit` уже являются suffix-контролами: `KbqTagSuffix` подключается к ним через `hostDirectives`. Не добавляйте `kbqTagSuffix` на тот же элемент явно, иначе директива будет применена дважды.

#### Запуск миграции

Схематик `tag-slots` запускается автоматически:

```bash
ng update @koobiq/components@20
```

Или вручную — например, если вы уже обновились до 20.3.0:

```bash
ng g @koobiq/components:tag-slots --project <your project>
```

Посмотреть изменения без записи можно с помощью `--fix=false`:

```bash
ng g @koobiq/components:tag-slots --project <your project> --fix=false
```

#### Что исправляется автоматически

Схематик добавляет `kbqTagPrefix` каждой непосредственно спроецированной legacy-иконке с `kbq-icon`, которая ещё не помещена в слот и не является контролом удаления или подтверждения редактирования:

```html
<!-- Было: иконка info отображалась перед текстом, несмотря на своё положение в исходном коде. -->
<kbq-tag>
    Тег
    <i kbq-icon="kbq-circle-info_16"></i>
    <i kbqTagRemove kbq-icon="kbq-xmark-s_16"></i>
</kbq-tag>

<!-- Стало: внешний вид сохраняется благодаря явному слоту. -->
<kbq-tag>
    Тег
    <i kbqTagPrefix kbq-icon="kbq-circle-info_16"></i>
    <i kbqTagRemove kbq-icon="kbq-xmark-s_16"></i>
</kbq-tag>
```

Положение в исходном коде не используется для определения suffix-слота: по старому правилу проекции все такие иконки были префиксами. Существующие атрибуты `kbqTagPrefix`, `kbqTagSuffix`, `kbqTagRemove` и `kbqTagEditSubmit` не изменяются, поэтому миграция идемпотентна.

#### Что нужно исправить вручную

**Намеренно замыкающий контент.** Добавьте `kbqTagSuffix` самостоятельно, если иконка или другой элемент должны располагаться после текста. Схематик не может определить новое визуальное намерение по разметке, в которой старое правило всегда размещало `kbq-icon` перед текстом.

**Контент вне старого селектора иконок.** Элементы только с `kbq-icon-button` или `kbq-icon-item`, вложенные пользовательские обёртки и узлы с `ngProjectAs` остаются без изменений, поскольку старый слот `kbq-icon` не находил их напрямую. Проверьте их только в том случае, если хотите перенести их в один из новых слотов.

**Standalone-импорты.** `KbqTagsModule` экспортирует обе slot-директивы. Если standalone-компонент импортирует `KbqTag` напрямую вместо модуля, при использовании слотов также импортируйте `KbqTagPrefix` и/или `KbqTagSuffix` — иначе их host-классы и отступы слотов не применятся.

<!-- cspell:ignore addClassModificatorForIcons -->

**Устаревшее императивное расположение и стили.** Замените вызовы `addClassModificatorForIcons()` явными slot-директивами, а пользовательские селекторы `.kbq-icon_left` — на `.kbq-tag-prefix`. Метод и старый селектор устарели и будут удалены в следующей мажорной версии.

### 15. Устаревание overlayscrollbars-реализации Scrollbar (20.3.0)

До 20.3.0 `@koobiq/components/scrollbar` оборачивал стороннюю библиотеку `overlayscrollbars`: компонент `KbqScrollbar` (`kbq-scrollbar` / `[kbq-scrollbar]`) и низкоуровневая директива `KbqScrollbarDirective` (`[kbqScrollbar]`) со входами `options`, `events`, `defer` и сырым доступом к `scrollbarInstance`.

В 20.3.0 `@koobiq/components/scrollbar` — это новый, не зависящий от сторонних библиотек компонент `KbqScrollbar` с селектором `<kbq-scrollbar>` и другим публичным API. Прежняя реализация никуда не делась — она переехала без изменений в `@koobiq/components/scrollbar/deprecated` и будет удалена в одном из будущих мажорных релизов.

#### Запуск миграции

Схематик `scrollbar-deprecated-path` запускается автоматически:

```bash
ng update @koobiq/components@20
```

Или вручную:

```bash
ng g @koobiq/components:scrollbar-deprecated-path --project <your project>
```

#### Что исправляется автоматически

**Путь импорта `@koobiq/components/scrollbar` заменяется на `@koobiq/components/scrollbar/deprecated`** — во всех `.ts`-файлах, в одинарных и двойных кавычках. Сама реализация и её публичный API (`options` / `events` / `defer` / `scrollbarInstance`, селекторы `kbq-scrollbar` / `[kbq-scrollbar]` / `[kbqScrollbar]`) не меняются — меняется только путь, откуда их импортировать.

```ts
// Было
import { KbqScrollbarModule } from '@koobiq/components/scrollbar';

// Стало
import { KbqScrollbarModule } from '@koobiq/components/scrollbar/deprecated';
```

#### Что нужно поправить вручную

**Переход на новую реализацию** — это отдельная, ручная миграция, а не просто смена пути импорта: новый компонент использует селектор `<kbq-scrollbar>`, а атрибутные селекторы `[kbq-scrollbar]` и `[kbqScrollbar]` не поддерживает. Его публичный API отличается от прежнего — подробности смотрите в [документации компонента Scrollbar](/ru/components/scrollbar).

**Не импортируйте старую и новую реализацию в одном standalone-компоненте одновременно.** Обе используют элементный селектор `kbq-scrollbar`, поэтому Angular не сможет однозначно выбрать компонент. При постепенном ручном переходе держите старое и новое использование в разных компонентах.

#### После перехода на новую реализацию

После полного перехода на новый компонент и удаления импортов из `@koobiq/components/scrollbar/deprecated` зависимость `overlayscrollbars` больше не нужна — её можно удалить:

```bash
npm uninstall overlayscrollbars
```

### 16. Типизация слоя локализации (20.3.0)

Слой локализации полностью типизирован, а строки всех локализованных компонентов проходят через один общий
механизм. Ничего не удалено, и ни одна сигнатура не сужена так, чтобы отвергнуть ранее компилировавшийся
код — раздел нужен, чтобы вы знали, что стало возможно и какие два сужения могут вскрыть уже существующую
ошибку в вашем коде.

**`getParams()` выводит тип секции.** Известное название секции возвращает её тип конфигурации вместо
`any`; строка, собранная динамически, по-прежнему возвращает `any`, поэтому существующие вызовы продолжают
работать.

```ts
const { selectAll } = localeService.getParams('select'); // KbqSelectLocaleConfiguration
localeService.getParams('selection'); // не секция - теперь ошибка компиляции
```

**Свои данные локали могут быть частичными.** `addLocale()` и `KBQ_LOCALE_DATA` принимают любое подмножество
`KbqLocaleData` и дополняют его из поставляемой локали с тем же идентификатором, а для нового
идентификатора — из `KBQ_DEFAULT_LOCALE_ID`. Больше не нужно повторять всю локаль ради одной строки, а
пропущенная секция не может появиться как `undefined` во время работы. Две прежние заметки о том, что своим
данным локали нужна секция `a11y`, больше неактуальны — недостающая секция подставляется автоматически.

**Сигналы рядом с observable.** К `changes` добавились `localeId()`, `data()` и `items()`, а
`params(section)` возвращает `Signal` одной секции. `changes` продолжает работать; `id` и `current`
объявлены устаревшими в пользу `localeId()` и `data()`. Используйте сигналы: чтение сигнала в шаблоне
регистрируется на читающем представлении, поэтому `setLocale()` доходит до `OnPush`-потомков, которые
подписка в родителе никогда не помечала как изменённые.

**Провайдеры конфигурации принимают частичный объект и теперь применяются поверх активной локали.**
`kbqA11yLocaleConfigurationProvider`, `kbqCodeBlockLocaleConfigurationProvider`,
`kbqClampedTextLocaleConfigurationProvider`, `kbqActionsPanelLocaleConfigurationProvider` и
`kbqTimeRangeLocaleConfigurationProvider` теперь принимают только те ключи, которые вы хотите изменить.
Раньше сервис локали имел приоритет над ними, поэтому в приложении, предоставляющем `KBQ_LOCALE_SERVICE`,
эти провайдеры игнорировались полностью; теперь переданные ключи накладываются на активную локаль и остаются
закреплёнными при вызове `setLocale()` во время работы, а не переданные — продолжают следовать за локалью.
Передача полного объекта по-прежнему работает и закрепляет секцию целиком.

**Токены конфигурации компонентов задают значения по умолчанию, а не переопределение.**
`KBQ_VERTICAL_NAVBAR_CONFIGURATION`, `KBQ_NOTIFICATION_CENTER_CONFIGURATION`,
`KBQ_APP_SWITCHER_CONFIGURATION`, `KBQ_SEARCH_EXPANDABLE_CONFIGURATION`, `KBQ_DATEPICKER_CONFIGURATION` и
`KBQ_FILTER_BAR_CONFIGURATION` раньше побеждали сервис локали. Теперь все эти компоненты читают общую
функцию `kbqInjectLocaleConfiguration`, где токен несёт значения по умолчанию, а побеждает активная локаль,
поэтому
`{ provide: KBQ_<X>_CONFIGURATION, useValue: … }` молча игнорируется в приложении, предоставляющем
`KBQ_LOCALE_SERVICE`. Замените его на соответствующий `kbq<X>LocaleConfigurationProvider(…)`, который
регистрирует настоящее переопределение, — `ng update` перепишет это за вас. Та же конверсия убрала из этих
компонентов член `externalConfiguration` и сделала `configuration` доступным только для чтения, а
`kbq-select`, `kbq-tree-select`, `kbq-tree-selection`, `kbq-timepicker`, `kbq-timezone-select` и числовой
инпут получили пару «токен и провайдер», которой у них не было. Попутно исправлено поведение: явная привязка
`[hiddenItemsText]` у `kbq-select` и `kbq-tree-select` больше не затирается следующим `setLocale()`.

**Названия типов приведены к виду `Kbq<X>LocaleConfiguration`.** Прежние имена —
`KbqAppSwitcherConfiguration`, `KbqClampedTextLocaleConfig`, `KbqTimeRangeLocaleConfig`,
`KbqNumberInputLocaleConfig`, `KbqNumberRoundingLocaleConfig`, `KbqFileUploadLocaleConfig`,
`KbqBaseFileUploadLocaleConfig` и `KbqMultipleFileUploadLocaleConfig` — сохранены как устаревшие
псевдонимы. Так же `kbqInjectKbqClampedLocaleConfiguration` стал `kbqInjectClampedTextLocaleConfiguration`,
старое имя сохранено.

**Два сужения, которые стоит проверить.** `KBQ_DATEPICKER_CONFIGURATION`,
`KBQ_VERTICAL_NAVBAR_CONFIGURATION`, `KBQ_NOTIFICATION_CENTER_CONFIGURATION` и
`KBQ_SEARCH_EXPANDABLE_CONFIGURATION` были `InjectionToken<unknown>`, а теперь несут свой настоящий тип,
поэтому предоставляемое для них значение впервые проверяется типами. А `defaultUnitSystem` в экспортируемых
константах `*FormattersData` теперь литерал `'SI'`, а не `string`; это затрагивает только код, который в
него присваивает.

#### Запуск миграции

Схематик `locale-configuration-providers` переписывает провайдеры конфигурации автоматически:

```bash
ng update @koobiq/components@20
```

Или вручную:

```bash
ng g @koobiq/components:locale-configuration-providers --project <your project>
```

Запустите его, даже если обновляетесь вручную: оставшийся `{ provide: KBQ_<X>_CONFIGURATION, useValue: … }`
молча игнорируется во время работы, а не сообщается как ошибка компиляции. Остальная часть этого раздела —
переименованные типы и два сужения — проявляется ошибками компиляции, сообщения которых сами называют
исправление.

### 17. Множественный выбор в списке и дереве (20.3.0)

До 20.3.0 `multiple` у `kbq-list-selection` и `kbq-tree-selection` был статическим host-атрибутом, который
читался один раз в конструкторе. Его нельзя было связать, режим оставался неизменным на всё время жизни
компонента, а любое значение, кроме `checkbox` и `keyboard`, проваливалось во множественный выбор с
чекбоксами — то есть `multiple="false"` означал _множественный_ выбор.

Теперь это обычный input с закрытым набором значений, и режим можно менять в любой момент:

| значение                                               | режим           |
| ------------------------------------------------------ | --------------- |
| `multiple="checkbox"`                                  | checkbox        |
| `multiple="keyboard"`                                  | keyboard        |
| `multiple`, `multiple="true"`, `[multiple]="true"`     | checkbox        |
| без атрибута, `multiple="false"`, `[multiple]="false"` | одиночный выбор |

Одиночный выбор — режим по умолчанию, поэтому просить о нём нужно отсутствием атрибута. Любое другое
значение, включая `multiple="single"`, понимается как одиночный выбор, а в dev-режиме о нём сообщается в
консоль — раньше такое значение включало множественный выбор.

#### Запуск миграции

Схематик `list-tree-multiple-input` запускается автоматически:

```bash
ng update @koobiq/components@20
```

Либо вручную:

```bash
ng g @koobiq/components:list-tree-multiple-input --project <your project>
```

#### Что исправляется автоматически

**`multiple="false"` и `multiple="single"`** → атрибут **удаляется**. Это единственная правка в этом
разделе, которая меняет поведение: оба написания раньше включали множественный выбор с чекбоксами, а теперь
означают одиночный — то же самое, что и отсутствие атрибута. Миграция исходит из того, что автор имел в виду
ровно то, что написал. О каждом удалении сообщается в выводе как о смене поведения — если множественный выбор был нужен,
верните `multiple="checkbox"`.

**Любое другое нераспознанное значение** (`multiple="multiple"`, `multiple="yes"`, `multiple="1"`, …) →
`multiple="checkbox"`: поведение сохраняется, поскольку любое такое значение раньше включало множественный
выбор. Обрабатываются и внешние `.html`, и inline-шаблоны; динамическая привязка `[multiple]="expr"`
пропускается с предупреждением.

#### Что нужно поправить вручную

**`multipleMode` стал парой геттер/сеттер**, а не обычным полем. Присваивание заново создаёт
`SelectionModel`, а не просто меняет название режима: CDK фиксирует множественность при создании модели, поэтому её приходится
заменять. У `kbq-tree-selection` внутри `kbq-tree-select` такое присваивание бросает
`getKbqTreeSelectionOwnedMultipleError`: селект делит модель с деревом и подписан именно на этот экземпляр,
поэтому число выбираемых узлов задаёт он. Задавайте `multiple` на селекте. Переключение только между
`checkbox` и `keyboard` там по-прежнему разрешено.

**Смена режима заменяет экземпляр `SelectionModel`**, поэтому код, который держит
`selectionModel.changed.subscribe(...)`, остаётся на выброшенной модели. Подписывайтесь на выход
`(selectionChange)` компонента — он переживает замену.

**У `kbq-tree-selection` форма значения следует за режимом**: скаляр при одиночном выборе, массив при
множественном. Так было и раньше, но режим нельзя было менять; теперь можно, поэтому вместе с ним меняется
и форма значения в форм-контроле. `kbq-list-selection` всегда отдаёт массив и не затронут.

**При переходе к одиночному выбору остаётся первая выбранная опция** в порядке отрисовки, остальные
снимаются: на каждую снятую приходит `selectionChange`, а укороченное значение уходит в форм-контрол.

### 18. Ревью компонентов (20.3.0)

В 20.3.0 полное ревью прошли десять компонентов: notification-center, popover, search-expandable, select, split-button, title, toast, tooltip, tree и tree-select. Каждое ревью закрывало члены, которые никогда не были частью контракта компонента, переводило входы на сигналы там, где в этом и был его смысл, и попутно исправляло найденные ошибки поведения. Ниже перечислено только то, что доходит до потребителя.

Все схематики, названные ниже, запускаются автоматически:

```bash
ng update @koobiq/components@20
```

Большинство из них не переписывают код, а сообщают о местах вызова: чем заменить удалённый член или сигнальный вход — привязкой в шаблоне, другим членом или ничем — это решение, которое схематик принять не может. В каждом подразделе ниже назван закрывающий его схематик и указано, что именно он меняет за вас, если меняет. Чтобы получить отчёт ещё раз, запустите нужный отдельно:

```bash
ng g @koobiq/components:<schematic-name> --project <your project>
```

#### Popover

Режим по наведению был сломан целиком из-за мёртвого выражения. `this.leaveDelay ?? 500` выглядит как значение по умолчанию, но базовый класс присваивает полю `0`, а `0 ?? 500` — это `0`. Панель закрывалась раньше, чем указатель успевал пересечь зазор в 8px до неё, задокументированное интерактивное содержимое было недостижимо даже для мыши, а таймер автоматического скрытия крутился как `interval(0)` всё время, пока панель открыта.

Теперь задержка выводится из триггера, а `kbqLeaveDelay` — вход только на запись, который запоминает сам факт привязки. Если привязка есть в шаблоне, действует привязанное значение; если нет — сеттер `trigger` пересчитывает задержку при каждом изменении, поэтому поповер, переключённый на `hover` позже, получает значение по умолчанию для наведения, а не `0`, с которым он был создан.

Программное присваивание `trigger.leaveDelay = 500` ничего не запоминает, поэтому следующая запись в `trigger` его перезапишет. Это единственное изменение здесь, за которым не стоит ошибки компиляции.

| Что было          | Что делать вручную                                                                      |
| ----------------- | --------------------------------------------------------------------------------------- |
| `.leaveDelay = …` | Привязать `[kbqLeaveDelay]` либо убрать вовсе — значения по умолчанию теперь достаточно |
| `.onConfirm = …`  | `onConfirm` доступен только для чтения: подписывайтесь вместо замены                    |
| `placementChange` | Отдаёт `string` вместо `any`; ломается только присваивание значения не в строку         |

Поповер подтверждения больше не зашивает русские значения по умолчанию: «Вы уверены, что хотите продолжить?» и «Да» берутся из локали, поэтому не-русское приложение получит переведённый текст там, где раньше был русский.

Два исправления, для которых мигрировать нечего: в _конфигурации по умолчанию_ триггер подписывался на глобальный `ScrollDispatcher` без отписки — теперь подписка ограничена по времени жизни, и хост, обходивший утечку принудительным уничтожением триггеров, может это убрать. И `KbqPopoverTrigger` можно импортировать как standalone: провайдер стратегии скролла больше не живёт только в NgModule.

Сообщает `popover-leave-delay`.

#### Search expandable

Шаг 4 уже переименовывает элемент `kbq-filter-search` в `kbq-search-expandable`. Но та замена трогала только тег, поэтому входы удалённого `KbqFilterBarSearch` оставались в разметке атрибутами, которых у нового компонента нет, — и молча, потому что неизвестный атрибут на компоненте не является ошибкой. Теперь `v20-upgrade` переименовывает и их:

| Было               | Стало                       |
| ------------------ | --------------------------- |
| `emitValueByEnter` | `isEmitValueByEnterEnabled` |
| `onSearchTimeout`  | `emitValueTimeout`          |
| `tooltip`          | `tooltipText`               |

**Вместе с именем изменилось значение по умолчанию.** У `onSearchTimeout` оно было `0`, у `emitValueTimeout` — `200`. Разметка, которая его никогда не задавала, теперь отправляет значение на 200 мс позже; чтобы вернуть прежнее поведение, добавьте `[emitValueTimeout]="0"`.

| Что было                        | Что делать вручную                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `[initialValue]`                | Задайте начальное значение привязанному `[formControl]` / `[(ngModel)]` — у компонента нет входа для значения |
| `(onSearch)`                    | Читайте запрос из привязанного контрола                                                                       |
| `kbq-filter-search` как атрибут | `kbq-search-expandable` — только элементный селектор, хост-элемент придётся заменить вручную                  |

Одно изменение поведения, для которого нет атрибута в разметке: по <kbd>Enter</kbd> теперь вызывается `preventDefault()`. Angular делает это сам только для обработчика, вернувшего литеральный `false`, поэтому до сих пор <kbd>Enter</kbd> внутри нативной `<form>` отправлял форму вдобавок к значению, которое компонент только что отправил сам. Если хост на эту отправку рассчитывал, её нужно вызывать самостоятельно.

Закрывает `v20-upgrade`: селектор и три имени входов он переименовывает за вас, остальное — сообщает.

#### Split button

`KbqSplitButton.disabled` был объявлен как `boolean`, но поле за ним не имеет начального значения, а сеттер выходит раньше времени для `undefined`. Поэтому `<kbq-split-button>` без привязки `[disabled]` возвращал `undefined` из ненулевого типа, и читающий его код молча работал неправильно:

```ts
const flag: boolean = splitButton.disabled; // лежал undefined
if (splitButton.disabled === false) {
    // не выполнялось никогда
}
```

Теперь геттер объявлен как `boolean | undefined` — ровно так, как всегда было у соседнего `KbqButtonGroupRoot`. Значение в рантайме не изменилось: просто места вызова, которые и так были неверными, перестали компилироваться.

| Что было                       | Что делать вручную                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------ |
| `.disabled` у `KbqSplitButton` | `?? false` для обычного чтения либо явная обработка неустановленного состояния             |
| `buttons.*` в наследнике       | Теперь это защищённый сигнальный запрос: читайте `buttons()`, `buttons.changes` больше нет |

`<kbq-split-button>` без вложенной кнопки больше не бросает исключение вне dev-режима. Проверка стоит за `isDevMode()`, поэтому в продакшене отрисуется пустой контрол вместо прерывания цикла проверки изменений у того, кто его отрисовал. Если исключение использовалось как проверка времени выполнения, её нужно написать самостоятельно.

Сообщает `split-button-optional-disabled`.

#### Title

`kbq-title` измеряет свой хост и открывает тултип, когда текст обрезан. Ревью сохранило эту поверхность — вход `kbq-title` и открываемый тултип — и закрыло стоящий за ней механизм измерения.

`resizeStream` — единственное удаление, которое меняет не только состав публичного API, но и работу директивы. Его питал хост-слушатель `(window:resize)`, то есть каждый экземпляр директивы означал ещё один слушатель, а `kbq-title` стоит на каждом пункте дропдауна, элементе списка и узле дерева. Теперь директива внедряет `SharedResizeObserver` из CDK: он не добавляет слушателей на экземпляр и, в отличие от `window:resize`, реагирует ещё и на изменения размера самого контейнера — перетаскивание сплиттера, сворачивание боковой панели.

| Что было                                                                                                          | Что делать вручную                                                           |
| ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `.resizeStream`                                                                                                   | Убрать вызов — общий `ResizeObserver` пересчитывает размеры сам              |
| `.hasOnlyText`                                                                                                    | Стал `private`; если он действительно нужен, читайте DOM напрямую            |
| `.child` / `.parent` / `.isHorizontalOverflown` / `.isVerticalOverflown` / `.handleElementEnter` / `.hideTooltip` | Стали `protected`; используйте вход `kbq-title` — это внутренности измерения |
| `super.ngOnDestroy()` в наследнике                                                                                | Убрать — базовый класс освобождает ресурсы через `takeUntilDestroyed`        |

Тултип теперь открывается ещё и по фокусу с клавиатуры — так было написано в документации директивы, но не работало; хост, который это обходил, может убрать обходной путь. `titleContent` типизирован как `TemplateRef<unknown>` вместо `TemplateRef<any>`: `TemplateRef<Ctx>` по-прежнему в него присваивается, но прочитанное обратно значение требует приведения типа.

Сообщает `title-encapsulation`.

### 19. Удаление устаревших событий file-upload (20.3.0)

События `fileQueueChanged` у множественного загрузчика файлов (`kbq-multiple-file-upload`) и `fileQueueChange`
у одиночного (`kbq-single-file-upload`) удалены. Используйте вместо них `filesChange` и `fileChange` — они
срабатывают в тот же момент и с тем же значением, так что это просто переименование, а не изменение
поведения.

#### Запуск миграции

```bash
ng update @koobiq/components@20
```

Или вручную:

```bash
ng g @koobiq/components:file-upload-deprecated-outputs --project <your project>
```

#### Что исправляется автоматически

Каждый `(fileQueueChanged)` и `(fileQueueChange)` переименовывается в `(filesChange)` / `(fileChange)` — как
в шаблонах, так и в TypeScript-коде (например, `.fileQueueChanged.subscribe(...)` становится
`.filesChange.subscribe(...)`). Замена текстовая и не привязана к использованию компонентов Koobiq — она
также затронет чужую строку, значение атрибута или ваш собственный идентификатор с таким же именем, поэтому
проверьте диф перед коммитом.

### После миграции

Миграция работает на регулярных выражениях и не переписывает алиасные импорты, локальные переменные и ре-экспорты — **проверьте диф перед коммитом**, пересоберите проект и прогоните тесты. Полный список ломающих изменений — на странице [Ломающие изменения — Angular 20](https://github.com/koobiq/angular-components/blob/main/docs/guides/angular-20-breaking-changes.ru.md).
