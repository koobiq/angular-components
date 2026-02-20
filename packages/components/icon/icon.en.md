### Installation

Note that Koobiq Icons is an optional package and must be installed manually.

#### Updated icon package

We are excited to introduce the updated icon package!
We want to keep the package name `@koobiq/icons` and allow a smooth migration (using both packages in a project simultaneously).

The new version of icons is available on [GitHub](https://github.com/koobiq/icons) as `@koobiq/icons@9.0.0`.

The old icon set will now be called `@koobiq/icons-lts`.

#### NPM

```bash
npm install @koobiq/icons --save
```

Then import the styles:

```scss
@use '@koobiq/icons/fonts/kbq-icons.css';
```

And import `KbqIconModule` into your module:

```ts
import { KbqIconModule } from '@koobiq/components';
```

If `*.css` is not used in your project, you can also use one of these alternatives:

- kbq-icons.less;
- kbq-icons.scss;
- kbq-icons-embed.css (includes embedded fonts)

### Usage examples

There are two ways to use icons:

1. Add the `[color]` attribute using one of the following values: _theme_, _contrast_, _contrast-fade_, _error_, _warning_, _success_.

```html
<i kbq-icon="kbq-gear_16" [color]="'contrast'"></i>
```

2. The simpler way:

```html
<i class="kbq kbq-gear_16"></i>
```
