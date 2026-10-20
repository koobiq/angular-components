---
paths:
    - '**/*.scss'
---

# Styles and theming

- Components use `ViewEncapsulation.None` with `kbq-`-prefixed classes. Stylelint enforces the prefix (`dev-`, `e2e-`, `example-`, `docs-` in the other packages; `cdk-` and `ng-` always allowed) and kebab-case mixin names.
- `<name>-tokens.scss` declares the component's `--kbq-<name>-*` custom properties in terms of the global `--kbq-*` tokens from `@koobiq/design-tokens`; `_<name>-theme.scss` consumes them. A component-specific look is expressed by redefining that component's tokens, not by editing the shared theme mixins.
- `packages/components/_index.scss` forwards `core`, the theming API and `_koobiq-theme.scss`, whose `koobiq-theme()` and `koobiq-typography()` mixins aggregate the global (directive-level) themes. `styles:build-all` compiles every SCSS file to `dist/scss-compiled` and copies the prebuilt theme (`theme.css`, light and dark in one file) into `dist/components/prebuilt-themes`, which is what the package `exports` expose.
- Read token values from `@koobiq/design-tokens/web/new/` or from computed styles, not from the legacy top-level `css-tokens*.css`.
- `kbq-form-field` alone owns the 12px left inset, and the controls zero their own padding. To change a control inside a form field, redefine `--kbq-form-field-*` tokens in the control's own stylesheet under its host type class (`.kbq-form-field-type-select`), never in the shared `_form-field-theme.scss`, which every control uses.
- When a container theme restyles a nested `kbq-button`, include the button's style class in the selector (`> .kbq-button.kbq-button_transparent`): a bare `> .kbq-button` has the specificity of `kbq-button-theme()`, so the winner depends on the order an app injects styles.
- Highlight options and menu items from the one signal that follows both mouse and keyboard — `.kbq-active` (options), `.cdk-focused` (dropdown items), `.kbq-focused` (tree-select panel) — never from `:hover`, so only one item is lit at a time.
- `.kbq-active` means highlighted in `KbqOption` but pressed in list, tree and dropdown, so the pressed hook of `KbqOption` is `.kbq-pressed`.
- Do not join two elements with a `-1px` margin unless the covering element is opaque: the `--kbq-states-background-*` tokens are translucent, and the overlap doubles the alpha into a visible hairline.
- To truncate a label next to icons, give the label its own block box (`kbq-truncate-line()`, `min-width: 0`) inside a flex row, with the icons beside it, and put `#kbqTitleContainer` and `#kbqTitleText` on that box so the tooltip measures what actually truncates.
- A CSS transition does not run on an element's first style resolution, so an entrance set before the first render needs keyframes. Every animated rule includes `kbq-animations-off()` (see `components.md`).
