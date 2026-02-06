В этом руководстве описана настройка Angular-проекта для использования `@koobiq/components`.

### Установка зависимостей

Установка с помощью [Angular CLI](https://angular.dev/cli/add):

```bash
ng add @koobiq/components
```

Ручная установка:

```bash
npm install @koobiq/cdk @koobiq/components @koobiq/icons @koobiq/design-tokens @koobiq/angular-luxon-adapter @koobiq/date-adapter @koobiq/date-formatter luxon @messageformat/core
```

### Настройка стилей

После установки необходимо подключить стили библиотеки. Добавьте следующие файлы в массив `styles` вашего файла `angular.json`:

```json
"styles": [
  "node_modules/@koobiq/icons/fonts/kbq-icons.css",
  "node_modules/@koobiq/design-tokens/web/css-tokens.css",
  "node_modules/@koobiq/design-tokens/web/css-tokens-light.css",
  "node_modules/@koobiq/components/prebuilt-themes/light-theme.css",
  "src/styles.css"
]
```

### Настройка темы

Добавьте класс темы к элементу `<body>` в файле `index.html`:

```html
<body class="kbq-light">
    <app-root></app-root>
</body>
```

Подробнее о настройке и переключении темы читайте в разделе [темизация](/ru/main/theming).

### Настройка типографики

Для корректного отображения компонентов рекомендуется подключить шрифт [Inter](https://github.com/rsms/inter).

Подробнее читайте в разделе [типографика](/ru/main/typography).

### Использование компонента

Добавьте компонент в ваше приложение, чтобы убедиться, что всё работает корректно.

```typescript
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';

@Component({
    imports: [KbqButtonModule, KbqIconModule],
    template: `
        <button kbq-button>
            <i kbq-icon="kbq-plus_16"></i>
            Кнопка
        </button>
    `
})
export class AppComponent {}
```
