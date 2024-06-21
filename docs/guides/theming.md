Включение темы является **необходимым** условием для применения всех основных и тематических стилей к вашему приложению.
Существуют различные методы подключения стилей.

#### Простое подключение

Для работы только с одним набором тем, подключите файл преднастроенных стилей.

```scss
@use '@koobiq/components/prebuilt-themes/light-theme.css';
```


#### Переключение темы

##### Подключение базовых стилей светлой и тёмной темы
- Создайте директорию `src/styles/out-of-the-box-theme`
- Добавьте в созданную директорию файлы `_theme.scss` и `_typography.scss`

```
└─ out-of-the-box-theme ············ Директория для подключения стилей
    ├─ _theme.scss ················· Файл для подключенные миксинов темной и светлой темы
    └─ _typography.scss ············ Типографика для маркдауна и текста
```

Подключите необходимые стили в каждом из файлов.

- `_typography.scss`

```scss
@use 'sass:meta';

@use 'node_modules/@koobiq/components/core/styles/tokens';
@use 'node_modules/@koobiq/components/core/styles/typography/typography';

$tokens: meta.module-variables(tokens);

$typography-config: typography.kbq-typography-config($tokens);
$markdown-typography-config: typography.kbq-markdown-typography-config($tokens);
```


- `_theme.scss`


```scss
@use 'sass:meta';

@use 'node_modules/@koobiq/components/core/styles/theming/theming';
@use 'node_modules/@koobiq/components/core/styles/tokens';

@forward 'typography';

$tokens: meta.module-variables(tokens);

$light: theming.kbq-light-theme($tokens);
$dark: theming.kbq-dark-theme($tokens);
```

##### Подключение стилей Koobiq

- Создайте файл `_theme.kbq.scss`

Добавьте основные миксины, включая импорты, и подключите базовую типографику:

- Импорты

```scss
@use 'node_modules/@koobiq/components';

@use 'node_modules/@koobiq/components/core/styles/visual';
@use 'node_modules/@koobiq/components/core/styles/typography';

@use 'node_modules/@koobiq/components/core/styles/koobiq-theme' as *;
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

##### Включение стилей в основной файл стилей

Добавьте все стили в основной файл стилей, включая импорты необходимых зависимостей,
подключение типографики и настройку стилей для переключения между темами:

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

##### Настройка переключения тем

- Добавьте необходимые классы тегу `body` в `index.html`

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>KoobiqTesting</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body class="theme-light kbq">
  <app-root></app-root>
</body>
</html>
```

- Используйте сервис `ThemeService`, который будет обеспечивать функциональность для переключения между светлой и темной темами.

<div class="kbq-alert kbq-alert_info" style="margin-top: 15px;">
    <i class="mc kbq-icon mc-info-o_16 kbq-alert__icon"></i>
    Важно на этом этапе описать процесс переключения между классами светлой и темной тем,
    которые определены в главном файле стиля.
    Реализация может варьироваться.
</div>

Добавьте сервис в компонент и соедините события в шаблоне с переключением темы:

- `app.component.ts`

```ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ThemeService } from '@koobiq/components/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  themeSubscription: Subscription = Subscription.EMPTY;

  get themeSwitch() {
    return this.themeService.themeSwitch;
  }

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeSubscription = this.themeService.getTheme().subscribe();
  }

  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }

  setValue(i: number) {
    this.themeService.setTheme(i);
  }
}
```

- `app.component.html`

```html
<button *ngFor="let theme of themeSwitch.data; let i = index"
        (click)="setValue(i)">
    {{ theme.name }}
</button>
```


#### Кастомизация компонентов через дизайн-токены
Имея цветовую палитру и предустановленные значения размеров и шрифтов, можно легко создавать и настраивать компоненты.
Преимущество данного подхода заключается в том, что один используемый токен будет использовать разные значения для различных тем.
В качестве примера рассмотрим процесс создания компонента с круглой аватаркой и именем.

##### Подготовка
Для начала, подготовьте миксин кастомизируемых компонентов в файле `_theme.kbq.scss` для подключения в основной миксин:

```scss
@mixin app-components-theme($theme) {
    // Здесь подключайте все стили тем для компонентов.
}
```

- Добавьте этот миксин в основной миксин:

```scss
@mixin app-theme($theme) {
    // ... здесь будет ранее написанный код
    @include app-components-theme($theme);
}
```

##### Создание компонента и добавление дизайн-токенов
- Создайте компонент, структура директории которого будет следующей:

```
└─ customized-component ···························· имя компоненты
    ├─ _customized-component-theme.scss ············ Стили темы & типографики (включают to _all-themes & _all-typography)
    ├─ customized-component.component.html ········· Шаблон компонента
    ├─ customized-component.component.scss ········· Основные стили (inline to component. Здесь подключаем геометрию: размеры и т.д.)
    ├─ customized-component.component.spec.ts
    └─ customized-component.component.ts
```

Импортируйте 2 миксина в `_customized-component-theme.scss`, названия которых могут быть произвольными:

```
└─ _customized-component-theme.scss ··························
    ├─ @mixin kbq-customized-component-theme($theme) ········· Отвечает за CSS-правила цветов
    └─ @mixin kbq-customized-component-typography($config) ··· Шаблон компонента
```

Определите необходимые цвета согласно палитре и типы текста в соответствующих миксинах: 

- `_customized-component-theme.scss`

```scss
@use 'node_modules/@koobiq/components/core/styles/typography';

/* mixin for component styling, colors etc. */
@mixin kbq-customized-component-theme($theme) {
  $foreground: map-get($theme, foreground);
  $background: map-get($theme, background);

  .avatar {
    background: map-get($background, background-under);
    color: map-get($foreground, text-less-contrast);

    border: 1px solid map-get($foreground, divider);
  }
}

/* mixin for component fonts, etc. */
@mixin kbq-customized-component-typography($config) {
  .avatar {
    @include typography.kbq-typography-level-to-styles($config, caption);
  }
}
```

Подключите получившиеся миксины в `_theme.kbq.scss`:
```scss
@use '../app/customized-component/customized-component-theme';

//...

@mixin app-components-theme($theme) {
    // ... здесь будет ранее написанный код
    @include customized-component-theme.kbq-customized-component-typography($config);
}

@mixin app-components-theme($theme) {
    @include customized-component-theme.kbq-customized-component-theme($theme);
}
```

Задайте необходимые размеры в файле `customized-component.component.scss`, используя ранее объявленные токены в `styles/out-of-the-box-theme/theme`:

```scss
@use '../../styles/out-of-the-box-theme/theme' as tokens;

.avatar {
  width: map-get(tokens.$tokens, size-4xl);
  height: map-get(tokens.$tokens, size-4xl);
  border-radius: map-get(tokens.$tokens, size-4xl);

  display: flex;
  justify-content: center;
  align-items: center;
}
```

И добавьте разметку в шаблон компонента в `customized-component.component.html`:
```html
<div class="avatar">KBQ</div>
```

##### Использование в компоненте
Токены могут быть импортированы и использованы в JavaScript/TypeScript коде в виде переменной.

Импортируйте его как обычную зависимость для использования. Как пример, представлено использование предустановленных размеров в Koobiq.

```ts
import { Size3xs, SizeL, SizeM, SizeXs, SizeXxs } from '@koobiq/design-tokens';
```

##### Использование CSS-переменных

- Простой способ

1. Скопируйте файл `css-tokens.css` из `node_modules/@koobiq/design-tokens/web в `src/styles`
2. В раздел `head` в файле `index.html`, добавьте токены `<link rel="stylesheet" href="styles/css-tokens.css">`
3. Добавьте в `angular.json` в раздел architect/build/options/styles стили - `"src/styles/css-tokens.css"`
4. Используйте CSS-переменные вместо объявленных ранее токенов. 

```scss
.avatar {
  width: var(--kbq-popover-header-size-height);
  height: var(--kbq-popover-header-size-height);
  border-radius: var(--kbq-popover-header-size-height);

  display: flex;
  justify-content: center;
  align-items: center;
}
```

#### Кастомные токены

Для описания токенов мы используем [Style-Dictionary](http://amzn.github.io/styledictionary/#/architecture).

Использование предустановленных токенов не является обязательным, их значения могут быть изменены без изменения определений токенов.

Для этого нужно:

- Добавьте style-dictionary к дев зависимостям в `package.json`

```
// NPM
npm install --save-dev style-dictionary
```

```
// Yarn
yarn add --dev style-dictionary
```

- Подготовьте новую тему для генерации кастомных токенов
  - Создайте директорию `customized-theme` в директории `src/styles`
  - В сформированной директории темы создайте директорию `properties` и добавьте файлы с расширением `json5` для значений, которые необходимо изменить.

Список возможных файлов:
```
└─ properties ···················
    ├─ colors.json5 ············· Именованные цвета для основных состояний и главных цветов
    ├─ globals.json5 ············ Размеры, общие цвета и т.д.
    ├─ md-typography.json5 ······ Типографика для маркдауна
    ├─ typography.json5 ········· Общая типографика
    └─ palette.json5  ··········· Палитра цветов со значениями
```

- Создайте скрипт генерации токенов в `scripts/build-tokens.js`

Данный скрипт расширяет и меняет значение базовых токенов, складывая их в директорию, указанную в `outputPath`.

```javascript
const buildTokens = require('@koobiq/tokens-builder/build');

const koobiqTokensProps = './node_modules/@koobiq/design-tokens/web/properties/**/*.json5';
const koobiqTokensComponents = './node_modules/@koobiq/design-tokens/web/components/**/*.json5';


buildTokens([
    {
        name: 'customized-theme',
        buildPath: [
            koobiqTokensProps,
            `src/styles/customized-theme/properties/**/*.json5`,
            koobiqTokensComponents
        ],
        outputPath: 'src/styles/customized-theme/'
    }
])
```

- Примените новую тему аналогично подключению базовых стилей светлой и темной темы.

##### Применение разных наборов кастомных токенов

Для переключения между наборами кастомных токенов требуется изменить структуру директории `styles`:

```
└─ styles
    └─ koobiq ·························· Директория с наборами
        ├─ customized-theme ············ Сгенерированный набор кастомных токенов с импортированными токенами
        ├─ out-of-the-box-theme ········ Набор с токенами по умолчанию из пакета Koobiq
        ├─ _index.scss
        └─ _theme.kbq.scss
```

Импортируйте `_theme.scss` из каждой темы в `_index.scss`:

```scss
@forward 'out-of-the-box-theme/theme' as out-of-the-box-theme-*;

@forward 'customized-theme/theme' as customized-theme-*;
```


Импортируйте наборы в главный файл стилей и задайте им определённый CSS-селектор и подключить миксины типографики и цветов:

```scss
@use './styles/koobiq' as tokens;

.kbq {
    &.theme-light {
        &.out-of-the-box {
            @include theme-kbq.app-typography(
                    tokens.$out-of-the-box-theme-tokens,
                    tokens.$out-of-the-box-theme-typography-config,
                    tokens.$out-of-the-box-theme-markdown-typography-config
            );

            @include theme-kbq.app-theme(tokens.$out-of-the-box-theme-light);
        }

        &.customized {
            @include theme-kbq.app-typography(
                    tokens.$customized-theme-tokens,
                    tokens.$customized-theme-typography-config,
                    tokens.$customized-theme-markdown-typography-config
            );

            @include theme-kbq.app-theme(tokens.$customized-theme-light);
        }
    }

    &.theme-dark {
        &.out-of-the-box {
            @include theme-kbq.app-typography(
                    tokens.$out-of-the-box-theme-tokens,
                    tokens.$out-of-the-box-theme-typography-config,
                    tokens.$out-of-the-box-theme-markdown-typography-config
            );

            @include theme-kbq.app-theme(tokens.$out-of-the-box-theme-dark);
        }

        &.customized {
            @include theme-kbq.app-typography(
                    tokens.$customized-theme-tokens,
                    tokens.$customized-theme-typography-config,
                    tokens.$customized-theme-markdown-typography-config
            );

            @include theme-kbq.app-theme(tokens.$customized-theme-dark);
        }
    }
}
```


#####  Настройка переключения наборов кастомных токенов

<div class="kbq-alert kbq-alert_info" style="margin-top: 15px;">
    <i class="mc kbq-icon mc-info-o_16 kbq-alert__icon"></i>
    Важно на этом этапе описать процесс переключение между классами наборов токенов,
    которые определены в главном файле стиля.
    Реализация может варьироваться.
</div>

- Добавьте переключение тем с помощью подключенного ранее сервиса в компонент и соедините в шаблоне.
