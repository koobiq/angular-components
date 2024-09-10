### Что нового?

Теперь использование компонентов стало проще! Мы движемся к полной изоляции компонентов, что позволит вам легко подключать и использовать их. Кроме того, мы убрали необходимость пробрасывать токены для задания цветов компонентам.

### Как использовать?

1. Импортируйте компонент
2. Добавьте `kbq-theme-light` селектор к элементу `<body>` вашего HTML-документа для использования светлой темы и `kbq-theme-dark` для темной темы.

Для переключения тем используйте [ThemeService.](/packages/components/core/services/theme.service.ts)

### Доступные селекторы для темной и светлой темы

Вот таблица доступных селекторов для темной и светлой тем:

| Тема    | Селекторы                                  |
| ------- | ------------------------------------------ |
| Темная  | .kbq-dark, .theme-dark, .kbq-theme-dark    |
| Светлая | .kbq-light, .theme-light, .kbq-theme-light |

Мы рекомендуем использовать те селекторы, которые указаны в сервисе `ThemeService` (`kbq-theme-dark` для темной и `kbq-theme-light` для светлой).

### Как задать кастомные значения компоненту дизайн-системы?

Изменить цвета, размеры и шрифты можно задав соответствующие значения CSS-переменным компонента.
Например:

```css
.kbq-theme-dark {
    --kbq-alert-default-contrast-container-background: custom-color;
    --kbq-alert-default-contrast-container-title: custom-color;
}
```

### Совместимость

Работает стабильно с `@koobiq/design-tokens@3.4.0`.

### Как применить уже имеющиеся кастомные дизайн-токены?

Темы, где значения дизайн-токенов были перезаписаны с помощью Style-Dictionary,
применяются аналогично [заданию кастомных значений компонентам.](#как-задать-кастомные-значения-компоненту-дизайн-системы)

### Нужно ли что-то делать, если уже используются CSS-переменные из пакета @koobiq/design-tokens?

Да, необходимо удалить CSS-переменные для компонентов, которые уже используют стандартные значения из коробки.

В каких файлы необходимо внести изменения:

-   css-tokens.css - размеры компонента
-   css-tokens-light.css - цвета компонента для светлой темы
-   css-tokens-dark.css - цвета компонента для темной темы
-   css-tokens-font.css - шрифт, его размеры и параметры для компонента

Для каких компонентов удалить CSS-переменные (в них используются значения по умолчанию):

-   [alert](/packages/components/alert/alert-tokens.scss)
-   [autocomplete](/packages/components/autocomplete/autocomplete-tokens.scss)
-   [badge](/packages/components/badge/badge-tokens.scss)
-   [button](/packages/components/button/button-tokens.scss)
-   [button-toggle](/packages/components/button-toggle/button-toggle-tokens.scss)
-   [checkbox,pseudo-checkbox](/packages/components/checkbox/checkbox-tokens.scss)
-   [code-block](/packages/components/code-block/code-block-tokens.scss)
-   [datepicker](/packages/components/datepicker/datepicker-tokens.scss)
-   [description-list](/packages/components/dl/dl-tokens.scss)
-   [divider](/packages/components/divider/divider-tokens.scss)
-   [dropdown](/packages/components/dropdown/dropdown-tokens.scss)
-   [empty-state](/packages/components/empty-state/empty-state-tokens.scss)
-   [file-upload](/packages/components/file-upload/file-upload-tokens.scss)
-   [form-field](/packages/components/form-field/form-field-tokens.scss)
-   [hint](/packages/components/form-field/hint-tokens.scss)
-   [icon](/packages/components/icon/icon-tokens.scss)
-   [icon-button](/packages/components/icon/icon-button-tokens.scss)
-   [icon-item](/packages/components/icon/icon-item-tokens.scss)
-   [input](/packages/components/input/input-tokens.scss)
-   [link](/packages/components/link/link-tokens.scss)
-   [list](/packages/components/list/list-tokens.scss)
-   [loader-overlay](/packages/components/loader-overlay/loader-overlay-tokens.scss)
-   [table](/packages/components/table/table-tokens.scss)
-   [textarea](/packages/components/textarea/textarea-tokens.scss)
-   [timezone](/packages/components/timezone/timezone-option-tokens.scss)
-   [toast](/packages/components/toast/toast-tokens.scss)
-   [toggle](/packages/components/toggle/toggle-tokens.scss)
-   [tooltip](/packages/components/tooltip/tooltip-tokens.scss)
-   [tree](/packages/components/tree/tree-tokens.scss)
-   [tree-select](/packages/components/tree-select/tree-select-tokens.scss)

### Откуда теперь брать значения дизайн-токенов для компонентов?

Все актуальные значения для компонентов хранятся в репозитории [@koobiq/design-tokens](https://github.com/koobiq/design-tokens).
Сгенерированные на основе дизайн-токенов CSS-переменные компонентов позволяют сделать их использование более удобным, а также ускорить их разработку, в том числе проведение дизайн-ревью.

### Что планируется сделать дальше?

Мы планируем применить эти улучшения ко всем компонентам и использовать семантические значения для CSS-переменных компонентов, такие как `var(--kbq-size-m)` вместо `12px`.
Это сделает код более читаемым и поддерживаемым.
