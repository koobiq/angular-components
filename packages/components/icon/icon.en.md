<div class="kbq-callout kbq-callout_theme">
<div class="kbq-callout__header">Note</div>
<div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">

The component requires the [`@koobiq/icons`](https://github.com/koobiq/icons) dependency:

```bash
npm install @koobiq/icons
```

</div>
</div>

After installation, configure `angular.json`:

```json
"styles": [
  "node_modules/@koobiq/icons/fonts/kbq-icons.css",
  // ...
]
```

Usage example:

```ts
import { KbqIconModule } from '@koobiq/components/icon';

@Component({
    imports: [KbqIconModule],
    template: `
        <i kbq-icon="kbq-plus_16"></i>
        <i kbq-icon="kbq-plus-s_24"></i>
        <i kbq-icon="kbq-plus_32"></i>
        <i kbq-icon="kbq-plus_64"></i>
    `
})
export class AppComponent {}
```

Available icons: [Icons](/en/icons)
