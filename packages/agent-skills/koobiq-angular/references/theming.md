<!-- covers: core, button -->

# Theming and design tokens

Contents: Setup · Switching themes · Global tokens · Typography · Customizing one component · Dark mode pitfalls

A theme is a set of CSS custom properties under a theme class on `<body>`; components and your styles read the same
global tokens, so switching the class restyles the app. Full guide:
`node_modules/@koobiq/components/agent-docs/guides/theming.md`.

## Setup

List the styles in this order in the `styles` array of `angular.json`, your own stylesheet last (the list that
`ng add @koobiq/components` writes for its default `'auto'` theme):

```json
"styles": [
    "node_modules/@koobiq/icons/fonts/kbq-icons.css",
    "node_modules/@koobiq/design-tokens/web/css-tokens.css",
    "node_modules/@koobiq/design-tokens/web/css-tokens-light.css",
    "node_modules/@koobiq/design-tokens/web/css-tokens-dark.css",
    "node_modules/@koobiq/components/prebuilt-themes/theme.css",
    "src/styles.css"
]
```

- `css-tokens.css` declares theme-independent tokens on `:root` (sizes, typography, raw palettes); the light and dark
  files declare colors, shadows and opacity under `.kbq-light` and `.kbq-dark`. `theme.css` is the one prebuilt theme
  for both schemes. Leave out `light-theme.css` and `dark-theme.css` (deprecated copies of `theme.css`) and
  `css-tokens-font.css` (only deprecated component tokens).
- In `index.html`, write `<body class="kbq-app-background kbq-light">`. `kbq-app-background` paints the page background
  and text color; `kbq-light` or `kbq-dark` selects the tokens and sets `color-scheme` for native controls.
- Load the fonts yourself, the tokens only name them: Inter 400, 500, 600, 700 and italic 400, 500; JetBrains Mono 400
  and 700 (for example `@fontsource/inter` and `@fontsource/jetbrains-mono`).

## Switching themes

`KbqThemeService` from `@koobiq/components/core` puts the active theme class on `<body>`, stores the choice and, in the
default `'auto'` mode, follows the OS color scheme. Configure it with `kbqThemeProvider` and inject it once at startup:
nothing in the library creates it, and until something does, `'auto'` is never applied.

```ts
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID, provideAppInitializer } from '@angular/core';
import { kbqThemeProvider, KbqThemeService } from '@koobiq/components/core';

bootstrapApplication(AppComponent, {
    providers: [
        kbqThemeProvider({ mode: 'auto', storageKey: 'my-app-theme' }),
        provideAppInitializer(() => {
            if (isPlatformBrowser(inject(PLATFORM_ID))) inject(KbqThemeService);
        })
    ]
});
```

- `mode()` returns `'light'`, `'dark'` or `'auto'`; `colorScheme()` the resolved `'light'` or `'dark'`. Switch with
  `setMode('dark')` or `toggle()`, e.g. `(click)="theme.toggle()"` with `theme = inject(KbqThemeService)`. Use that
  root instance; never list `KbqThemeService` in a component's `providers`, or two instances fight over `<body>`.
- The choice persists in `localStorage` (`KbqThemeLocalStorageStore`) and reaches other open tabs. With SSR, keep it in
  a cookie so the server renders the right theme: `{ provide: KBQ_THEME_STORE, useExisting: KbqThemeCookieStore }`.
- Loading one token file only? Register just that theme, or a stored value or `toggle()` can switch to a theme without
  tokens: `themes: [{ name: 'light', className: 'kbq-light', colorScheme: 'light' }]` next to `mode: 'light'`.
- Extra themes are `KbqThemeConfig` entries (`name`, `className`, `colorScheme`) in `themes`, which replaces the default
  list; `selectTheme(name)` pins one, `setMode()` releases it. Tokens exist only under `.kbq-light` and `.kbq-dark`, so
  reuse `KbqThemeSelector.Light` or `KbqThemeSelector.Dark` as `className` unless your CSS defines every token.
  Details: `node_modules/@koobiq/components/agent-docs/components/core.md`.

## Global tokens

Style your own markup with global tokens only; never hard-code colors, spacing, radii, shadows or font sizes. Pick
tokens by role (fills from background, text from foreground, borders from line) and never borrow a component token such
as `--kbq-button-size-height`. Values: `node_modules/@koobiq/design-tokens/web/css-tokens-light.css` (same names in
the dark file) and `node_modules/@koobiq/design-tokens/web/css-tokens.css`; skip entries marked `DEPRECATED`.

- Surfaces: `--kbq-background-bg` (page), `--kbq-background-bg-secondary`, `--kbq-background-card`,
  `--kbq-background-contrast`, `--kbq-background-theme-fade`, `--kbq-background-error-fade`.
- Text: `--kbq-foreground-contrast`, `--kbq-foreground-contrast-secondary`, `--kbq-foreground-contrast-tertiary`,
  `--kbq-foreground-theme`, `--kbq-foreground-error`, `--kbq-foreground-on-contrast` (on `--kbq-background-contrast`).
- Icons and lines: `--kbq-icon-contrast`, `--kbq-icon-contrast-fade`, `--kbq-icon-theme`, `--kbq-icon-error`;
  borders and dividers `--kbq-line-contrast-less`, `--kbq-line-contrast-fade`, `--kbq-line-theme`, `--kbq-line-error`.
- States: `--kbq-states-background-transparent-hover`, `--kbq-states-background-transparent-active`,
  `--kbq-states-line-focus-theme` (focus ring), `--kbq-states-foreground-disabled`, `--kbq-opacity-disabled`.
- Spacing and sizes: `--kbq-size-3xs` 2px, `--kbq-size-xxs` 4px, `--kbq-size-xs` 6px, `--kbq-size-s` 8px,
  `--kbq-size-m` 12px, `--kbq-size-l` 16px, `--kbq-size-xl` 20px, `--kbq-size-xxl` 24px, `--kbq-size-3xl` 32px, up to
  `--kbq-size-7xl` 64px; `--kbq-size-border-width` 1px; `--kbq-size-border-radius` 8px, the only radius token.
- Shadows: `--kbq-shadow-card`, `--kbq-shadow-popup`, `--kbq-shadow-overlay`; scroll edges
  `--kbq-shadow-overflow-normal-top` and `--kbq-shadow-overflow-normal-bottom`.
- Typography: `--kbq-font-family-base`, `--kbq-font-family-mono` and the per-style variables below.

```scss
.app-card {
    padding: var(--kbq-size-l);
    border: var(--kbq-size-border-width) solid var(--kbq-line-contrast-less);
    border-radius: var(--kbq-size-border-radius);
    background: var(--kbq-background-card);
    color: var(--kbq-foreground-contrast);
    box-shadow: var(--kbq-shadow-card);
}
```

## Typography

`theme.css` defines classes that set font family, size, weight, line height, letter spacing, text transform and font
features, never color. The prebuilt styles set no font on `<body>`, so give every text block a class and color it with a
foreground token.

- Display and headings: `kbq-display-big`, `kbq-display-normal`, `kbq-display-compact` (each also `-strong`),
  `kbq-headline`, `kbq-title`, `kbq-subheading`.
- Body: `kbq-text-big`, `kbq-text-normal`, `kbq-text-compact` (each also `-medium` and `-strong`).
- Special: `kbq-caps-*` (uppercase), `kbq-mono-*` (JetBrains Mono), `kbq-tabular-*` (tabular digits), `kbq-italic-*`,
  each as `big`, `normal` or `compact`, also `-strong`: `kbq-caps-compact-strong`.
- Long-form content: `kbq-md-h1` to `kbq-md-h6`, `kbq-md-body`, `kbq-md-body-mono`, `kbq-md-caption`.

In CSS, read a style's variables instead of copying numbers: `--kbq-typography-text-normal-font-size`,
`--kbq-typography-text-normal-line-height` and the matching `-font-weight`, `-letter-spacing`, `-font-family`; swap
`text-normal` for another style name, such as `caps-compact`.

## Customizing one component

Each component declares its own tokens on its root element (for the button, names such as `--kbq-button-size-height`)
in files like `node_modules/@koobiq/components/button/button-tokens.scss`. Redefine those tokens instead of overriding
`background`, `color` or `padding` on internal `.kbq-*` classes: every state and theme reads its own token. A token set
only on an ancestor does nothing, because the root declares its own value, and Angular injects that declaration after
your global stylesheet, so a one-class selector loses the tie. Use two classes: a wrapper plus the root class, or
`.kbq-button.app-delete` for one instance. An icon-only button carries `kbq-button-icon` instead of `kbq-button`.

```css
/* <section class="app-danger-zone"><button kbq-button color="contrast">Delete</button></section> */
.app-danger-zone .kbq-button,
.app-danger-zone .kbq-button-icon {
    --kbq-button-filled-contrast-fade-off-background: var(--kbq-background-error);
    --kbq-button-filled-contrast-fade-off-foreground: var(--kbq-foreground-white);
    --kbq-button-filled-contrast-fade-off-left-icon: var(--kbq-icon-white);
    --kbq-button-filled-contrast-fade-off-states-hover-background: var(--kbq-states-background-error-hover);
}
```

- Different values per theme: prefix the selector with `.kbq-light` or `.kbq-dark`.
- To rebrand, redefine global tokens under `.kbq-light` and `.kbq-dark` in one file loaded after the token files;
  components follow, since their tokens point to global ones. Only this file may hold raw color values.

## Dark mode pitfalls

- Without `css-tokens-dark.css`, every color token is undefined under `.kbq-dark`.
- Literal colors and the raw scales (`--kbq-plt-blue-1`, `--kbq-palette-blue-1`, `--kbq-semantic-contrast-1`) are
  declared once on `:root` and stay the same in both themes; use the role tokens above.
- Keep the theme class on `<body>`: dropdowns, selects, tooltips, modals and toasts render in the CDK overlay container
  under `<body>`, so they ignore theme classes on inner wrappers, a nested `kbq-dark` island included. Inside Shadow
  DOM, add `kbqShadowDomOverlayProvider()` and load the Koobiq styles and tokens into the shadow root.
- Branch on `colorScheme()`, not `mode()`, for the actual appearance (chart palettes, images): `mode()` can be `'auto'`.
- Dark shadows are 1px outlines, not drop shadows: use the shadow tokens, never a custom `box-shadow`.
