<!-- cspell:disable -->

### Что нового?

Теперь использование компонентов стало проще! Мы движемся к полной изоляции компонентов, что позволит вам легко подключать и использовать их.

-   Больше не нужно подключать отдельные файлы SCSS для изменения цветов, размеров и шрифтов компонентов.
-   Практически во всех компонентах стили задаются с помощью CSS-переменных, которые уже включены в код компонента. Это делает стили более прозрачными и понятными.
-   Некоторые маленькие компоненты не могут самостоятельно подключать стили, поэтому их нужно подключить глобально.
-   Мы используем глобальные CSS-переменные дизайн-системы для цветов, размеров и шрифтов. Это делает код более читаемым и упрощает изменение темы приложения. Это не только улучшает читабельность кода, но и значительно упрощает процесс темизации.

### Как использовать?

1. Установите пакет дизайн системы Koobiq. Подробнее про установку [тут](/main/installation).
2. Подключите файлы `css-tokens.css`, `css-tokens-light.css`, `css-tokens-dark.css` для использования глобальных значений дизайн-системы, например, цветов, размеров и параметров шрифтов.
3. [Подключите файл преднастроенных стилей](#подключение-файла-преднастроенных-стилей) в свой основной файл стилей. Этот шаг нужен для правильного отображения компонентов и оверлеев (например, всплывающих окон). Код подключения ниже.
4. Добавьте селектор `kbq-light` к элементу `<body>` вашего HTML-документа для использования светлой темы и `kbq-dark` для темной темы.
5. Импортируйте компонент и используйте его в вёрстке!🚀

#### Подключение файла преднастроенных стилей

```sass
@use '@koobiq/components/prebuilt-themes/theme.css';
```

Так выглядит тег `body` в `index.html` после добавления необходимых классов:

```html
<body class="kbq-app-background kbq-light">
    <app></app>
</body>
```

Класс `kbq-app-background` используется для применения базовых стилей темы к приложению - цвет фона и текста.

### Переключение тем

Для переключения темы достаточно изменить соответствующий селектор, чтобы перейти от темной к светлой теме (или наоборот). Например, с `kbq-dark` на `kbq-light`.
Цветовые значения будут автоматически адаптированы под выбранную тему.

Для переключения тем используйте [ThemeService.](https://github.com/koobiq/angular-components/tree/main/packages/components/core/services/theme.service.ts) Вот пример:

```ts
import { ThemeService } from '@koobiq/components/core';
import { Component } from '@angular/core';

@Component()
class AppComponent {
    constructor(private themeService: ThemeService) {
        /* светлая тема станет активной, к тегу `body` добавится класс `kbq-light` */
        this.themeService.setTheme(0);
    }
}
```

#### Селекторы для тем

Вот таблица доступных селекторов для темной и светлой тем:

| Тема    | Селекторы                                  |
| ------- | ------------------------------------------ |
| Темная  | .kbq-dark, .theme-dark, .kbq-theme-dark    |
| Светлая | .kbq-light, .theme-light, .kbq-theme-light |

Мы рекомендуем использовать те селекторы, которые указаны в сервисе `ThemeService` (`kbq-dark` для темной и `kbq-light` для светлой).

#### Переключение по выбранной в ОС теме

Данный механизм возможно реализовать с помощью [window.matchMedia](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia);

Для реализации переключения темы в зависимости от операционной системы необходимы выполнить 3 условия:

-   Определить медиа-запрос для получения пользовательской темы:

```javascript
colorAutomaticTheme = window.matchMedia('(prefers-color-scheme: light)');
```

-   Добавить объект темы в массив тем, который будет подключаться в `ThemeService` при инициализации приложения. В данной теме свойство `className` будет устанавливаться по условию

```javascript
{
    name: 'Как в системе',
    className: this.colorAutomaticTheme.matches ? Themes.Default : Themes.Dark,
    selected: false
},
```

-   Подписаться на обновление темы пользователя и устанавливать активную тему при обновлении.

```javascript
this.colorAutomaticTheme.addEventListener('change', this.setAutoTheme);
```

Пример реализации переключения тем в документации Koobiq [тут.](https://github.com/koobiq/angular-components/blob/main/apps/docs/src/app/components/navbar/navbar.component.ts)

### Кастомизация компонентов

Изменить цвета, размеры и шрифты можно задав соответствующие значения CSS-переменным компонента.
Например:

```css
.kbq-dark .kbq-alert {
    --kbq-alert-default-contrast-container-background: var(--kbq-foreground-contrast-secondary);
    --kbq-alert-default-contrast-container-title: var(--kbq-background-contrast-fade);
}
```

### Совместимость

Работает стабильно с `@koobiq/design-tokens@3.5.1`.

### Использование CSS-переменных

Если уже используются CSS-переменные из пакета `@koobiq/design-tokens`, необходимо удалить CSS-переменные для всех включенных в дизайн систему компонентов.
В них используется значение по умолчанию, они вам больше не нужны.

В каких файлы необходимо внести изменения:

-   css-tokens.css - размеры компонента
-   css-tokens-light.css - цвета компонента для светлой темы
-   css-tokens-dark.css - цвета компонента для темной темы
-   css-tokens-font.css - шрифт, его размеры и параметры для компонента. Его можно удалить.

<details>
  <summary><span class="kbq-markdown__p">Список компонентов дизайн системы со ссылками на их CSS-переменные:</span></summary>
    <ul>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/accordion/accordion-tokens.scss">accordion</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/alert/alert-tokens.scss">alert</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/autocomplete/autocomplete-tokens.scss">autocomplete</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/badge/badge-tokens.scss">badge</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/button/button-tokens.scss">button</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/button-toggle/button-toggle-tokens.scss">button-toggle</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/checkbox/checkbox-tokens.scss">checkbox,pseudo-checkbox</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/code-block/code-block-tokens.scss">code-block</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/datepicker/datepicker-tokens.scss">datepicker</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/dl/dl-tokens.scss">description-list</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/divider/divider-tokens.scss">divider</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/dropdown/dropdown-tokens.scss">dropdown</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/empty-state/empty-state-tokens.scss">empty-state</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/file-upload/file-upload-tokens.scss">file-upload</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/form-field/form-field-tokens.scss">form-field</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/form-field/hint-tokens.scss">hint</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/icon/icon-tokens.scss">icon</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/icon/icon-button-tokens.scss">icon-button</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/icon/icon-item-tokens.scss">icon-item</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/input/input-tokens.scss">input</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/link/link-tokens.scss">link</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/list/list-tokens.scss">list</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/loader-overlay/loader-overlay-tokens.scss">loader-overlay</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/modal/modal-tokens.scss">modal</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/markdown/markdown-tokens.scss">markdown</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/navbar/navbar-tokens.scss">navbar</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/popover/popover-tokens.scss">popover</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/progress-bar/progress-bar-tokens.scss">progress-bar</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/progress-spinner/progress-spinner-tokens.scss">progress-spinner</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/radio/radio-tokens.scss">radio</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/risk-level/risk-level-tokens.scss">risk-level</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/select/select-tokens.scss">select</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/sidepanel/sidepanel-tokens.scss">sidepanel</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/scrollbar/scrollbar-tokens.scss">scrollbar-component</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/core/styles/theming/scrollbar-tokens.scss">scrollbar</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/core/forms/forms-tokens.scss">forms</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/core/option/option-tokens.scss">option</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/core/option/optgroup-tokens.scss">optgroup</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/core/option/option-action-tokens.scss">option-action</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/splitter/splitter-tokens.scss">splitter</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/tags/tag-tokens.scss">tag</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/tags/tag-input-tokens.scss">tag-input</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/table/table-tokens.scss">table</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/textarea/textarea-tokens.scss">textarea</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/timezone/timezone-option-tokens.scss">timezone</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/toast/toast-tokens.scss">toast</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/toggle/toggle-tokens.scss">toggle</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/tooltip/tooltip-tokens.scss">tooltip</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/tree/tree-tokens.scss">tree</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/tree-select/tree-select-tokens.scss">tree-select</a></li>
    </ul>
</details>

### Источник значений токенов

**Токены дизайн-системы** – это набор значений, которые определяют визуальный стиль наших компонентов.
Они хранятся в пакете [@koobiq/design-tokens](https://github.com/koobiq/design-tokens) и позволяют нам легко управлять стилем и обеспечивать его согласованность во всех компонентах.

**Компонентные CSS-переменные** – это набор значений, которые используются в стилях наших компонентов. Они задаются на основе токенов и хранятся в репозитории `@koobiq/components`.
Это позволяет нам легко использовать токены в стилях компонентов и ускоряет разработку, в том числе проведение дизайн-ревью.

**Обрати внимание!** На данный момент компонентные токены в пакете `@koobiq/design-tokens` больше не обновляются.

### Планы

-   Проведем обновление наших компонентных CSS-переменных и будем использовать вместо них глобальные CSS-переменные нашей дизайн-системы напрямую, где необходимо.
-   Удалим компонентные токены из пакета `@koobiq/design-tokens` в версии 4.0.0.
-   Создадим страницу, где будут отображаться глобальные токены дизайн-системы с их визуальным представлением.
-   Будем хранить компонентные токены в формате CSS-переменных в репозитории Angular-компонентов `@koobiq/components`.
