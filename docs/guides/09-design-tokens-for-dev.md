0. Intro

To describe the tokens, we use [Style-Dictionary](https://amzn.github.io/style-dictionary/#/architecture)

1. Add Design Tokens to project

Copy the contents of the design-tokens folder to the style folder of your project.
For example, to the default-theme folder

```
.
 -- scripts/
    |-- build-tokens.js
 -- src/
    |-- app
    |-- assets
    |-- environments
    |-- styles/
    |   |-- default-theme/
    |   |   |-- components/
    |   |   |   |-- alert.json5
    |   |   |   |-- autocomplete.json5
    |   |   |   |-- badge.json5
    |   |   |   |-- button.json5
    |   |   |   `-- ...
    |   |   |-- properties/
    |   |   |   |-- aliases.json5
    |   |   |   |-- colors.json5
    |   |   |   |-- font.json5
    |   |   |   `-- ...
    |   |   |-- _palette.scss
    |   |   |-- _theme.scss
    |   |   |-- _typography.scss
    |   |   |-- _variables.scss
    |   |   |-- config.json5
    |   |   `-- css-tokens.css
    |   |-- _common.scss
    |   |-- _fonts.scss
    |   `-- _variables.scss
    |-- favicon.ico
    |-- index.html
    |-- styles.scss
    -- main.ts
```

2. Create build script

```javascript
const buildTokens = require('@koobiq/tokens-builder/build');

const koobiqTokensProps = '../node_modules/@koobiq/design-tokens/web/properties/**/*.json5';
const koobiqTokensComponents = '../node_modules/@koobiq/design-tokens/web/components/**/*.json5';

buildTokens([
    {
        name: 'default-theme',
        buildPath: [koobiqTokensProps, koobiqTokensComponents],
        outputPath: 'src/styles/default-theme/'
    }
]);
```

3. Usage: SASS `styles.scss`

The design tokens are also published as SASS variables.

```scss
@use './styles/fonts';

@use '@koobiq/components/visual';
@use '@koobiq/components/theming';
@use '@koobiq/icons-lts/dist/styles/mc-icons.css';
@use 'pt-product-icons/dist/styles/Product';

// Include Design Tokens
@use './styles/default-theme/theme';

@include visual.koobiq-visual();
@include theming.kbq-core();

// Include all typography for the components.
@include theming.koobiq-typography();

@mixin app-theme($theme) {
    $background: map.get($theme, background);
    $foreground: map.get($theme, foreground);

    background: theming.kbq-color($background, background);
    color: theming.kbq-color($foreground, text);

    @include theming.koobiq-theme($theme);
}

.theme-default {
    &.color-blue {
        // Include all theme styles for the koobiq components.
        @include app-theme($default-light-theme);
    }
}
```

3. Usage: TypeScript

TypeScript type declarations are also published.

```typescript
import {
    VerticalNavbarSizeStatesCollapsedWidth as closedWidth,
    VerticalNavbarSizeStatesExpandedWidth as openedWidth
} from '@koobiq/design-tokens';
```
