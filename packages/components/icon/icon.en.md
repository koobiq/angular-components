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

All three fetch their icons over HTTP, so the application has to provide an `HttpClient` — without one the registry reports `HttpClient is required for loading icons from URLs` and the icon falls back to its font class. To register icons with no request at all, add them as inline literals through `KbqIconRegistry.addSvgIconLiteral()`.

#### Sprite file

Best when you have a pre-built SVG sprite and want all icons in a single HTTP request.

```ts
import { provideHttpClient } from '@angular/common/http';
import { kbqIconsProvider } from '@koobiq/components/icon';

bootstrapApplication(AppComponent, {
    providers: [
        provideHttpClient(),
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

#### Dictionary

`kbqIconsDictProvider` is the resolver above with the mapping written out: a name→URL record, looked up by icon name. A name the dictionary does not hold falls through to the next resolver, and then to the font class.

```ts
import { provideHttpClient } from '@angular/common/http';
import { kbqIconsDictProvider } from '@koobiq/components/icon';

bootstrapApplication(AppComponent, {
    providers: [
        provideHttpClient(),
        kbqIconsDictProvider({
            plus_16: '/assets/icons/plus_16.svg',
            logo_24: '/assets/brand/logo_24.svg'
        })
    ]
});
```

#### Inline literals

The only setup that issues no request. The markup is passed through Angular's HTML sanitizer, which drops `<svg>` wholesale, so it has to be handed over as `SafeHtml` the application vouches for:

```ts
import { inject, provideAppInitializer } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { KbqIconRegistry } from '@koobiq/components/icon';

bootstrapApplication(AppComponent, {
    providers: [
        provideAppInitializer(() => {
            const sanitizer = inject(DomSanitizer);

            inject(KbqIconRegistry).addSvgIconLiteral('plus_16', sanitizer.bypassSecurityTrustHtml(PLUS_16_SVG));
        })
    ]
});
```

---

### Accessibility

An icon carries no text, so `<i kbq-icon>` is `aria-hidden="true"` by default and assistive technology walks past it. That is right nearly everywhere: the icon repeats a label that is already in the button, the link or the row beside it.

An icon that is the only carrier of its meaning has to opt out and name itself:

```html
<i kbq-icon="kbq-triangle-exclamation_16" role="img" aria-hidden="false" aria-label="Error"></i>
```

`kbq-icon-button` is never hidden — it is interactive, and it needs a name of its own. Give it an `aria-label` (or an `aria-labelledby`); in dev mode it logs a warning when it has neither. On a host that is not a native `<button>` it supplies `role="button"`, Enter/Space activation and `aria-disabled` itself.

---

### Two-tone icons

Some SVG icons (e.g. `folder-dot_16`, `envelope-dot_24`) include an extra accent element that can be recolored independently of the icon's main color. The accent color is controlled by the `--icon-accent-color` CSS variable, which defaults to `currentColor`.

```css
.my-scope {
    --icon-accent-color: var(--kbq-foreground-error);
}
```

The variable only applies to SVG icons — font icons are always single-color.

See the full list of two-tone icons on the [Icons](/en/icons) page with the "Two-color only" filter enabled.
