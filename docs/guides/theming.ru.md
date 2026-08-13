Тема в Koobiq — это набор CSS-переменных. Смена темы меняет значения переменных, всё остальное остаётся как есть. Здесь описано, как подключить тему, как её переключать и как брать её значения в своих стилях.

### Как устроена темизация

Есть три уровня.

**Глобальные переменные** описывают дизайн-систему: цвета, размеры, шрифты. Они приходят из пакета `@koobiq/design-tokens` и объявлены под селектором темы — `.kbq-light` или `.kbq-dark`. Именно ими вы пользуетесь в своих стилях.

**Переменные компонента** нужны внутри компонентов Koobiq. Имя каждой начинается с названия компонента (`--kbq-button-*`, `--kbq-alert-*`), а значение ссылается на глобальную переменную. Компонент объявляет их сам, поэтому отдельно подключать ничего не нужно.

**Ваши стили** обращаются к глобальным переменным напрямую. Ни импортов, ни миксинов, ни регистрации в едином источнике темы.

Подключить тему — значит поставить класс на `<body>`. Всё, что внутри, и компоненты, и ваша вёрстка, подхватит новые значения само, потому что читает одни и те же переменные.

### Подключение

- [Установите пакет Koobiq](/ru/main/installation).
- Подключите файлы `css-tokens.css`, `css-tokens-light.css` и `css-tokens-dark.css` — в них лежат глобальные значения.
- Подключите файл готовых стилей в свой основной файл. Без него компоненты и всплывающие элементы (окна, выпадающие списки) отобразятся неправильно:

```sass
@use '@koobiq/components/prebuilt-themes/theme.css';
```

- Добавьте класс темы на `<body>`:

```html
<body class="kbq-app-background kbq-light">
    <app></app>
</body>
```

Класс `kbq-app-background` красит саму страницу — фон и цвет текста.

- Импортируйте компонент и пользуйтесь. 🚀

### Переключение тем

Для этого есть `KbqThemeService`. Он ставит нужный класс на `<body>`, запоминает выбор и в режиме `'auto'` следует системной цветовой схеме.

Режима три: `'light'`, `'dark'` и `'auto'`. **По умолчанию — `'auto'`.** Системная цветовая схема поддерживается из коробки: подписываться на `matchMedia` вручную не нужно.

Текущее состояние сервис отдаёт сигналами, их можно читать прямо в шаблоне:

```ts
protected readonly themeService = inject(KbqThemeService);
```

```html
<button kbq-button (click)="themeService.toggle()">
    {{ themeService.colorScheme() === 'dark' ? 'Светлая тема' : 'Тёмная тема' }}
</button>
```

Если тем больше двух и нужен список, а не переключатель «светлая/тёмная», тему можно закрепить по имени. Подробности и живой пример — на странице [Core](/ru/components/core).

#### Селекторы тем

| Тема    | Селектор   |
| ------- | ---------- |
| Светлая | .kbq-light |
| Тёмная  | .kbq-dark  |

#### Настройки

Настройки передаются при запуске приложения:

```ts
import { kbqThemeProvider } from '@koobiq/components/core';

bootstrapApplication(AppComponent, {
    providers: [kbqThemeProvider({ mode: 'auto', storageKey: 'my-app-theme' })]
});
```

Выбор темы сохраняется между визитами — по умолчанию в `localStorage`. Приложения, которые собираются на сервере, могут хранить его в куке: тогда сервер сразу знает, какую тему рисовать. Для этого подключите `KbqThemeCookieStore` через токен `KBQ_THEME_STORE`.

### Как брать значения темы в своих стилях

Напишите переменную там, где нужно значение:

```css
.my-component-text {
    color: var(--kbq-foreground-contrast-secondary);
}
```

Ничего не импортируется, миксин писать не нужно, регистрировать его в едином источнике темы тоже. Значение подставляется в браузере, поэтому при смене темы оно меняется само.

<!-- example(theme-css-variables) -->

Полный список глобальных переменных — на странице [Дизайн-токены](/ru/main/design-tokens/colors).

### Переопределение переменных компонента

Если стандартный вид компонента не подходит, менять нужно не его стили, а значения его переменных. Сначала стоит понять, где эти переменные объявлены — от этого зависит, как до них дотянуться. Каждый компонент задаёт их на своём селекторе, в файле рядом с собой:

```css
/* button-tokens.scss */
.kbq-button,
.kbq-button-icon {
    --kbq-button-filled-contrast-fade-off-background: var(--kbq-background-contrast);
}
```

Кнопка задаёт переменную на себе, поэтому общее объявление в `:root` она просто не увидит. Чтобы переопределение сработало, нужно попасть в тот же самый элемент.

Отсюда два рабочих способа.

**Поменять один экземпляр.** Повесьте на него свой класс и задайте переменную в нём — класс окажется на том же элементе, что и стандартное значение, и, поскольку идёт следом, победит:

```html
<button kbq-button class="my-danger-button">Удалить</button>

<style>
    .my-danger-button {
        --kbq-button-filled-contrast-fade-off-background: var(--kbq-background-error);
    }
</style>
```

**Поменять все компоненты этого типа в приложении.** Здесь нужен селектор потяжелее, чем у самого компонента. Проще всего добавить перед ним селектор темы: заодно можно задать разные значения для светлой и тёмной, если один цвет на обе не годится:

```css
.kbq-light .kbq-button {
    --kbq-button-filled-contrast-fade-off-background: var(--kbq-background-error);
}

.kbq-dark .kbq-button {
    --kbq-button-filled-contrast-fade-off-background: var(--kbq-background-error-fade);
}
```

Такие правила удобно держать в одном файле и подключать его после стилей дизайн-системы — тогда все переопределения приложения лежат в одном месте, а не расползаются по компонентам.

### Компонент на основе темы

Кастомный компонент читает те же глобальные переменные, что и библиотека. Дайте ему файл стилей и отключите изоляцию стилей — это вся настройка:

```ts
@Component({
    selector: 'my-card',
    templateUrl: './my-card.html',
    styleUrl: './my-card.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyCard {}
```

```scss
.my-card {
    padding: var(--kbq-size-l);
    border: var(--kbq-size-border-width) solid var(--kbq-line-contrast-less);
    border-radius: var(--kbq-size-border-radius);

    background: var(--kbq-background-card);
    color: var(--kbq-foreground-contrast);
}
```

Отдельный миксин `_my-card-theme.scss`, который потом нужно регистрировать в едином источнике темы, писать **не надо**.

### Смена оформления одним файлом

Оформление всего приложения меняется в одном месте:

```css
.kbq-light {
    --kbq-background-contrast: #1a3a6b;
    --kbq-foreground-contrast: #0d1b2a;
}

.kbq-dark {
    --kbq-background-contrast: #7ba7e8;
    --kbq-foreground-contrast: #e8eef7;
}
```

Подключите этот файл после файлов дизайн-системы — и все компоненты подхватят новые значения.

Одна честная оговорка: так работает глобальный уровень. Переменные компонента объявлены на его селекторе, поэтому одним общим файлом до них не дотянуться — придётся писать правило на каждый компонент, как показано выше.

### Где посмотреть переменные

Глобальные переменные, со значениями и образцами: [Дизайн-токены](/ru/main/design-tokens/colors).

Отдельной страницы с переменными компонентов пока нет, мы её готовим. Пока смотрите в исходниках:

<details>
  <summary><span class="kbq-markdown__p">Переменные по компонентам</span></summary>
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

### Откуда берутся значения

**Токены дизайн-системы** — это значения, которые задают внешний вид наших компонентов. Они лежат в пакете [@koobiq/design-tokens](https://github.com/koobiq/design-tokens).

**Переменные компонентов** — это значения, которые используются в стилях компонентов. Они получены из токенов дизайн-системы и лежат в репозитории `@koobiq/components`, рядом с самими компонентами.

<div class="kbq-callout kbq-callout_warning">
<div class="kbq-callout__header">Обратите внимание</div>
<div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">

Токены компонентов в пакете `@koobiq/design-tokens` больше не обновляются и будут удалены в версии 4.0.0. Если они остались в ваших копиях `css-tokens.css`, `css-tokens-light.css`, `css-tokens-dark.css` или `css-tokens-font.css` — удалите их: компоненты везут свои значения сами.

</div>
</div>
