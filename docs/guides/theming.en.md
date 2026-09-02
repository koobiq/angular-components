A theme in Koobiq is a set of CSS variables. Switching a theme swaps the values; nothing else has to change. This guide shows how to plug a theme in, how to switch it, and how to use its values in your own styles.

### How theming works

There are three layers.

**Global variables** describe the design system: colors, sizes, fonts. They come from the `@koobiq/design-tokens` package and are declared under the theme selector — `.kbq-light` or `.kbq-dark`. These are the values you reach for in your own styles.

**Component variables** are used inside Koobiq components. Each one is named after its component (`--kbq-button-*`, `--kbq-alert-*`) and points to a global variable. The component declares them itself, so nothing extra has to be included.

**Your styles** use the global variables directly. No imports, no mixins, no registration in a single theme entry point.

Adding a theme to the page means putting a class on `<body>`. Everything below it — components and your own markup alike — picks up the new values automatically, because all of it reads the same variables.

### Setup

- [Install the Koobiq package](/main/installation).
- Include `css-tokens.css`, `css-tokens-light.css` and `css-tokens-dark.css` — these hold the global values.
- Include the prebuilt styles in your main stylesheet. Components and overlays (popups, dropdowns) need this to render correctly:

```sass
@use '@koobiq/components/prebuilt-themes/theme.css';
```

- Add the theme class to `<body>`:

```html
<body class="kbq-app-background kbq-light">
    <app></app>
</body>
```

`kbq-app-background` paints the page itself — background and text color.

- Import a component and use it. 🚀

### Switching themes

Use `KbqThemeService`. It puts the right class on `<body>`, remembers the choice, and in `'auto'` mode follows the system color scheme.

There are three modes: `'light'`, `'dark'` and `'auto'`. **`'auto'` is the default.** The system color scheme is supported out of the box: no `matchMedia` subscription of your own.

The service exposes its current state as signals, so you can read it straight from a template:

```ts
protected readonly themeService = inject(KbqThemeService);
```

```html
<button kbq-button (click)="themeService.toggle()">
    {{ themeService.colorScheme() === 'dark' ? 'Light theme' : 'Dark theme' }}
</button>
```

If you have more than two themes and need a list rather than a light/dark switch, you can pin one by name. See [Core](/components/core) for the details and a live example.

#### Theme selectors

| Theme | Selector   |
| ----- | ---------- |
| Light | .kbq-light |
| Dark  | .kbq-dark  |

#### Settings

Pass the settings when the app starts:

```ts
import { kbqThemeProvider } from '@koobiq/components/core';

bootstrapApplication(AppComponent, {
    providers: [kbqThemeProvider({ mode: 'auto', storageKey: 'my-app-theme' })]
});
```

The choice is saved between visits — in `localStorage` by default, where switching the theme in one tab is picked up by the app's other open tabs. Apps rendered on the server can store it in a cookie instead, so the server already knows which theme to render: provide `KbqThemeCookieStore` through the `KBQ_THEME_STORE` token. It reads the cookie straight off the incoming request, so nothing else has to be wired up on the server.

### Using theme values in your own styles

Write the variable where you need the value:

```css
.my-component-text {
    color: var(--kbq-foreground-contrast-secondary);
}
```

Nothing to import, no mixin to write, nothing to register in a single theme entry point. The value resolves in the browser, so it changes on its own when the theme changes.

<!-- example(theme-css-variables) -->

The full list of global variables is on the [Design tokens](/main/design-tokens/colors) page.

### Overriding a component's variables

When a component's default look doesn't fit, change the values of its variables rather than its styles. Start by knowing where those variables are declared, because that determines how you reach them. Every component sets them on its own selector, in a file next to itself:

```css
/* button-tokens.scss */
.kbq-button,
.kbq-button-icon {
    --kbq-button-filled-contrast-fade-off-background: var(--kbq-background-contrast);
}
```

The button sets the variable on itself, so a blanket declaration in `:root` simply won't be seen. For an override to work, you have to hit that same element.

That leaves two approaches.

**Change a single instance.** Give it a class of your own and set the variable there. The class lands on the same element as the default value and, coming later, wins:

```html
<button kbq-button class="my-danger-button">Delete</button>

<style>
    .my-danger-button {
        --kbq-button-filled-contrast-fade-off-background: var(--kbq-background-error);
    }
</style>
```

**Change every component of that type in the app.** This needs a selector that outranks the component's own. The simplest one to add is the theme selector — which also lets you give light and dark different values, when one color won't do for both:

```css
.kbq-light .kbq-button {
    --kbq-button-filled-contrast-fade-off-background: var(--kbq-background-error);
}

.kbq-dark .kbq-button {
    --kbq-button-filled-contrast-fade-off-background: var(--kbq-background-error-fade);
}
```

Rules like these are worth keeping in one file, loaded after the design system's styles — then all of the app's overrides live in one place instead of scattering across components.

### Building your own component

Your component reads the same global variables the library reads. Give it a stylesheet and turn off style encapsulation — that is the whole setup:

```ts
@Component({
    selector: 'my-card',
    templateUrl: './my-card.html',
    styleUrl: './my-card.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyCard {}
```

```scss
.my-card {
    padding: var(--kbq-size-l);
    border: var(--kbq-size-border-width) solid var(--kbq-line-contrast-less);
    border-radius: var(--kbq-size-border-radius);

    background: var(--kbq-background-card);
    color: var(--kbq-foreground-contrast);
}
```

There is **no** need to write a separate `_my-card-theme.scss` mixin and then register it in a single theme entry point.

### Rebranding with a single file

You can restyle the whole app by overriding CSS variables in one place:

```css
.kbq-light {
    --kbq-background-contrast: #1a3a6b;
    --kbq-foreground-contrast: #0d1b2a;
}

.kbq-dark {
    --kbq-background-contrast: #7ba7e8;
    --kbq-foreground-contrast: #e8eef7;
}
```

Load that file after the design system's own, and every component follows.

One honest limitation: this works at the global layer. Component variables are declared on the component's selector, so a single global file can't reach them — you would need a rule per component, as shown above.

### Where to find the variables

Global variables, with their values and previews: [Design tokens](/main/design-tokens/colors).

Component variables don't have a rendered reference page yet — a proper one is on the way. Until then, read them from the source:

<details>
  <summary><span class="kbq-markdown__p">Component variables, by component</span></summary>
    <ul>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/accordion/accordion-tokens.scss">accordion</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/alert/alert-tokens.scss">alert</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/autocomplete/autocomplete-tokens.scss">autocomplete</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/badge/badge-tokens.scss">badge</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/button/button-tokens.scss">button</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/button-toggle/button-toggle-tokens.scss">button-toggle</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/checkbox/checkbox-tokens.scss">checkbox,pseudo-checkbox</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/code-block/code-block-tokens.scss">code-block</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/datepicker/datepicker-tokens.scss">datepicker</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/dl/dl-tokens.scss">description-list</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/divider/divider-tokens.scss">divider</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/dropdown/dropdown-tokens.scss">dropdown</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/empty-state/empty-state-tokens.scss">empty-state</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/file-upload/file-upload-tokens.scss">file-upload</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/form-field/form-field-tokens.scss">form-field</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/form-field/hint-tokens.scss">hint</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/icon/icon-tokens.scss">icon</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/icon/icon-button-tokens.scss">icon-button</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/icon/icon-item-tokens.scss">icon-item</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/input/input-tokens.scss">input</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/link/link-tokens.scss">link</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/list/list-tokens.scss">list</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/loader-overlay/loader-overlay-tokens.scss">loader-overlay</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/modal/modal-tokens.scss">modal</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/markdown/markdown-tokens.scss">markdown</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/navbar/navbar-tokens.scss">navbar</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/popover/popover-tokens.scss">popover</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/progress-bar/progress-bar-tokens.scss">progress-bar</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/progress-spinner/progress-spinner-tokens.scss">progress-spinner</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/radio/radio-tokens.scss">radio</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/risk-level/risk-level-tokens.scss">risk-level</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/select/select-tokens.scss">select</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/sidepanel/sidepanel-tokens.scss">sidepanel</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/scrollbar/scrollbar-tokens.scss">scrollbar-component</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/core/styles/theming/scrollbar-tokens.scss">scrollbar</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/core/forms/forms-tokens.scss">forms</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/core/option/option-tokens.scss">option</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/splitter/splitter-tokens.scss">splitter</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/tags/tag-tokens.scss">tag</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/tags/tag-input-tokens.scss">tag-input</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/table/table-tokens.scss">table</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/textarea/textarea-tokens.scss">textarea</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/timezone/timezone-option-tokens.scss">timezone</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/toast/toast-tokens.scss">toast</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/toggle/toggle-tokens.scss">toggle</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/tooltip/tooltip-tokens.scss">tooltip</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/tree/tree-tokens.scss">tree</a></li>
        <li><a href="https://github.com/koobiq/angular-components/tree/main/packages/components/tree-select/tree-select-tokens.scss">tree-select</a></li>
    </ul>
</details>

### Where the values come from

**Design system tokens** are the values that define how our components look. They live in the [@koobiq/design-tokens](https://github.com/koobiq/design-tokens) package.

**Component variables** are the values used inside component styles. They are derived from the design tokens and live in the `@koobiq/components` repository, next to the components themselves.

<div class="kbq-callout kbq-callout_warning">
<div class="kbq-callout__header">Note</div>
<div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">

Component tokens in the `@koobiq/design-tokens` package are no longer updated and will be removed in version 4.0.0. If you still have them in your own copies of `css-tokens.css`, `css-tokens-light.css`, `css-tokens-dark.css` or `css-tokens-font.css`, delete them — components carry their own defaults now.

</div>
</div>
