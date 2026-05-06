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

#### URL resolver

Best when icons live at predictable URLs and you want them fetched on demand (no sprite required).

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

#### Bundled components (`@koobiq/angular-icons`)

Best when you need zero HTTP requests and full tree-shaking — only the icons you import are included in the bundle.

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
