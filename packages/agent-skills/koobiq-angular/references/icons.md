<!-- covers: icon, icon-button, icon-item, button, core, form-field, tooltip -->

# Icons

Contents: Setup · Icon names · Components · Icons in buttons · Size and color · SVG icons · Accessibility

## Setup

Icons come from `@koobiq/icons`, a peer dependency that `ng add @koobiq/components` installs (otherwise
`npm install @koobiq/icons`), and render as a font by default: put `node_modules/@koobiq/icons/fonts/kbq-icons.css`
first in the `styles` array of `angular.json` (full list in `theming.md`). Font icons need no providers. Import the
standalone components from `@koobiq/components/icon` (`KbqIcon`, `KbqIconButton`, `KbqIconItem`) or `KbqIconModule`,
which bundles all three. Details: `node_modules/@koobiq/components/agent-docs/components/icon.md`, with
`icon-button.md` and `icon-item.md` next to it.

```ts
import { Component } from '@angular/core';
import { KbqIcon } from '@koobiq/components/icon';

@Component({
    selector: 'app-status',
    imports: [KbqIcon],
    template: `
        <i kbq-icon="kbq-circle-info_16" aria-hidden="true"></i>
    `
})
export class AppStatus {}
```

## Icon names

- Font icons (the default): the value is a class from `kbq-icons.css`, `kbq-<name>_<size>`, e.g. `kbq-plus_16`,
  `kbq-magnifying-glass_24`.
- SVG icons from a registered sprite or resolver: `<name>_<size>` without the prefix (`plus_16`), optionally
  `namespace:name`.
- Almost every icon exists in 16 and 24 px, a few also in 32, 48 or 64. Each size is drawn separately: pick it in the
  name instead of scaling the icon with CSS.

Never guess a name; look it up for the installed version:

- `node_modules/@koobiq/icons/info/kbq-icons-info.json`: keys are `<name>_<size>`, with English and Russian `tags`.
- `node_modules/@koobiq/icons/fonts/kbq-icons.css`: every font class.
- From 12.2.1 on, `llms-full.txt` in the icons repository at the tag equal to `version` in
  `node_modules/@koobiq/icons/package.json` (tags have no `v` prefix), e.g.
  `https://raw.githubusercontent.com/koobiq/icons/12.2.1/llms-full.txt`. It lists every name with its sizes and tags,
  plus deprecated aliases of renamed icons. Ignore its React and Angular import columns: they describe other packages,
  while `@koobiq/components` needs only the name and size.

```bash
# names containing "gear", then names tagged "delete"
grep -oE '"[a-z0-9-]*gear[a-z0-9-]*_[0-9]+"' node_modules/@koobiq/icons/info/kbq-icons-info.json
grep -oE '"[a-z0-9-]+_[0-9]+":\{[^}]*"delete"' node_modules/@koobiq/icons/info/kbq-icons-info.json
```

## Components

All three use attribute selectors whose value is the icon name.

- `kbq-icon` (`KbqIcon`): a glyph. Inputs: `color`, `autoColor`.
- `kbq-icon-button` (`KbqIconButton`): a clickable icon without a button frame. Inputs: `size` (`KbqIconButtonSize`:
  `'normal'`, the default, for a 24 px icon without padding; `'compact'` for a 16 px icon with padding in a 24 × 24 px
  box), `color`, `disabled`, `tabindex`. Host it on `<button type="button">` (or `<a href>` for navigation): it adds
  `tabindex` but no `role` and no Enter or Space handling, and it resets the native button border and background.
- `kbq-icon-item` (`KbqIconItem`): an icon on a round colored backing, used instead of an illustration to draw
  attention. Inputs: `color` (`theme`, `contrast`, `success`, `warning`, `error`), `[fade]="true"` for a soft backing,
  `[big]="true"` for larger padding.

```html
<button kbq-icon-button="kbq-xmark-s_16" type="button" color="contrast-fade" aria-label="Close"></button>
<button kbq-icon-button="kbq-gear_16" type="button" size="compact" color="theme" aria-label="Settings"></button>
<i kbq-icon-item="kbq-bell_16" color="theme" [fade]="true" aria-hidden="true"></i>
```

## Icons in buttons

Import `KbqButtonModule` from `@koobiq/components/button`.

```html
<button kbq-button color="contrast">
    <i kbqButtonPrefix kbq-icon="kbq-plus_16"></i>
    Add rule
</button>
<button kbq-button aria-label="More actions">
    <i kbq-icon="kbq-ellipsis-vertical_16"></i>
</button>
```

- `kbqButtonPrefix` and `kbqButtonSuffix` put an icon before or after the label, whatever the source order.
- A `kbq-button` holding only icons (at most two) switches to icon-button styling: host class `kbq-button-icon`
  instead of `kbq-button`.
- Leave `color` off icons inside `kbq-button`: without it, an icon takes the button's icon colors, disabled included.

## Size and color

- `color` takes a `KbqComponentColors` value: `theme`, `contrast` (the default look of `kbq-icon`), `contrast-fade`,
  `error`, `warning`, `success`. Write `color="theme"` or bind `[color]="colors.Theme"` with
  `colors = KbqComponentColors`.
- Inside `<kbq-form-field>`, `[autoColor]="true"` on a `kbqPrefix` or `kbqSuffix` icon turns it error-colored while the
  field's control is in the error state.
- Rotate or mirror with `kbq-icon-rotate_90`, `kbq-icon-rotate_180`, `kbq-icon-rotate_270`, `kbq-icon-flip-h`
  (`scaleY(-1)`), `kbq-icon-flip-v` (`scaleX(-1)`) and `kbq-icon-flip-vh`.
- Two-tone SVG icons such as `folder-dot_16` recolor their accent through `--icon-accent-color`; font icons have one
  color.
- Adjust spacing through tokens, never through internal classes. Component styles load after your global stylesheet,
  so use two classes:

```css
.app-toolbar .kbq-icon-button {
    --kbq-icon-button-size-normal-vertical-padding: var(--kbq-size-xxs);
    --kbq-icon-button-size-normal-horizontal-padding: var(--kbq-size-xxs);
}
```

Compact icon buttons read `--kbq-icon-button-size-small-vertical-padding` and its horizontal pair; icon items read
`--kbq-icon-item-size-normal-vertical-padding`, `--kbq-icon-item-size-big-vertical-padding` and their horizontal pairs.

## SVG icons

Use inline SVG for two-tone accents or your own icon sets. Loading from a URL needs `provideHttpClient()`.

```ts
import { provideHttpClient } from '@angular/common/http';
import { kbqIconsProvider } from '@koobiq/components/icon';

bootstrapApplication(AppComponent, {
    providers: [
        provideHttpClient(),
        // Serve node_modules/@koobiq/icons/symbol/svg/sprite.symbol.svg as a static asset.
        kbqIconsProvider(
            { spriteUrl: '/assets/icons/sprite.symbol.svg' },
            { spriteUrl: '/assets/brand/sprite.svg', namespace: 'brand' }
        )
    ]
});
```

- `<i kbq-icon="plus_16"></i>` renders the sprite symbol; `<i kbq-icon="brand:logo_24"></i>` reads the `brand` sprite.
  A name the registry cannot resolve falls back to the font class, so `kbq-plus_16` keeps working.
- To fetch icons one by one, use `kbqIconsResolverProvider((name) => '/assets/icons/' + name + '.svg')` with files
  copied from `node_modules/@koobiq/icons/svg`. A resolver returns a URL, inline markup starting with `<`, or `null`
  to pass; `kbqIconsDictProvider({ ... })` maps names to either.
- SVG icons use `fill: currentColor`, so `color` works; their size comes from the name suffix.

## Accessibility

- Give every icon-only control a name: `aria-label` (or `aria-labelledby`) on the `<button>`. `KbqButton` warns in dev
  mode when an icon-only `kbq-button` has none; `KbqIconButton` does not check.
- A `kbqTooltip` does not name a control: it sets `aria-describedby` only while open. Keep the `aria-label`.
- Add `aria-hidden="true"` to decorative icons, `kbq-icon-item` included: a font glyph is CSS content of the host
  element. Inserted SVG already gets `aria-hidden="true"` and `focusable="false"`.
- Never put `(click)` on a plain `kbq-icon`; use `kbq-icon-button` on a `<button>`, or a `kbq-button`.
- A disabled `kbq-icon-button` drops its `tabindex` and sets `disabled` on the host.
