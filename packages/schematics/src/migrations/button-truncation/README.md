### Button Truncation schematics

This schematic migrates `KbqButton` and `KbqButtonToggle` consumers to labels that truncate with an ellipsis
by default. It includes:

- Moving an icon that sits at either edge of the default slot into the `kbqButtonPrefix` / `kbqButtonSuffix`
  slot
- Reporting stylesheets whose overrides the new layout affects
- A note about the one change that has no textual signature to search for

An icon left in the default slot shares one box with the label, and that box has to become a flex row to
centre the icon exactly — which is precisely what stops `text-overflow: ellipsis` from being painted. The
marker slots lay the icon out _beside_ the truncating box, so the label keeps its ellipsis and the icon keeps
its centring. Icon-only buttons are left alone: they have no label to truncate.

The change is silent — every template still compiles and still renders — so what is not migrated only lays
out differently.

#### What is reported, not fixed

| Selector                     | Why                                                                                                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.kbq-button-text`           | was `display: flex`, now `display: inline-block` (a flex box never paints `text-overflow`). Content projected as your own row needs `display: flex; align-items: center` re-declared |
| `.kbq-button-wrapper`        | hand-rolled truncation overrides now stack on top of the built-in one                                                                                                                |
| `.kbq-button-toggle-wrapper` | the projected label moved one level deeper, into `.kbq-button-toggle-text`                                                                                                           |

`.kbq-button` and `.kbq-light-button` also gained `max-width: 100%`, so a button whose label is wider than its
container no longer overflows — it clamps and clips. Nothing in the code identifies those places, so review
screens with narrow buttons, dense toolbars and table cells visually. To upgrade first and adopt truncation
screen by screen, neutralise it in your global styles:

```css
.kbq-button,
.kbq-light-button {
    max-width: none;
}
```

[Params](schema.ts)

Usage for Angular Cli:

```shell
ng g @koobiq/components:button-truncation --project <your project>
```

Usage for Nx:

```shell
nx g @koobiq/components:button-truncation --project <your project>
```

Run it without writing anything first — stylesheet findings are printed either way:

```shell
ng g @koobiq/components:button-truncation --project <your project> --fix=false
```

### Run locally

Build package

```shell
yarn run build:schematics
```

Run command (for example, for `koobiq-docs` project)

```shell
ng g ./dist/components/schematics/collection.json:button-truncation --project koobiq-docs
```

### Result

#### Before

```html
<button kbq-button>
    <i kbq-icon="kbq-plus_16"></i>
    Очень длинный текст кнопки
    <i kbq-icon="kbq-chevron-down-s_16"></i>
</button>

<kbq-button-toggle [value]="1">
    @if (showIcon()) {
    <i kbq-icon="kbq-briefcase_16"></i>
    } Курьером
</kbq-button-toggle>

<!-- icon-only: nothing to truncate, left untouched -->
<button kbq-button aria-label="Add"><i kbq-icon="kbq-plus_16"></i></button>
```

#### After

```html
<button kbq-button>
    <i kbqButtonPrefix kbq-icon="kbq-plus_16"></i>
    Очень длинный текст кнопки
    <i kbqButtonSuffix kbq-icon="kbq-chevron-down-s_16"></i>
</button>

<kbq-button-toggle [value]="1">
    @if (showIcon()) {
    <i kbqButtonPrefix kbq-icon="kbq-briefcase_16"></i>
    } Курьером
</kbq-button-toggle>

<button kbq-button aria-label="Add"><i kbq-icon="kbq-plus_16"></i></button>
```
