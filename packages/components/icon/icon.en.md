## Font icons (default)

Uses `@koobiq/icons` CSS font. No providers needed — works out of the box after adding the stylesheet.

Install the dependency and configure `angular.json`:

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

Available icons: [Icons](/en/icons)

---

### SVG icons

SVG icons render inline and support CSS color theming via `currentColor`. Choose one of the approaches below depending on your needs.

#### Sprite file

Best when you have a pre-built SVG sprite and want all icons in a single HTTP request.

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

#### URL resolver

Best when icons live at predictable URLs and you want them fetched on demand (no sprite required).

```ts
import { provideHttpClient } from '@angular/common/http';
import { kbqIconsResolverProvider } from '@koobiq/components/icon';

bootstrapApplication(AppComponent, {
    providers: [
        provideHttpClient(),
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
