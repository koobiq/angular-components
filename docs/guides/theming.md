<!-- cspell:disable -->

### Что нового?

Теперь использование компонентов стало проще! Мы движемся к полной изоляции компонентов, что позволит вам легко подключать и использовать их.

Было принято решение отказаться от необходимости подключения SCSS-переменных для настройки цветов, геометрии и шрифтов.
Вместо этого практически для всех компонентов CSS-переменные теперь подключаются прямо внутри их самих.
Некоторые компоненты настолько малы, что они не способны автоматически подключать стили.
Следовательно, для этих элементов необходимо подключение стилей на глобальном уровне.

Более того, для каждой CSS-переменной компонента мы используем CSS-переменные глобальных значений дизайн-системы, например, цвета, размеры и параметры шрифтов.
Это не только улучшает читабельность кода, но и значительно упрощает процесс темизации.

### Как использовать?

#### Подготовка

1. Установите пакет дизайн системы Koobiq. Подробнее про установку [тут](/main/installation).
2. Используйте `css-tokens.css`, `css-tokens-light.css`, `css-tokens-dark.css` для подключения глобальных значений дизайн-системы, например, цветов, размеров и параметров шрифтов.

#### Применение темы

1. Для корректной работы оверлеев и компонентов без автоматического подключения стилей, подключите файл преднастроенных стилей в свой основной файл стиля.

```sass
@use '@koobiq/components/prebuilt-themes/theme.css';
```

#### Использование

1. Добавьте `kbq-theme-light` селектор к элементу `<body>` вашего HTML-документа для использования светлой темы и `kbq-theme-dark` для темной темы.
2. Импортируйте компонент

### Переключение светлой/темной темы

Мы оптимизировали процесс переключения между темами! Теперь достаточно изменить соответствующий селектор, чтобы перейти от темной к светлой теме (или наоборот). Например, с `kbq-theme-dark` на `kbq-theme-light`.
Цветовые значения будут автоматически адаптированы под выбранную тему.
Для переключения тем используйте [ThemeService.](/packages/components/core/services/theme.service.ts)

#### Доступные селекторы для темной и светлой темы

Вот таблица доступных селекторов для темной и светлой тем:

| Тема    | Селекторы                                  |
| ------- | ------------------------------------------ |
| Темная  | .kbq-dark, .theme-dark, .kbq-theme-dark    |
| Светлая | .kbq-light, .theme-light, .kbq-theme-light |

Мы рекомендуем использовать те селекторы, которые указаны в сервисе `ThemeService` (`kbq-theme-dark` для темной и `kbq-theme-light` для светлой).

#### Описание переключения в зависимости от операционной системы

Данный механизм возможно реализовать с помощью [window.matchMedia](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia);

Для реализации переключения темы в зависимости от операционной системы необходимы выполнить 3 условия:

-   Определить медиа-запрос для получения пользовательской темы:

```javascript
colorAutomaticTheme = window.matchMedia('(prefers-color-scheme: light)');
```

-   Добавить объект темы в массив тем, который будет подключаться в сервисе темы при инициализации приложения. В данной теме свойство `className` будет устанавливаться по условию

```javascript
{
    name: 'Как в системе',
    className: this.colorAutomaticTheme.matches ? Themes.Default : Themes.Dark,
    selected: false
},
```

-   Подписаться на обновление темы пользователя и устанавливать активную тему при обновлении. Реализация Chrome & Firefox отличается реализации в Safari:

```javascript
try {
    // Chrome & Firefox
    this.colorAutomaticTheme.addEventListener('change', this.setAutoTheme);
} catch (err) {
    try {
        // Safari
        this.colorAutomaticTheme.addListener(this.setAutoTheme);
    } catch (errSafari) {
        console.error(errSafari);
    }
}
```

Пример реализации переключения тем в документации Koobiq [тут.](https://github.com/koobiq/angular-components/blob/main/apps/docs/src/app/components/navbar/navbar.component.ts)

### Как задать кастомные значения компоненту дизайн-системы

Изменить цвета, размеры и шрифты можно задав соответствующие значения CSS-переменным компонента.
Например:

```css
.kbq-theme-dark {
    --kbq-alert-default-contrast-container-background: custom-color;
    --kbq-alert-default-contrast-container-title: custom-color;
}
```

### Совместимость

Работает стабильно с `@koobiq/design-tokens@3.5.1`.

### Как применить уже имеющиеся кастомные дизайн-токены?

Темы, где значения дизайн-токенов были перезаписаны с помощью Style-Dictionary,
применяются аналогично [заданию кастомных значений компонентам.](#как-задать-кастомные-значения-компоненту-дизайн-системы)

### Нужно ли что-то делать, если уже используются CSS-переменные из пакета @koobiq/design-tokens?

Да, необходимо удалить CSS-переменные для компонентов, которые уже используют стандартные значения из коробки.

В каких файлы необходимо внести изменения:

-   css-tokens.css - размеры компонента
-   css-tokens-light.css - цвета компонента для светлой темы
-   css-tokens-dark.css - цвета компонента для темной темы
-   css-tokens-font.css - шрифт, его размеры и параметры для компонента. Его можно удалить.

Удалить CSS-переменные необходимо для всех включенных в дизайн систему компонентов. В них используется значение по умолчанию, они вам больше не нужны.

<details>
  <summary>Более подробный список</summary>
    <ul>
        <li><a href="/packages/components/alert/alert-tokens.scss">alert</a></li>
        <li><a href="/packages/components/autocomplete/autocomplete-tokens.scss">autocomplete</a></li>
        <li><a href="/packages/components/badge/badge-tokens.scss">badge</a></li>
        <li><a href="/packages/components/button/button-tokens.scss">button</a></li>
        <li><a href="/packages/components/button-toggle/button-toggle-tokens.scss">button-toggle</a></li>
        <li><a href="/packages/components/checkbox/checkbox-tokens.scss">checkbox,pseudo-checkbox</a></li>
        <li><a href="/packages/components/code-block/code-block-tokens.scss">code-block</a></li>
        <li><a href="/packages/components/datepicker/datepicker-tokens.scss">datepicker</a></li>
        <li><a href="/packages/components/dl/dl-tokens.scss">description-list</a></li>
        <li><a href="/packages/components/divider/divider-tokens.scss">divider</a></li>
        <li><a href="/packages/components/dropdown/dropdown-tokens.scss">dropdown</a></li>
        <li><a href="/packages/components/empty-state/empty-state-tokens.scss">empty-state</a></li>
        <li><a href="/packages/components/file-upload/file-upload-tokens.scss">file-upload</a></li>
        <li><a href="/packages/components/form-field/form-field-tokens.scss">form-field</a></li>
        <li><a href="/packages/components/form-field/hint-tokens.scss">hint</a></li>
        <li><a href="/packages/components/icon/icon-tokens.scss">icon</a></li>
        <li><a href="/packages/components/icon/icon-button-tokens.scss">icon-button</a></li>
        <li><a href="/packages/components/icon/icon-item-tokens.scss">icon-item</a></li>
        <li><a href="/packages/components/input/input-tokens.scss">input</a></li>
        <li><a href="/packages/components/link/link-tokens.scss">link</a></li>
        <li><a href="/packages/components/list/list-tokens.scss">list</a></li>
        <li><a href="/packages/components/loader-overlay/loader-overlay-tokens.scss">loader-overlay</a></li>
        <li><a href="/packages/components/modal/modal-tokens.scss">modal</a></li>
        <li><a href="/packages/components/markdown/markdown-tokens.scss">markdown</a></li>
        <li><a href="/packages/components/navbar/navbar-tokens.scss">navbar</a></li>
        <li><a href="/packages/components/popover/popover-tokens.scss">popover</a></li>
        <li><a href="/packages/components/progress-bar/progress-bar-tokens.scss">progress-bar</a></li>
        <li><a href="/packages/components/progress-spinner/progress-spinner-tokens.scss">progress-spinner</a></li>
        <li><a href="/packages/components/radio/radio-tokens.scss">radio</a></li>
        <li><a href="/packages/components/risk-level/risk-level-tokens.scss">risk-level</a></li>
        <li><a href="/packages/components/select/select-tokens.scss">select</a></li>
        <li><a href="/packages/components/sidepanel/sidepanel-tokens.scss">sidepanel</a></li>
        <li><a href="/packages/components/scrollbar/scrollbar-tokens.scss">scrollbar-component</a></li>
        <li><a href="/packages/components/core/styles/theming/scrollbar-tokens.scss">scrollbar</a></li>
        <li><a href="/packages/components/core/forms/forms-tokens.scss">forms</a></li>
        <li><a href="/packages/components/core/option/option-tokens.scss">option</a></li>
        <li><a href="/packages/components/core/option/optgroup-tokens.scss">optgroup</a></li>
        <li><a href="/packages/components/core/option/option-action-tokens.scss">option-action</a></li>
        <li><a href="/packages/components/splitter/splitter-tokens.scss">splitter</a></li>
        <li><a href="/packages/components/tags/tag-tokens.scss">tag</a></li>
        <li><a href="/packages/components/tags/tag-input-tokens.scss">tag-input</a></li>
        <li><a href="/packages/components/table/table-tokens.scss">table</a></li>
        <li><a href="/packages/components/textarea/textarea-tokens.scss">textarea</a></li>
        <li><a href="/packages/components/timezone/timezone-option-tokens.scss">timezone</a></li>
        <li><a href="/packages/components/toast/toast-tokens.scss">toast</a></li>
        <li><a href="/packages/components/toggle/toggle-tokens.scss">toggle</a></li>
        <li><a href="/packages/components/tooltip/tooltip-tokens.scss">tooltip</a></li>
        <li><a href="/packages/components/tree/tree-tokens.scss">tree</a></li>
        <li><a href="/packages/components/tree-select/tree-select-tokens.scss">tree-select</a></li>
    </ul>
</details>

### Откуда теперь брать значения дизайн-токенов для компонентов?

Все актуальные значения для компонентов хранятся в репозитории [@koobiq/design-tokens](https://github.com/koobiq/design-tokens).
Сгенерированные на основе дизайн-токенов CSS-переменные компонентов позволяют сделать их использование более удобным, а также ускорить их разработку, в том числе проведение дизайн-ревью.

### Что планируется сделать дальше?

Мы планируем провести обновление наших компонентные CSS-переменные и использовать вместо них глобальные CSS-переменные нашей дизайн-системы напрямую.
