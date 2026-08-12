This guide describes how to set up an Angular project to use `@koobiq/components`.

### Installing dependencies

Installation using [Angular CLI](https://angular.dev/cli/add) — recommended, because it installs the
Angular packages at the version your application is already on:

```bash
ng add @koobiq/components
```

Manual installation. First install the Angular packages, using the same range your `package.json`
already has for `@angular/core` — `@angular/animations` requires an exactly matching
`@angular/core`, so a mismatched range fails with `ERESOLVE unable to resolve dependency tree`:

```bash
npm install @angular/animations@^20.3.0 @angular/cdk@^20.2.0
```

Then install the library and the rest of its dependencies:

```bash
npm install @koobiq/components overlayscrollbars@2.7.3 @koobiq/icons @koobiq/design-tokens @koobiq/angular-luxon-adapter @koobiq/luxon-date-adapter @koobiq/date-adapter @koobiq/date-formatter luxon
```

`overlayscrollbars` is pinned to an exact version rather than a range: the scrollbar is built against
that specific release, and this is the version `ng add` installs too.

`@koobiq/angular-luxon-adapter` (or `@koobiq/angular-moment-adapter`) is only needed if you use the
date components — [datepicker](/en/components/datepicker), [timepicker](/en/components/timepicker) or
[filter-bar](/en/components/filter-bar). Either one is a wrapper around a base adapter that has to be
installed next to it — `@koobiq/luxon-date-adapter` or `@koobiq/moment-date-adapter`. npm adds that
base package on its own, Yarn and pnpm do not, so install it explicitly. Install `marked` if you use
[markdown](/en/components/markdown), `highlight.js` if you use
[code-block](/en/components/code-block), and `@angular/router` if you use
[breadcrumbs](/en/components/breadcrumbs).

### Setting up animations

The components use Angular animations, so the application must provide them:

```typescript
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
    providers: [provideAnimations()]
});
```

Without this provider, opening a component that animates — dropdown, select, tooltip, toast,
datepicker — fails with `NG05105: Unexpected synthetic property @state found`.

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
