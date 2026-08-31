Модуль `core` является фундаментальной частью дизайн-системы **Koobiq**.  
Он предоставляет базовые утилиты, сервисы и компоненты, необходимые для построения и функционирования остальных модулей системы.

Всё публичное API модуля импортируется из одной точки входа — вложенных путей у `core` нет:

```ts
import { KBQ_WINDOW, kbqThemeProvider } from '@koobiq/components/core';
```

### Карта модуля

Значительная часть `core` описана на отдельных страницах документации — ниже ссылки на них.

| Тема                                                                    | Страница                                           |
| ----------------------------------------------------------------------- | -------------------------------------------------- |
| `KbqThemeService`, темы, CSS-переменные                                 | [Темизация](/ru/main/theming)                      |
| `KbqLocaleService`, локали, переопределение строк                       | [Локализация](/ru/main/localization)               |
| `createSearchPredicate`, `tokenizeSearchQuery`, `findSearchMatchRanges` | [Умный поиск](/ru/other/search-smart)              |
| `DateFormatter`, пайпы дат, часовой пояс                                | [Форматирование дат](/ru/other/date-formatter)     |
| `KbqDecimalPipe`, `KbqRoundDecimalPipe`, `KbqTableNumberPipe`           | [Форматирование чисел](/ru/other/number-formatter) |
| `KbqDataSizePipe`, единицы измерения объёма                             | [Размер файлов](/ru/other/filesize-formatter)      |
| Раскладка форм: `kbq-form`, `kbq-form-row`                              | [Формы](/ru/other/forms)                           |
| `ErrorStateMatcher` — когда показывать ошибки                           | [Валидация](/ru/other/validation)                  |
| Подсветка совпадений: `kbqHighlight`                                    | [Highlight](/ru/components/highlight)              |
| Типографика                                                             | [Типографика](/ru/main/typography)                 |
| Flex-раскладка                                                          | [Layout flex](/ru/components/layout-flex)          |
| Глобальные переменные оформления                                        | [Дизайн-токены](/ru/main/design-tokens/colors)     |

Остальное описано на этой странице.

### Глобальная конфигурация

Поведение библиотеки настраивается через провайдеры приложения. Почти у каждой настройки есть два способа задать её: токен и функция-провайдер. Предпочтительна функция-провайдер: она подставляет значения по умолчанию для всего, что вы не указали, и не даёт ошибиться с типом провайдера.

#### Провайдеры

| Провайдер                                            | Что делает                                                          |
| ---------------------------------------------------- | ------------------------------------------------------------------- |
| `kbqThemeProvider(config)`                           | Регистрирует темы, задаёт начальный режим и ключ хранения выбора    |
| `kbqLocaleServiceProvider()`                         | Включает локализацию. Без него локализация не работает              |
| `kbqLocaleIDProvider(localeId)`                      | Задаёт активную локаль                                              |
| `kbqLocaleConfigurationOverrideProvider(section, …)` | Переопределяет строки одной секции локали                           |
| `kbqA11yLocaleConfigurationProvider(config)`         | Переопределяет тексты, которые читает скринридер                    |
| `kbqSelectLocaleConfigurationProvider(config)`       | Переопределяет строки выпадающих списков                            |
| `kbqLocaleServiceLangAttrNameProvider(attrName)`     | Меняет имя атрибута, в который пишется локаль (по умолчанию `lang`) |
| `kbqDateTimezoneProvider(timezone)`                  | Задаёт часовой пояс, в котором отображаются даты                    |
| `kbqFilesizeFormatterConfigurationProvider(config)`  | Настраивает единицы измерения объёма данных                         |
| `kbqErrorStateMatcherProvider(matcher)`              | Задаёт момент показа ошибок в полях формы                           |
| `kbqShadowDomOverlayProvider(host?)`                 | Переносит контейнер overlay внутрь Shadow DOM                       |

#### Токены

Подробное описание каждой области — на страницах из карты выше.

| Токен                                     | Что настраивает                                                                                 |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `KBQ_WINDOW`                              | Ссылка на `window`, безопасная при серверном рендеринге                                         |
| `KBQ_THEME_CONFIG`                        | Настройки `KbqThemeService`: `themes`, `mode`, `theme`, `storageKey`                            |
| `KBQ_THEME_STORE`                         | Где хранится выбор темы. Готовые реализации: `KbqThemeLocalStorageStore`, `KbqThemeCookieStore` |
| `KBQ_LOCALE_SERVICE`                      | Экземпляр `KbqLocaleService`. Фабрики нет — предоставлять обязательно                           |
| `KBQ_LOCALE_ID`                           | Активная локаль. По умолчанию `ru-RU` (`KBQ_DEFAULT_LOCALE_ID`)                                 |
| `KBQ_LOCALE_DATA`                         | Какие локали доступны, включая собственные                                                      |
| `KBQ_LOCALE_CONFIGURATION_OVERRIDES`      | Частичные переопределения секций локали                                                         |
| `KBQ_A11Y_LOCALE_CONFIGURATION`           | Тексты, которые читает скринридер                                                               |
| `KBQ_SELECT_LOCALE_CONFIGURATION`         | Строки выпадающих списков                                                                       |
| `KBQ_LOCALE_SERVICE_LANG_ATTR_NAME`       | Имя HTML-атрибута для локали. По умолчанию `lang`                                               |
| `KBQ_DATE_LOCALE`                         | Локаль дат отдельно от локали интерфейса                                                        |
| `KBQ_DATE_FORMATS`                        | Форматы разбора и вывода дат                                                                    |
| `KBQ_DATE_TIMEZONE`                       | Часовой пояс. По умолчанию `system`                                                             |
| `KBQ_NUMBER_FORMATTER_OPTIONS`            | Разрядность и группировка чисел                                                                 |
| `KBQ_SIZE_UNITS_CONFIG`                   | Единицы измерения объёма данных                                                                 |
| `ErrorStateMatcher`                       | Момент показа ошибок в полях формы                                                              |
| `KBQ_CHECKABLE_CLICK_ACTION`              | Реакция чекбоксов и переключателей на клик: `noop`, `check`, `check-indeterminate`              |
| `KBQ_SELECT_SCROLL_STRATEGY`              | Поведение открытого выпадающего списка при прокрутке страницы                                   |
| `KBQ_SELECT_SEARCH_MIN_OPTIONS_THRESHOLD` | С какого числа опций показывается поиск. По умолчанию `10`                                      |

Если токен форматирования не предоставлен, действуют значения по умолчанию: `KBQ_NUMBER_FORMATTER_DEFAULT_OPTIONS` для чисел и `KBQ_SIZE_UNITS_DEFAULT_CONFIG` для единиц объёма.

### Закрепление темы по имени

Помимо следования цветовой схеме ОС через `mode`, `KbqThemeService` позволяет закрепить одну тему из зарегистрированных `themes()` по имени — без понятия светлой/тёмной полярности, закрепление просто переопределяет разрешение `mode` до сброса. Полезно для выбора конкретной темы, в отличие от переключателя светлая/тёмная/авто.

<!-- example(theme-static-selection) -->

### Токен KBQ_WINDOW и серверный рендеринг

При серверном рендеринге глобального `window` не существует, поэтому обращение к нему падает на сервере. Вместо глобального объекта используйте токен `KBQ_WINDOW` — он разрешается через `DOCUMENT`, а не через глобальную переменную.

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

То же касается `getComputedStyle`, `matchMedia` и других свойств окна — берите их у внедрённого объекта. Если окна нет и разрешить токен не удалось, он бросает ошибку вместо того, чтобы молча вернуть `undefined`.

### Overlay внутри Shadow DOM

CDK по умолчанию добавляет контейнер overlay в `document.body`. Если приложение смонтировано внутри Shadow DOM — типичный случай для микрофронтендов, изолирующих свои стили, — все overlay (модальные окна, выпадающие списки, тултипы, тосты) выходят из shadow root в light DOM и теряют токены темы, которые объявлены на предке `.kbq-light` / `.kbq-dark`.

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

Что важно знать:

- без аргумента для поиска shadow root используется элемент корневого компонента приложения;
- работает только с **открытым** shadow root: закрытый не отдаёт ни `Element.shadowRoot`, ни `ShadowRoot` из `getRootNode()`;
- если shadow root не найден, контейнер остаётся в `document.body`, поэтому провайдер можно добавлять безусловно;
- провайдер подменяет глобальный `OverlayContainer`, поэтому не сочетается с другой собственной реализацией — например, с `FullscreenOverlayContainer`;
- провайдер переносит контейнер и доставляет структурные стили CDK, а стили и токены темы Koobiq в shadow root доставляет само приложение.

Развёрнутое описание, включая сценарий с одним общим контейнером на все микрофронтенды, — на странице [Toast](/ru/components/toast).

### Тени при прокрутке

Набор директив, который показывает тень у шапки или подвала, когда содержимое прокручено. Контейнер ставится на прокручиваемый элемент, а индикаторы связываются с ним через ссылку на шаблон.

```html
<div kbqOverflowShadowContainer #shadow="kbqOverflowShadowContainer" class="scrollable">
    <header [kbqOverflowShadowTop]="shadow">Заголовок</header>

    <!-- содержимое -->

    <footer [kbqOverflowShadowBottom]="shadow">Подвал</footer>
</div>
```

- `debounce` — задержка обработки прокрутки в миллисекундах, по умолчанию `0`.
- `shadow` — значение `box-shadow` в активном состоянии. По умолчанию берутся токены `--kbq-shadow-overflow-normal-bottom` и `--kbq-shadow-overflow-normal-top`.
- `KBQ_OVERFLOW_SHADOW_SOURCE` — токен, которым собственная обёртка над прокруткой сообщает контейнеру свой источник событий и элемент прокрутки. Так работает `KbqScrollbar`.
- Кроме прокрутки контейнер отслеживает изменение размеров элемента. Содержимое, которое увеличивает только `scrollHeight`, не меняя размеров элемента, наблюдатель не заметит — для таких случаев есть `checkOverflow()`.

### Выбор всех элементов

Логика «выбрать всё» по `Ctrl`/`Cmd` + `A` вынесена в функции, работающие через адаптер, — их можно переиспользовать в собственных списках независимо от того, как хранится выбор.

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

- `setSelected` должен быть идемпотентным: `toggleSelectAll` вызывает его для всех доступных элементов, а не только для тех, чьё состояние меняется, и рассчитывает, что повторный вызов не приведёт к событиям и побочным эффектам.
- `toggleSelectAll` возвращает только те элементы, чьё состояние действительно изменилось.
- `allowDeselect: true` заставляет повторное нажатие снимать выбор, когда выбрано уже всё. По умолчанию переключатель только выбирает.
- Недоступные элементы не учитываются: они не удерживают мастер-чекбокс в состоянии `indeterminate`. Пустой набор читается как `unchecked`.
- `KbqSelectAllEvent` — событие, которое компоненты библиотеки отдают в `onSelectAll`.
- `shouldSelectSearchText` определяет, должно ли сочетание клавиш выделить текст в поле поиска, а не переключить опции.

### Работа с клавиатурой

#### Константы и предикаты

`core` экспортирует набор числовых констант клавиш (`ENTER`, `ESCAPE`, `TAB`, `UP_ARROW`, `HOME`, `NUMPAD_ZERO` и другие) и предикаты поверх них — они избавляют от разбора `keyCode` в обработчиках.

| Предикат                                     | Что проверяет                                                             |
| -------------------------------------------- | ------------------------------------------------------------------------- |
| `hasModifierKey(event, ...modifiers)`        | Нажат хотя бы один из перечисленных модификаторов; без аргументов — любой |
| `isControl(event)`                           | Нажата служебная клавиша: `Shift`, `Ctrl`, `Alt`, `Cmd`                   |
| `isLetterKey`, `isNumberKey`, `isDigit`      | Буква, цифра основного ряда                                               |
| `isNumpadKey`, `isFunctionKey`               | Цифра дополнительной клавиатуры, функциональная клавиша `F1`–`F12`        |
| `isVerticalMovement`, `isHorizontalMovement` | Перемещение по вертикали и горизонтали                                    |
| `isSelectAll(event)`, `isCopy(event)`        | Сочетания «выделить всё» и «копировать» с учётом macOS                    |
| `isInput(event)`                             | Событие пришло из `input` или `textarea`                                  |

#### Навигация по списку

`ListKeyManager` и его наследники дают roving-навигацию для собственных списочных компонентов:

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

По сравнению с одноимёнными классами CDK здесь есть постраничное перемещение (`withScrollSize()`, `setNextPageItemActive()`, `setPreviousPageItemActive()`) и `previousActiveItemIndex` — он нужен для выделения диапазона с `Shift`.

### Валидаторы

Наборы статических методов, возвращающих `ValidatorFn`. Проверка выполняется только для значений подходящего типа: для остальных валидатор возвращает `null` и не мешает другим проверкам.

#### PasswordValidators

| Метод               | Ключ ошибки    | Содержимое ошибки |
| ------------------- | -------------- | ----------------- |
| `minLength(min)`    | `minLength`    | `{ min, actual }` |
| `maxLength(max)`    | `maxLength`    | `{ max, actual }` |
| `minUppercase(min)` | `minUppercase` | `{ min, actual }` |
| `minLowercase(min)` | `minLowercase` | `{ min, actual }` |
| `minNumber(min)`    | `minNumber`    | `{ min, actual }` |
| `minSpecial(min)`   | `minSpecial`   | `{ min, actual }` |

Спецсимволами считаются `!`, `@`, `#`, `$`, `%`, `^`, `&`, `*`. Пример использования — на странице [Form field](/ru/components/form-field).

#### FileValidators

| Метод                        | Ключ ошибки             | Содержимое ошибки      |
| ---------------------------- | ----------------------- | ---------------------- |
| `maxFileSize(maxSize)`       | `maxFileSize`           | `{ max, actual }`      |
| `isCorrectExtension(accept)` | `fileExtensionMismatch` | `{ expected, actual }` |

`accept` принимает расширения (`.pdf`) и MIME-типы (`image/png`) — те же значения, что и атрибут `accept` у `input[type=file]`; тип `KbqFileTypeSpecifier` описывает их. Примеры — на странице [Загрузка файлов](/ru/components/file-upload).

### Общие типы

Типы, которыми описаны входы компонентов библиотеки. Используйте их в собственных обёртках, чтобы не расходиться с дизайн-системой.

| Тип                                              | Значения                                                                                   |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `KbqDefaultSizes`                                | `compact`, `normal`, `big`                                                                 |
| `KbqComponentColors`                             | `theme`, `theme-fade`, `contrast`, `contrast-fade`, `error`, `warning`, `success`, `empty` |
| `ThemePalette`                                   | `primary`, `secondary`, `error`, `info`, `warning`, `success`                              |
| `KbqOrientation`                                 | `horizontal`, `vertical`                                                                   |
| `KbqFlexDirection`, `KbqFlexWrap`                | `row` / `column`, `nowrap` / `wrap`                                                        |
| `PopUpPlacements`, `PopUpTriggers`, `PopUpSizes` | Положение, способ открытия и размер всплывающих элементов                                  |
| `KbqMultipleInput`, `MultipleMode`               | Режим множественного выбора списков и деревьев                                             |

Значение входа `color` не просто хранится: `KbqColorDirective` ставит на элемент класс `kbq-<значение>` — например, `color="error"` даёт класс `kbq-error`, а значение по умолчанию `empty` — класс `kbq-empty`. Поэтому такие классы не находятся простым поиском по исходникам.

Вход `multiple` у списков и деревьев принимает не только логическое значение — `resolveMultipleMode` приводит все допустимые написания к режиму. Нераспознанное значение трактуется как одиночный выбор и сообщается в режиме разработки.

### Ширина выпадающей панели

Выпадающие панели считают ширину по общему правилу. Типы `KbqPanelWidth`, `KbqPanelMinWidth` и `KbqPanelMaxWidth` описывают его значения.

| Значение `panelWidth`       | Поведение                                                                        |
| --------------------------- | -------------------------------------------------------------------------------- |
| `null`, `''` (по умолчанию) | Панель растёт по содержимому, но не уже триггера и не уже `panelMinWidth`        |
| `'auto'`                    | Панель равна ширине триггера, но не уже `panelMinWidth`                          |
| число                       | Явная ширина в пикселях. `panelMinWidth` не применяется                          |
| строка CSS                  | Явная ширина, например `fit-content` или `20rem`. `panelMinWidth` не применяется |

Правило «не уже триггера» действует только для автоматических режимов — явно заданная ширина берётся как есть. Значение `panelMinWidth` по умолчанию — `KBQ_PANEL_DEFAULT_MIN_WIDTH`, то есть `200`. `KbqPanelMaxWidth` ограничивает рост панели по содержимому; при `null` действует токен `--kbq-panel-size-width-max`. Ограничение мягкое: панель не станет уже триггера и не переопределит явную ширину.

### Утилиты

| Утилита                                                            | Назначение                                                                                |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `kbqDeepMerge(base, patch)`, `KbqDeepPartial<T>`                   | Рекурсивное слияние конфигураций: частичное переопределение не затирает соседние секции   |
| `kbqInjectNativeElement<T>()`                                      | Короткая замена `inject(ElementRef).nativeElement`                                        |
| `isHtmlElement`, `isElement`, `isNull`, `isUndefined`, `isBoolean` | Предикаты-сужения типов                                                                   |
| `getNodesWithoutComments(nodes)`                                   | Список узлов без комментариев — например, для проверки спроецированного контента          |
| `escapeRegExp(value)`                                              | Экранирование пользовательского ввода перед подстановкой в регулярное выражение           |
| `isMac()`                                                          | Определение платформы для подписей сочетаний клавиш                                       |
| `KbqMeasureScrollbarService`                                       | Ширина системной полосы прокрутки (`scrollBarWidth`); при серверном рендеринге — `0`      |
| `kbqInjectAutofilled()`                                            | Сигнал «поле заполнено браузером». Вызывается из контекста внедрения директивы на `input` |
| `KbqNormalizeWhitespace`                                           | Директива `kbqNormalizeWhitespace`: при копировании заменяет тонкий пробел обычным        |
| `kbqRevealSelection`, `kbqSetSelectionRange`                       | Выделение в текстовом поле с прокруткой поля к выделенному фрагменту                      |

Директива `kbqNormalizeWhitespace` нужна полям с форматированными числами: разряды в них разделены тонким пробелом, и без замены скопированное значение не вставляется корректно в другие приложения. По умолчанию директива не включена — её добавляют вручную, см. [Input](/ru/components/input).

### Утилиты для тестов

`core` экспортирует помощники, которыми написаны собственные тесты библиотеки. Ими же удобно тестировать прикладной код, использующий компоненты Koobiq.

| Утилита                                                                                  | Назначение                                           |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `dispatchFakeEvent`, `dispatchKeyboardEvent`, `dispatchMouseEvent`, `dispatchTouchEvent` | Создать и отправить событие на узел                  |
| `createFakeEvent`, `createKeyboardEvent`, `createMouseEvent`, `createTouchEvent`         | Создать событие, не отправляя его                    |
| `typeInElement(value, element)`                                                          | Ввод текста в поле с полным набором событий          |
| `patchElementFocus(element)`                                                             | Предсказуемые фокус и потеря фокуса в тестовой среде |
| `MockNgZone`                                                                             | Подконтрольная зона для проверки работы вне Angular  |
| `wrappedErrorMessage(error)`                                                             | Регулярное выражение для сопоставления текста ошибки |

### Стили

Штатный способ подключения стилей — готовые CSS-файлы, он описан в [установке](/ru/main/installation) и [темизации](/ru/main/theming). Если приложение собирает тему из SCSS, `core` даёт для этого миксины:

```scss
@use '@koobiq/components' as components;
@use '@koobiq/components/core/styles/visual';

// Общие стили, не зависящие от темы: overlay, скрытый для глаз текст, индикатор загрузки.
@include components.kbq-core();

// Оформление: тема, типографика, глобальные стили компонентов-директив.
@include components.koobiq-theme();

// Базовые стили страницы и раскладка по контрольным точкам.
@include visual.body-html();
@include visual.layouts-for-breakpoint();
```
