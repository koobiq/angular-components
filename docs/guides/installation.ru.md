В этом руководстве описана настройка Angular-проекта для использования `@koobiq/components`.

### Установка зависимостей

Установка с помощью [Angular CLI](https://angular.dev/cli/add):

```bash
ng add @koobiq/components
```

Ручная установка:

```bash
npm install @koobiq/components @angular/cdk @angular/animations overlayscrollbars @koobiq/icons @koobiq/design-tokens @koobiq/angular-luxon-adapter @koobiq/date-adapter @koobiq/date-formatter luxon
```

`@koobiq/angular-luxon-adapter` (или `@koobiq/angular-moment-adapter`) нужен только при использовании
компонентов для работы с датами — [datepicker](/ru/components/datepicker),
[timepicker](/ru/components/timepicker) или [filter-bar](/ru/components/filter-bar). Установите
`marked`, если используете [markdown](/ru/components/markdown), и `highlight.js`, если используете
[code-block](/ru/components/code-block).

### Настройка анимаций

Компоненты используют анимации Angular, поэтому приложение должно их предоставить:

```typescript
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
    providers: [provideAnimations()]
});
```

Без этого провайдера открытие компонента с анимацией — dropdown, select, tooltip, toast,
datepicker — завершится ошибкой `NG05105: Unexpected synthetic property @state found`.

### Настройка стилей

После установки необходимо подключить стили библиотеки. Добавьте следующие файлы в массив `styles` вашего файла `angular.json`:

```json
"styles": [
  "node_modules/@koobiq/icons/fonts/kbq-icons.css",
  "node_modules/@koobiq/design-tokens/web/css-tokens.css",
  "node_modules/@koobiq/design-tokens/web/css-tokens-light.css",
  "node_modules/@koobiq/components/prebuilt-themes/theme.css",
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
