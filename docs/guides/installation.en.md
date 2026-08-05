This guide describes how to set up an Angular project to use `@koobiq/components`.

### Installing dependencies

Installation using [Angular CLI](https://angular.dev/cli/add):

```bash
ng add @koobiq/components
```

Manual installation:

```bash
npm install @koobiq/components @angular/cdk @angular/animations overlayscrollbars @koobiq/icons @koobiq/design-tokens @koobiq/angular-luxon-adapter @koobiq/date-adapter @koobiq/date-formatter luxon
```

`@koobiq/angular-luxon-adapter` (or `@koobiq/angular-moment-adapter`) is only needed if you use the
date components — [datepicker](/en/components/datepicker), [timepicker](/en/components/timepicker) or
[filter-bar](/en/components/filter-bar). Install `marked` if you use
[markdown](/en/components/markdown), and `highlight.js` if you use
[code-block](/en/components/code-block).

### Setting up animations

The components use Angular animations, so the application must provide them:

```typescript
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
    providers: [provideAnimations()]
});
```

Without this provider, opening a component that animates — dropdown, select, tooltip, toast,
datepicker — fails with `NG05105: Found the synthetic property @state`.

### Setting up styles

After installation, you need to include the library styles. Add the following files to the `styles` array in your `angular.json` file:

```json
"styles": [
  "node_modules/@koobiq/icons/fonts/kbq-icons.css",
  "node_modules/@koobiq/design-tokens/web/css-tokens.css",
  "node_modules/@koobiq/design-tokens/web/css-tokens-light.css",
  "node_modules/@koobiq/components/prebuilt-themes/theme.css",
  "src/styles.css"
]
```

### Setting up theme

Add the theme class to the `<body>` element in your `index.html` file:

```html
<body class="kbq-light">
    <app-root></app-root>
</body>
```

For more information about theme setup and switching, see the [theming](/en/main/theming) section.

### Setting up typography

For proper component rendering, it is recommended to include the [Inter](https://github.com/rsms/inter) font.

For more information, see the [typography](/en/main/typography) section.

### Using a component

Add a component to your application to verify that everything works correctly.

```typescript
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';

@Component({
    imports: [KbqButtonModule, KbqIconModule],
    template: `
        <button kbq-button>
            <i kbq-icon="kbq-plus_16"></i>
            Button
        </button>
    `
})
export class AppComponent {}
```
