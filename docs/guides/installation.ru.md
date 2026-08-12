В этом руководстве описана настройка Angular-проекта для использования `@koobiq/components`.

### Установка зависимостей

Установка с помощью [Angular CLI](https://angular.dev/cli/add) — рекомендуемый способ, так как
Angular-пакеты будут установлены той версии, на которой уже находится приложение:

```bash
ng add @koobiq/components
```

Ручная установка. Сначала установите Angular-пакеты, указав тот же диапазон, который уже стоит
в `package.json` для `@angular/core`: `@angular/animations` требует точно совпадающий
`@angular/core`, поэтому несовпадающий диапазон приведёт к ошибке
`ERESOLVE unable to resolve dependency tree`:

```bash
npm install @angular/animations@^20.3.0 @angular/cdk@^20.2.0
```

Затем установите библиотеку и остальные её зависимости:

```bash
npm install @koobiq/components overlayscrollbars@2.7.3 @koobiq/icons @koobiq/design-tokens @koobiq/angular-luxon-adapter @koobiq/luxon-date-adapter @koobiq/date-adapter @koobiq/date-formatter luxon
```

Версия `overlayscrollbars` зафиксирована, а не задана кареткой: скроллбар рассчитан на этот
конкретный релиз, и ту же версию устанавливает `ng add`.

`@koobiq/angular-luxon-adapter` (или `@koobiq/angular-moment-adapter`) нужен только при использовании
компонентов для работы с датами — [datepicker](/ru/components/datepicker),
[timepicker](/ru/components/timepicker) или [filter-bar](/ru/components/filter-bar). Каждый из них —
обёртка над базовым адаптером, который нужно установить рядом: `@koobiq/luxon-date-adapter` или
`@koobiq/moment-date-adapter`. npm добавляет базовый пакет сам, Yarn и pnpm — нет, поэтому указывайте
его явно. Установите `marked`, если используете [markdown](/ru/components/markdown), `highlight.js`,
если используете [code-block](/ru/components/code-block), и `@angular/router`, если используете
[breadcrumbs](/ru/components/breadcrumbs).

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
