**Core** — публичная точка входа в общие API библиотеки компонентов Koobiq. Он объединяет настройки, типы, базовые элементы, правила взаимодействия и служебные утилиты. На них опираются готовые компоненты; эти средства можно использовать в собственных компонентах и обертках.

Публичное TypeScript API импортируется из `@koobiq/components/core`:

```ts
import { KBQ_WINDOW, kbqThemeProvider } from '@koobiq/components/core';
```

Для SCSS доступны отдельные пути, например `@koobiq/components/core/styles/visual`.

### Связанные страницы

Часть областей подробно описана на отдельных страницах:

| Статья                                             | Тема                                                                                                                                               |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Highlight](/ru/components/highlight)              | Пайпы `kbqHighlightBackground` и `mcHighlight` для подсветки совпадений в тексте                                                                   |
| [Layout flex](/ru/components/layout-flex)          | Классы и миксины для построения flex-раскладки                                                                                                     |
| [Валидация](/ru/other/validation)                  | `ErrorStateMatcher` и правила перехода поля в состояние ошибки                                                                                     |
| [Дизайн-токены](/ru/main/design-tokens/colors)     | Глобальные переменные цвета и оформления                                                                                                           |
| [Локализация](/ru/main/localization)               | Реестр локалей, активная локаль, строки интерфейса и их переопределение                                                                            |
| [Размер файлов](/ru/other/filesize-formatter)      | `KbqDataSizePipe` и единицы измерения объема данных                                                                                                |
| [Темизация](/ru/main/theming)                      | `KbqThemeService`, режимы оформления, именованные варианты и CSS-переменные                                                                        |
| [Типографика](/ru/main/typography)                 | Типографические стили и классы библиотеки                                                                                                          |
| [Умный поиск](/ru/other/search-smart)              | Нормализация запроса, предикаты поиска и диапазоны совпадений для подсветки                                                                        |
| [Форматирование дат](/ru/other/date-formatter)     | `DateFormatter`, пайпы дат и часовой пояс                                                                                                          |
| [Форматирование чисел](/ru/other/number-formatter) | Пайпы для округления, разрядности и отображения чисел в таблицах                                                                                   |
| [Формы](/ru/other/forms)                           | Классы `KbqForm` и `KbqFormElement`, селекторы `.kbq-form-vertical`, `.kbq-form-horizontal`, `.kbq-form__row` и алиасы `kbqForm`, `kbqFormElement` |

Остальное публичное API описано ниже.

### Настройка

Koobiq получает глобальные настройки через Angular-провайдеры. Функции-провайдеры дополняют переданную конфигурацию значениями по умолчанию и возвращают провайдер нужного типа.

#### Провайдеры

| Провайдер                                            | Назначение                                                                                                      |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `kbqThemeProvider(config)`                           | Регистрирует варианты оформления; задает начальный режим, вариант по имени через `theme` и ключ хранения выбора |
| `kbqLocaleServiceProvider()`                         | Подключает сервис локализации                                                                                   |
| `kbqLocaleIDProvider(localeId)`                      | Задает активную локаль                                                                                          |
| `kbqLocaleConfigurationOverrideProvider(section, …)` | Переопределяет строки одной секции локали                                                                       |
| `kbqA11yLocaleConfigurationProvider(config)`         | Переопределяет тексты для скринридера                                                                           |
| `kbqSelectLocaleConfigurationProvider(config)`       | Переопределяет строки раскрывающихся списков                                                                    |
| `kbqLocaleServiceLangAttrNameProvider(attrName)`     | Задает имя атрибута локали. По умолчанию — `lang`                                                               |
| `kbqDateTimezoneProvider(timezone)`                  | Задает часовой пояс, в котором отображаются даты                                                                |
| `kbqFilesizeFormatterConfigurationProvider(config)`  | Настраивает единицы измерения объема данных                                                                     |
| `kbqErrorStateMatcherProvider(matcher)`              | Определяет момент показа ошибок в полях формы                                                                   |
| `kbqShadowDomOverlayProvider(host?)`                 | Переносит контейнер overlay внутрь Shadow DOM                                                                   |

Без `kbqLocaleServiceProvider()` локализация компонентов не работает.

`ErrorStateMatcher` — класс, который получают через внедрение зависимостей. Реализацию и момент показа ошибок настраивает `kbqErrorStateMatcherProvider(matcher)`.

#### Токены

Токены позволяют заменить отдельную настройку или реализацию через механизм внедрения зависимостей.

| Токен                                     | Что настраивает                                                                                                                           |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `KBQ_WINDOW`                              | Ссылка на `window`, безопасная при серверном рендеринге                                                                                   |
| `KBQ_THEME_CONFIG`                        | Настройки `KbqThemeService`: `themes`, `mode`, `theme`, `storageKey`                                                                      |
| `KBQ_THEME_STORE`                         | Режим оформления (`light`, `dark`, `auto`) и закрепленный вариант. Готовые реализации: `KbqThemeLocalStorageStore`, `KbqThemeCookieStore` |
| `KBQ_LOCALE_SERVICE`                      | Экземпляр `KbqLocaleService`. Фабрики нет — предоставлять обязательно                                                                     |
| `KBQ_LOCALE_ID`                           | Активная локаль. По умолчанию `ru-RU` (`KBQ_DEFAULT_LOCALE_ID`)                                                                           |
| `KBQ_LOCALE_DATA`                         | Какие локали доступны, включая собственные                                                                                                |
| `KBQ_LOCALE_CONFIGURATION_OVERRIDES`      | Частичные переопределения секций локали                                                                                                   |
| `KBQ_A11Y_LOCALE_CONFIGURATION`           | Тексты, которые читает скринридер                                                                                                         |
| `KBQ_SELECT_LOCALE_CONFIGURATION`         | Строки раскрывающихся списков                                                                                                             |
| `KBQ_LOCALE_SERVICE_LANG_ATTR_NAME`       | Имя HTML-атрибута для локали. По умолчанию `lang`                                                                                         |
| `KBQ_DATE_LOCALE`                         | Локаль дат отдельно от локали интерфейса                                                                                                  |
| `KBQ_DATE_FORMATS`                        | Форматы разбора и вывода дат                                                                                                              |
| `KBQ_DATE_TIMEZONE`                       | Часовой пояс. По умолчанию `system`                                                                                                       |
| `KBQ_NUMBER_FORMATTER_OPTIONS`            | Разрядность и группировка чисел                                                                                                           |
| `KBQ_SIZE_UNITS_CONFIG`                   | Единицы измерения объема данных                                                                                                           |
| `KBQ_CHECKABLE_CLICK_ACTION`              | Реакция чекбоксов и переключателей на клик: `noop`, `check`, `check-indeterminate`                                                        |
| `KBQ_SELECT_SCROLL_STRATEGY`              | Поведение открытого раскрывающегося списка при прокрутке страницы                                                                         |
| `KBQ_SELECT_SEARCH_MIN_OPTIONS_THRESHOLD` | С какого числа опций показывается поиск. По умолчанию `10`                                                                                |

Если токен форматирования не предоставлен, действуют значения по умолчанию: `KBQ_NUMBER_FORMATTER_DEFAULT_OPTIONS` для чисел и `KBQ_SIZE_UNITS_DEFAULT_CONFIG` для единиц объема.

### Выбор темы

`KbqThemeService` учитывает цветовую схему операционной системы через `mode` и позволяет зафиксировать один из зарегистрированных вариантов по имени.

Зафиксированный вариант имеет приоритет над `mode` до сброса. Такой режим подходит приложению, которому требуется конкретное оформление, а не светлый, темный или системный режим.

<!-- example(theme-static-selection) -->

### Токен KBQ_WINDOW и серверный рендеринг

Токен сначала получает `DOCUMENT.defaultView`, а при отсутствии этого значения обращается к глобальному `window` для обратной совместимости. Если оба источника недоступны, токен выбрасывает ошибку.

Через внедренный объект получают `innerWidth`, `getComputedStyle`, `matchMedia` и другие свойства окна:

```ts
import { inject } from '@angular/core';
import { KBQ_WINDOW } from '@koobiq/components/core';

class Example {
    private readonly window = inject(KBQ_WINDOW);

    get isNarrow(): boolean {
        return this.window.innerWidth < 768;
    }
}
```

### Overlay внутри Shadow DOM

Angular CDK по умолчанию добавляет контейнер overlay в `document.body`. Если приложение работает внутри Shadow DOM, модальные окна, списки, всплывающие подсказки и тосты выходят из shadow root. Вместе с этим они теряют токены темы, объявленные на предке `.kbq-light` или `.kbq-dark`.

`kbqShadowDomOverlayProvider` переносит контейнер overlay внутрь shadow root:

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { kbqShadowDomOverlayProvider } from '@koobiq/components/core';

bootstrapApplication(AppComponent, {
    providers: [
        // Корневой элемент микрофронтенда или любой элемент внутри его shadow-дерева.
        ...kbqShadowDomOverlayProvider(() => document.querySelector('my-mfe-root')!)
    ]
});
```

Ограничения:

- без аргумента shadow root ищется от корневого компонента приложения;
- по самому хосту можно получить только открытый shadow root;
- если передать элемент, который уже находится внутри закрытого shadow root, провайдер получает его через `getRootNode()`;
- если shadow root не найден, контейнер остается в `document.body`;
- провайдер заменяет глобальный `OverlayContainer`, поэтому его нельзя сочетать с другой реализацией, например `FullscreenOverlayContainer`;
- структурные стили CDK переносятся вместе с контейнером, а стили и токены Koobiq приложение добавляет в shadow root самостоятельно.

Развернутое описание, включая сценарий с одним общим контейнером на все микрофронтенды, — на странице [Toast](/ru/components/toast).

### Тени при прокрутке

Директивы **Overflow Shadow** показывают границы прокручиваемой области. Тень появляется у шапки или подвала, когда в соответствующем направлении остается скрытое содержимое.

```html
<div kbqOverflowShadowContainer #shadow="kbqOverflowShadowContainer" class="scrollable">
    <header [kbqOverflowShadowTop]="shadow">Заголовок</header>

    <!-- содержимое -->

    <footer [kbqOverflowShadowBottom]="shadow">Подвал</footer>
</div>
```

| API                          | Назначение                                                        |
| ---------------------------- | ----------------------------------------------------------------- |
| `debounce`                   | Задержка обработки прокрутки в миллисекундах. По умолчанию — `0`  |
| `shadow`                     | Значение `box-shadow` в активном состоянии                        |
| `KBQ_OVERFLOW_SHADOW_SOURCE` | Источник событий и прокручиваемый элемент для собственной обертки |
| `checkOverflow()`            | Принудительное обновление состояния                               |

По умолчанию используются токены `--kbq-shadow-overflow-normal-bottom` и `--kbq-shadow-overflow-normal-top`.

Контейнер отслеживает прокрутку и размеры элемента. Если содержимое увеличивает только `scrollHeight`, наблюдатель не замечает изменения. В таком случае состояние обновляет `checkOverflow()`.

### Выбор всех элементов

`getSelectAllState` и `toggleSelectAll` работают через адаптер. Способ хранения выбранных элементов библиотекой не задается.

```ts
import { getSelectAllState, KbqSelectAllAdapter, toggleSelectAll } from '@koobiq/components/core';

const adapter: KbqSelectAllAdapter<Item> = {
    items: this.items,
    isSelectable: (item) => !item.disabled,
    isSelected: (item) => this.selection.isSelected(item),
    setSelected: (item, selected) => (selected ? this.selection.select(item) : this.selection.deselect(item))
};

const changed = toggleSelectAll(adapter, { allowDeselect: true });
const masterCheckboxState = getSelectAllState(adapter);
```

Особенности:

- `setSelected` вызывается для всех доступных элементов, включая те, чье состояние не изменилось; реализация должна быть идемпотентной;
- `toggleSelectAll` возвращает только измененные элементы;
- `allowDeselect: true` разрешает снять выбор повторным вызовом;
- недоступные элементы не влияют на состояние мастер-чекбокса;
- пустой набор имеет состояние `unchecked`;
- `KbqSelectAllEvent` описывает событие `onSelectAll`;
- `shouldSelectSearchText` определяет, должно ли сочетание клавиш выделить текст поиска вместо переключения опций.

### Клавиатура

#### Константы и предикаты

В пакете есть числовые константы клавиш: `ENTER`, `ESCAPE`, `TAB`, `UP_ARROW`, `HOME`, `NUMPAD_ZERO` и другие.

| Предикат                                     | Что проверяет                                                             |
| -------------------------------------------- | ------------------------------------------------------------------------- |
| `hasModifierKey(event, ...modifiers)`        | Нажат хотя бы один из перечисленных модификаторов; без аргументов — любой |
| `isControl(event)`                           | Нажата служебная клавиша: `Shift`, `Ctrl`, `Alt`, `Cmd`                   |
| `isLetterKey`, `isNumberKey`, `isDigit`      | Буква, цифра основного ряда                                               |
| `isNumpadKey`, `isFunctionKey`               | Цифра дополнительной клавиатуры, функциональная клавиша `F1`–`F12`        |
| `isVerticalMovement`, `isHorizontalMovement` | Перемещение по вертикали и горизонтали                                    |
| `isSelectAll(event)`, `isCopy(event)`        | Сочетания «выделить все» и «копировать» с учетом macOS                    |
| `isInput(event)`                             | Событие пришло из `input` или `textarea`                                  |

#### Навигация по списку

Менеджеры клавиатуры управляют активным элементом:

- `ListKeyManager` — базовое управление активным элементом;
- `FocusKeyManager` — дополнительно переводит фокус на активный элемент;
- `ActiveDescendantKeyManager` — оставляет фокус на контейнере и помечает активный элемент.

```ts
this.keyManager = new FocusKeyManager(this.items)
    .withVerticalOrientation()
    .withTypeAhead()
    .withHomeAndEnd()
    .withScrollSize(this.visibleRowsCount)
    .skipPredicate((item) => item.disabled);
```

Реализации Koobiq дополняют одноименные классы CDK:

- `withScrollSize()`, `setNextPageItemActive()` и `setPreviousPageItemActive()` добавляют постраничное перемещение;
- `previousActiveItemIndex` хранит предыдущий активный индекс для выделения диапазона с `Shift`.

### Валидаторы

Валидаторы представлены статическими методами, которые возвращают `ValidatorFn`.

#### PasswordValidators

| Метод               | Ключ ошибки    | Содержимое ошибки |
| ------------------- | -------------- | ----------------- |
| `minLength(min)`    | `minLength`    | `{ min, actual }` |
| `maxLength(max)`    | `maxLength`    | `{ max, actual }` |
| `minUppercase(min)` | `minUppercase` | `{ min, actual }` |
| `minLowercase(min)` | `minLowercase` | `{ min, actual }` |
| `minNumber(min)`    | `minNumber`    | `{ min, actual }` |
| `minSpecial(min)`   | `minSpecial`   | `{ min, actual }` |

`PasswordValidators` возвращает `null` для значений, которые не являются строками. Спецсимволами считаются **!**, **@**, **#**, **$**, **%**, **^**, **&**, **\***. Пример использования — на странице [Form field](/ru/components/form-field).

#### FileValidators

| Метод                        | Ключ ошибки             | Содержимое ошибки      |
| ---------------------------- | ----------------------- | ---------------------- |
| `maxFileSize(maxSize)`       | `maxFileSize`           | `{ max, actual }`      |
| `isCorrectExtension(accept)` | `fileExtensionMismatch` | `{ expected, actual }` |

`accept` принимает расширения (`.pdf`) и MIME-типы (`image/png`) — те же значения, что и атрибут `accept` у `input[type=file]`; тип `KbqFileTypeSpecifier` описывает их. Примеры — на странице [Загрузка файлов](/ru/components/file-upload).

`FileValidators` ожидает объект `File` или объект с полем `file`. Для пустого значения возвращается `null`, после чего валидатор обращается к свойствам файла напрямую.

### Общие типы

Типы из этого раздела описывают одинаковые входные параметры в разных компонентах. Их можно использовать в собственных обертках, чтобы сохранить совместимость с API Koobiq.

| Тип                                              | Значения                                                                                   |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `KbqDefaultSizes`                                | `compact`, `normal`, `big`                                                                 |
| `KbqComponentColors`                             | `theme`, `theme-fade`, `contrast`, `contrast-fade`, `error`, `warning`, `success`, `empty` |
| `ThemePalette`                                   | `primary`, `secondary`, `error`, `info`, `warning`, `success`                              |
| `KbqOrientation`                                 | `horizontal`, `vertical`                                                                   |
| `KbqFlexDirection`, `KbqFlexWrap`                | `row` / `column`, `nowrap` / `wrap`                                                        |
| `PopUpPlacements`, `PopUpTriggers`, `PopUpSizes` | Положение, способ открытия и размер всплывающих элементов                                  |
| `KbqMultipleInput`, `MultipleMode`               | Режим множественного выбора списков и деревьев                                             |

`KbqColorDirective` преобразует значение `color` в класс `kbq-<значение>`. Например, `color="error"` добавляет `kbq-error`, а `color="empty"` — `kbq-empty`. Эти классы формируются во время выполнения, поэтому могут не встречаться в исходниках как готовые строки.

`resolveMultipleMode` преобразует допустимые значения `multiple` в режим выбора. Нераспознанное значение включает одиночный режим и выводит сообщение при разработке.

### Ширина панели

Типы `KbqPanelWidth`, `KbqPanelMinWidth` и `KbqPanelMaxWidth` описывают правила расчета ширины.

| Значение `panelWidth` | Поведение                                                                              |
| --------------------- | -------------------------------------------------------------------------------------- |
| `null`, `''`          | Ширина зависит от содержимого, но остается не меньше ширины триггера и `panelMinWidth` |
| `'auto'`              | Ширина равна ширине триггера, но остается не меньше `panelMinWidth`                    |
| Число                 | Явная ширина в пикселях                                                                |
| Строка CSS            | Явная ширина, например `fit-content` или `20rem`                                       |

`panelMinWidth` применяется только при `null`, `''` и `'auto'`. Значение по умолчанию задает `KBQ_PANEL_DEFAULT_MIN_WIDTH` — `200` пикселей.

`KbqPanelMaxWidth` ограничивает рост по содержимому. При `null` используется токен `--kbq-panel-size-width-max`. Ограничение не уменьшает панель относительно триггера и не переопределяет явную ширину.

### Утилиты

| Утилита                                                            | Назначение                                                |
| ------------------------------------------------------------------ | --------------------------------------------------------- |
| `kbqDeepMerge(base, patch)`, `KbqDeepPartial<T>`                   | Рекурсивное объединение конфигураций                      |
| `kbqInjectNativeElement<T>()`                                      | Получение `nativeElement` из внедренного `ElementRef`     |
| `isHtmlElement`, `isElement`, `isNull`, `isUndefined`, `isBoolean` | Проверка и сужение типов                                  |
| `getNodesWithoutComments(nodes)`                                   | Получение списка узлов без комментариев                   |
| `escapeRegExp(value)`                                              | Экранирование строки для регулярного выражения            |
| `isMac()`                                                          | Определение платформы для подписей сочетаний клавиш       |
| `KbqMeasureScrollbarService`                                       | Измерение ширины системной полосы прокрутки               |
| `kbqInjectAutofilled()`                                            | Сигнал о заполнении поля браузером                        |
| `KbqNormalizeWhitespace`                                           | Замена тонкого пробела обычным при копировании            |
| `kbqRevealSelection`, `kbqSetSelectionRange`                       | Выделение текста и прокрутка поля к выделенному фрагменту |

`KbqMeasureScrollbarService` возвращает `0` при серверном рендеринге.

`KbqNormalizeWhitespace` применяется к полям с форматированными числами. При копировании директива заменяет разделяющий разряды тонкий пробел обычным. По умолчанию она не подключена. Пример приведен на странице [Input](/ru/components/input).

`kbqInjectAutofilled()` вызывается в контексте внедрения директивы на `input` или `textarea`.

### Тестирование

**Core** экспортирует инструменты, которыми тестируются компоненты Koobiq. Они также подходят для тестирования прикладного кода на основе библиотеки.

| Утилита                                                                                  | Назначение                                             |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `dispatchFakeEvent`, `dispatchKeyboardEvent`, `dispatchMouseEvent`, `dispatchTouchEvent` | Создают и отправляют событие                           |
| `createFakeEvent`, `createKeyboardEvent`, `createMouseEvent`, `createTouchEvent`         | Создают событие без отправки                           |
| `typeInElement(value, element)`                                                          | Вводит текст с полным набором событий                  |
| `patchElementFocus(element)`                                                             | Управляет получением и потерей фокуса в тестовой среде |
| `MockNgZone`                                                                             | Позволяет проверять работу вне Angular                 |
| `wrappedErrorMessage(error)`                                                             | Создает регулярное выражение для текста ошибки         |

### Стили

Готовые CSS-файлы описаны на страницах [Установка](/ru/main/installation) и [Темизация](/ru/main/theming).

Для сборки темы из SCSS доступны миксины:

```scss
@use '@koobiq/components' as components;
@use '@koobiq/components/core/styles/visual';

// Общие стили: overlay, скрытый для глаз текст, индикатор загрузки.
@include components.kbq-core();

// Тема, типографика и глобальные стили компонентов-директив.
@include components.koobiq-theme();

// Базовые стили страницы и раскладка по контрольным точкам.
@include visual.body-html();
@include visual.layouts-for-breakpoint();
```
