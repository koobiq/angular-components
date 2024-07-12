<!-- cspell:disable -->
В этом руководстве дается подробное описание подключения и настройки тем в Angular приложениях с использованием дизайн-системы Koobiq. В нем рассказывается о подключении готовых тем, кастомизации стандартных тем с помощью дизайн-токенов и расширенной кастомизации с использованием кастомных токенов и переменных CSS.

Термины:
- [Миксины](https://sass-lang.com/documentation/at-rules/mixin/) - повторяющиеся участки кода в Sass.

### Базовое подключение темы
Для быстрого запуска вы можете подключить готовую тему из Koobiq. Данный подход позволит использовать стили по-умолчанию для компонентов дизайн системы Koobiq, а также использовать одну из стандартных тем - светлую или темную.

#### Подготовка
Установите пакет дизайн системы Koobiq. Подробнее про установку [тут](./installation.md).

#### Применение темы

Для работы только с одним набором тем, подключите файл преднастроенных стилей в свой основной файл стиля.

```sass
@use '@koobiq/components/prebuilt-themes/light-theme.css';
```

Возможные темы:

| Название файла  | описание                 |
|-----------------|--------------------------|
| light-theme.css | стандартная светлая тема |
| dark-theme.css  | стандартная темная тема  |

#### Пример на Stackblitz
Пример базового подключения можно найти [тут](https://stackblitz.com/edit/vaffk1?file=src%2Fstyles.scss)



### Подключение стандартных тем
В этом разделе вы узнаете, как подключить стили Koobiq, подключить светлую и темную темы и настроить переключение тем. Koobiq позволяет подключать стандартные темы оформления (светлую и темную) с помощью дизайн-токенов. Эти токены представляют элементы дизайна, такие как цвета, шрифты и размеры, что позволяет согласованно настраивать переключение тем в вашем приложении.

#### Описание процесса
Процесс настройки состоит из 4 основных этапов:
1. **Подключение основных стилей светлой и темной темы**, в рамках которой создается отдельная директория с файлами для каждого типа токенов соответственно - цвета тем и типографика.
2. **Подключение стилей Koobiq** - создаётся вспомогательный scss-файл для подключения в основной файл стилей. В данном вспомогательном файле подключаются необходимые для компонентов Koobiq и создаются миксины для подключения в основном файле
3. **Подключение вспомогательного файла стилей в основной файл стилей** - на данном этапе необходимо подключить файлы, где подключили темы на этапе 1 и стили Koobiq на этапе 2. Затем задается подключение типографики и настраиваются стили для переключения тем.
4. **Настройка переключения тем** - данный этап подразумевает реализацию логики подстановки CSS-классов указанной темы.

#### Подключение основных стилей светлой и темной темы
1 Создайте директорию стандартной темы: организуйте свои стили тем, добавив каталог для стандартных тем в каталоге стилей вашего проекта:
```
└─ koobiq
    └─ out-of-the-box-theme ·········· Директория для подключения стилей
      ├─ _theme.scss ················· Файл для подключенные миксинов темной и светлой темы
      └─ _typography.scss ············ Типографика для маркдауна и текста
    └─ _index.scss ··················· Файл, содержащий ссылки на sass-файлы из стандартной темы
```
2 Подключите необходимые стили в каждом из файлов:

- `_typography.scss`

```scss
@use 'sass:meta';

@use '@koobiq/components/core/styles/tokens';
@use '@koobiq/components/core/styles/typography/typography';

$tokens: meta.module-variables(tokens);

$typography-config: typography.kbq-typography-config($tokens);
$markdown-typography-config: typography.kbq-markdown-typography-config($tokens);
```

- `_theme.scss`

```scss
@use 'sass:meta';

@use '@koobiq/components/core/styles/theming/theming';
@use '@koobiq/components/core/styles/tokens';

@forward 'typography';

$tokens: meta.module-variables(tokens);

$light: theming.kbq-light-theme($tokens);
$dark: theming.kbq-dark-theme($tokens);
```

3 Импортируйте стили тем в _index.scss: для дальнейшего использования и подключения в основной файл стилей, определите файлы стилей стандартной темы в [index файле.](https://sass-lang.com/documentation/at-rules/use/#index-files) 

```sass
@forward 'out-of-the-box-theme/theme' as out-of-the-box-theme-*;
```

#### Подключение стилей Koobiq

- Создайте файл `_theme.kbq.scss`

Добавьте основные миксины, включая импорты, и подключите базовую типографику:

- Импорты

```scss
@use '@koobiq/components';

@use '@koobiq/components/core/styles/visual';
@use '@koobiq/components/core/styles/typography';

@use '@koobiq/components/core/styles/koobiq-theme' as *;
```

- Использование

```scss
@include components.kbq-core();

@include visual.body-html();
@include visual.layouts-for-breakpoint();
```

- Подключите базовую типографику:

```scss
@mixin app-typography($tokens, $config, $md-config) {
    @include typography.kbq-typography-level-to-styles($config, body);

    @include koobiq-typography($tokens, $config, $md-config);
}
```

- Подготовьте миксин для подключения в основной файл стилей:

```scss
@mixin app-theme($theme) {
    $background: map-get($theme, background);
    $foreground: map-get($theme, foreground);

    background: components.kbq-color($background, background);
    color: components.kbq-color($foreground, text);

    @include koobiq-theme($theme);
}
```

#### Включение стилей Koobiq в основной файл стилей

Подключите раннее описанные стили в основной файл стилей. Основное здесь - проброс токенов в зависимости от темы.
- Импортируем необходимые зависимости

```scss
@use './styles/theme.kbq' as theme-kbq; // файл, где подключили стили Koobiq
@use './styles/out-of-the-box-theme/theme' as tokens;  // файл с темами
```

- Подключите типографику и настройте стили для переключения темы

```scss
.kbq {
    @include theme-kbq.app-typography(
            tokens.$tokens,
            tokens.$typography-config,
            tokens.$markdown-typography-config
    );
    
    /* selectors the same as in theme.service.ts */
    &.theme-light {
        @include theme-kbq.app-theme(tokens.$light);
    }

    &.theme-dark {
        @include theme-kbq.app-theme(tokens.$dark);
    }
}
```

#### Настройка переключения тем
- CSS-селекторы для темной и светлой темы должны совпадать со значениями тем в инструменте для переключения тем.
- Каждый CSS-класс темы инкапсулирует настроенные цвета для всех стандартных компонентов Koobiq.

Переключение темы представляет собой логику подстановки CSS-классов с указанной темой, которые инкапсулирует настроенные цвета для всех компонентов.

**Подготовка**

Добавьте необходимые классы тегу body в index.html:
- рутовый CSS-класс 
- CSS класс базовой темы, который вызовется, если сервис переключения тем не установит начальную тему

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Koobiq</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body class="theme-light kbq">
  <app-root></app-root>
</body>
</html>
```

**Описание логики переключения тем с помощью ThemeService**

В рамках данного гайда используется сервис `ThemeService` из пакета `@koobiq/components` для управления переключением тем. Данный сервис реализует следующую логику:

1 При запуске приложения, можно передать сервису кастомные названия тем. Иначе, сервис подставит дефолтные значения для тем:

| Выводимое название темы | Имя CSS-класса  |
|-------------------------|-----------------|
| light                   | kbq-theme-light |
| dark                    | kbq-theme-dark  |

2 Установка и изменение темы.

#### Описание переключения в зависимости от операционной системы
Данный механизм возможно реализовать с помощью [window.matchMedia](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia);

Для реализации переключения темы в зависимости от операционной системы необходимы выполнить 3 условия:
- Определить медиа-запрос для получения пользовательской темы: 
```javascript
colorAutomaticTheme = window.matchMedia('(prefers-color-scheme: light)');
```
- Добавить объект темы в массив тем, который будет подключаться в сервисе темы при инициализации приложения. В данной теме свойство `className` будет устанавливаться по условию
```javascript
{
    name: 'Как в системе',
    className: this.colorAutomaticTheme.matches ? Themes.Default : Themes.Dark,
    selected: false
},
```
- Подписаться на обновление темы пользователя и устанавливать активную тему при обновлении. Реализация Chrome & Firefox отличается реализации в Safari:
```javascript
try {
    // Chrome & Firefox
    this.colorAutomaticTheme.addEventListener('change', this.setAutoTheme);
} catch (err) {
    try {
        // Safari
        this.colorAutomaticTheme.addListener(this.setAutoTheme);
    } catch (errSafari) {
        // tslint:disable-next-line:no-console
        console.error(errSafari);
    }
}
```

Пример реализации переключения тем в документации Koobiq [тут.](https://github.com/koobiq/angular-components/blob/main/apps/docs/src/app/components/navbar/navbar.component.ts)

#### Пример на StackBlitz

Пример переключения стандартных тем [тут](https://stackblitz.com/edit/vaffk1-qsgx2k?file=src%2Fstyles.scss)

### Кастомизация компонентов с помощью дизайн-токенов
В этом разделе вы узнаете, как создать настраиваемый компонент с использованием дизайн токенов Koobiq. Имея цветовую палитру и предустановленные значения размеров и шрифтов, можно легко создавать и настраивать компоненты. Преимущество данного подхода заключается в том, что один используемый токен будет использовать разные значения для различных тем.

#### Подготовка
Для возможности кастомизации компонентов с помощью дизайн токенов необходимо настроить [подключение стандартных тем](#подключение-стандартных-тем) без логики переключения тем.

- Создайте файл миксина в основном файле темы: подготовьте миксин кастомизируемых компонентов в файле `_theme.kbq.scss` для подключения в основной миксин `app-theme`. Данный миксин принимает информацию о токенах темы как параметр:
```sass
@mixin app-components-theme($theme) {
    // Здесь подключайте все стили тем для компонентов.
}
```
- Подключите миксин кастомизируемых компонентов в основной миксин:
```sass
@mixin app-theme($theme) {
    // ... здесь будет ранее написанный код
    @include app-components-theme($theme);
}
```

#### Описание процесса
Процесс кастомизации компонента с помощью дизайн-токенов Koobiq состоит из 2 основных этапов:
1. **Создание и настройка компонента.** Здесь создаётся angular компонент по умолчанию и scss-файл темизации. Обычно, имя файла темизации задаётся в формате `_<component-name>-theme.scss`.
2. **Импорт файла темизации кастомного компонента в основной файл стилей** - подключение миксина подключения цветов и миксина стилизации типографики в миксин темизации цветов и в миксин базовой типографики соответственно. Необходимо для корректного переключения тем.

#### Создание компонента и добавление дизайн-токенов

- Создайте новый каталог компонентов со следующей структурой:
```
customized-component
  ├── _customized-component-theme.scss (Миксины стилей темы & типографики)
  ├── customized-component.component.scss (Определение геометрии)
  ├── customized-component.component.html
  ├── customized-component.component.spec.ts
  └── customized-component.component.ts
```
Создайте миксины дизайн-токенов: В _customized-component-theme.scss импортируйте два миксина (названия может быть любым):
-  для стилей цветов компонента, которые берутся из текущей темы
- для типографики компонента

```scss
@use '@koobiq/components/core/styles/typography';

@mixin kbq-customized-component($theme) {
  // ... your component's color styles using tokens from $theme
}

@mixin kbq-customized-component-typography($config) {
  // ... your component's typography styles using $config
}
```
- Определите стили компонента: В `_customized-component-theme.scss` определите необходимые стили. Реализация далее в примере.
- Подключите описанные миксины в `_theme.kbq.scss`:

```scss
@use '../app/customized-component/customized-component-theme';


@mixin app-components-theme($theme) {
    // ... здесь будет ранее написанный код
    @include customized-component-theme.kbq-customized-component-typography($config);
}

@mixin app-components-theme($theme) {
    // ... здесь будет ранее написанный код
    @include customized-component-theme.kbq-customized-component-theme($theme);
}
```

#### Пример на StackBlitz
Пример кастомизации компонентов с помощью дизайн-токенов [тут](https://stackblitz.com/edit/vaffk1-xb18np?file=src%2Fapp%2Fapp.component.ts)

### Использование CSS-переменных
В рамках дизайн-системы Koobiq помимо использования SCSS переменных, возможно использование [CSS переменных.](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

**Подготовка**
Необходимо настроить [подключение стандартных тем](#подключение-стандартных-тем).

#### Описание процесса

Переместите файл с CSS-переменных в вашу директорию со стилями из `@koobiq/design-tokens/web`:
- `css-tokens-dark.css`
- `css-tokens-light.css`
- `css-tokens-font.css`
- `css-tokens.css`

Подключите файлы с CSS-переменными к основному файлу стилей
- Подключите CSS стили к body:
```html
<body
    class="kbq-app-background basic-container app kbq-theme-light kbq-font koobiq"
  >
    <app-root>loading</app-root>
</body>
```
- Используйте CSS-переменные вместо объявленных ранее токенов.

#### Пример на Stackblitz
Пример применения CSS-переменных можно найти [тут](https://stackblitz.com/edit/vaffk1-fhhiz7?file=src%2Fstyles.scss)
