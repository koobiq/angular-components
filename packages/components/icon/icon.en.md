### Installation
Note that koobiq Icons is optional package and it should be installed manually.

##### NPM
`npm install @koobiq/icons --save`
##### Yarn
`yarn add @koobiq/icons`

Then you should add icons styles:

`@use '@koobiq/icons/dist/fonts/kbq-icons.css';`

And finally import KbqIconModule to your component module.

`import { KbqIconModule } from '@koobiq/components';`

If kbq-icons.css does't suit your project, you can also add:

- kbq-icons.less;
- kbq-icons-embed.css with embedded font included.

### Variants

There are two icon usage variants:

1. `<i kbq-icon="mc-gear_16"></i>`;

    In this case you can provide `[color]` attribute. It can have following values: *primary*, *secondary*, *error*.

2. Simply `<i class="mc kbq-gear_16"></i>`.
