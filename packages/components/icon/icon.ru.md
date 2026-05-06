## Шрифтовые иконки (по умолчанию)

Использует CSS-шрифт `@koobiq/icons`. Провайдеры не требуются — достаточно подключить стили.

Установите зависимость и настройте `angular.json`:

```bash
npm install @koobiq/icons
```

```json
"styles": [
  "node_modules/@koobiq/icons/fonts/kbq-icons.css"
]
```

```ts
import { KbqIconModule } from '@koobiq/components/icon';

@Component({
    imports: [KbqIconModule],
    template: `
        <i kbq-icon="kbq-plus_16"></i>
    `
})
export class AppComponent {}
```

Список доступных иконок: [Иконки](/ru/icons)

---

### SVG-иконки

#### Спрайт-файл

Подходит, если у вас готовый SVG-спрайт и все иконки нужно загрузить одним HTTP-запросом.

```ts
import { provideKoobiqIcons } from '@koobiq/components/icon';

bootstrapApplication(AppComponent, {
    providers: [
        provideKoobiqIcons(
            { spriteUrl: '/assets/icons/sprite.symbol.svg' },
            { spriteUrl: '/assets/brand/sprite.symbol.svg', namespace: 'brand' }
        )
    ]
});
```

```html
<i kbq-icon="plus_16"></i>
<i kbq-icon="brand:logo_24"></i>
```

#### Обработка URL

Подходит, если иконки расположены по предсказуемым URL и должны загружаться по требованию (без спрайта).

```ts
import { provideKoobiqIconsResolver } from '@koobiq/components/icon';

bootstrapApplication(AppComponent, {
    providers: [
        provideKoobiqIconsResolver((name) => `/assets/icons/${name}.svg`)
    ]
});
```

```html
<i kbq-icon="plus_16"></i>
```

#### Встроенные компоненты (`@koobiq/angular-icons`)

Подходит, когда нужен tree-shaking.

```bash
npm install @koobiq/angular-icons
```

```ts
import { KbqPlus16 } from '@koobiq/angular-icons';

@Component({
    standalone: true,
    imports: [KbqPlus16],
    template: `
        <svg kbqPlus16></svg>
    `
})
export class AppComponent {}
```
