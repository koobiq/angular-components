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
import { provideHttpClient } from '@angular/common/http';
import { kbqIconsProvider } from '@koobiq/components/icon';

bootstrapApplication(AppComponent, {
    providers: [
        kbqIconsProvider(
            { spriteUrl: '/assets/icons/sprite.symbol.svg' },
            { spriteUrl: '/assets/brand/sprite.symbol.svg', namespace: 'brand' }
        )
    ]
});

@Component({
    imports: [KbqIconModule],
    template: `
        <i kbq-icon="plus_16"></i>
        <i kbq-icon="brand:logo_24"></i>
    `
})
export class AppComponent {}
```

#### Обработка URL

Подходит, если иконки расположены по предсказуемым URL и должны загружаться по требованию (без спрайта).

```ts
import { provideHttpClient } from '@angular/common/http';
import { kbqIconsResolverProvider } from '@koobiq/components/icon';

bootstrapApplication(AppComponent, {
    providers: [
        kbqIconsResolverProvider((name) => `/assets/icons/${name}.svg`)
    ]
});

@Component({
    imports: [KbqIconModule],
    template: `
        <i kbq-icon="plus_16"></i>
    `
})
export class AppComponent {}
```
