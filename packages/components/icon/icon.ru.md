<div class="kbq-callout kbq-callout_theme">
<div class="kbq-callout__header">Обратите внимание</div>
<div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">

Для работы компонента необходима зависимость [`@koobiq/icons`](https://github.com/koobiq/icons):

```bash
npm install @koobiq/icons
```

</div>
</div>

После установки настройте `angular.json`:

```json
"styles": [
  "node_modules/@koobiq/icons/fonts/kbq-icons.css",
  // ...
]
```

Пример использования:

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

Список доступных иконок: [Иконки](/ru/icons)
