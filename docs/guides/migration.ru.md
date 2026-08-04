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
11. **20.3.0**: устаревание overlayscrollbars-реализации Scrollbar.

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

### 11. Устаревание overlayscrollbars-реализации Scrollbar (20.3.0)

До 20.3.0 `@koobiq/components/scrollbar` оборачивал стороннюю библиотеку `overlayscrollbars`: компонент `KbqScrollbar` (`kbq-scrollbar` / `[kbq-scrollbar]`) и низкоуровневая директива `KbqScrollbarDirective` (`[kbqScrollbar]`) со входами `options`, `events`, `defer` и сырым доступом к `scrollbarInstance`.

В 20.3.0 `@koobiq/components/scrollbar` — это новая, не зависящая от сторонних библиотек директива `[kbqScrollbar]` с другим публичным API (`kbqScrollbarVisibility`, `kbqScrollbarDisableDrag` / `kbqScrollbarDisableClick`, методы `scrollTo` / `scrollToElement` / `scrollToTop` / `scrollToBottom` / `scrollStart` / `scrollEnd`, сигналы `isTopReached` / `isBottomReached` / `isStartReached` / `isEndReached`). Прежняя реализация никуда не делась — она переехала без изменений в `@koobiq/components/scrollbar/deprecated` и будет удалена в одном из будущих мажорных релизов.

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

**Переход на новую реализацию** — это отдельная, ручная миграция, а не просто смена пути импорта: у новой директивы нет `options` / `events` / `defer` / `scrollbarInstance`, а селекторы `kbq-scrollbar` / `[kbq-scrollbar]` не поддерживаются — есть только атрибут `[kbqScrollbar]` на произвольном элементе. Подробности нового API — в документации компонента Scrollbar.

**Не импортируйте старую и новую реализацию в одном standalone-компоненте одновременно.** Обе используют один и тот же атрибут-селектор `[kbqScrollbar]` (у старой это `KbqScrollbarDirective`, у новой — `KbqScrollbar`) — Angular не запрещает объявить обе в `imports`, и если атрибут окажется на одном и том же элементе, обе директивы молча проинициализируются одновременно на нём. Ошибки компиляции не будет — при постепенном ручном переходе держите старое и новое использование в разных компонентах.

### После миграции

Миграция работает на регулярных выражениях и не переписывает алиасные импорты, локальные переменные и ре-экспорты — **проверьте диф перед коммитом**, пересоберите проект и прогоните тесты. Полный список ломающих изменений — на странице [Ломающие изменения — Angular 20](https://github.com/koobiq/angular-components/blob/main/docs/guides/angular-20-breaking-changes.ru.md).
