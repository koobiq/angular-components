## Шрифтовые иконки (по умолчанию)

Использует CSS-шрифт `@koobiq/icons`. Провайдеры не требуются — достаточно подключить стили.

Установите зависимость и настройте `angular.json`:

```bash
npm install @koobiq/icons
```

```json
"styles": [
  "node_modules/@koobiq/icons/fonts/kbq-icons.css"
]
```

```ts
import { KbqIconModule } from '@koobiq/components/icon';

@Component({
    imports: [KbqIconModule],
    template: `
        <i kbq-icon="kbq-plus_16"></i>
    `
})
export class AppComponent {}
```

Список доступных иконок: [Иконки](/ru/icons)

---

### SVG-иконки

SVG-иконки встраиваются в разметку, а их цвет задаётся через `currentColor`. Выберите один из подходов ниже в зависимости от ваших задач.

Все три загружают иконки по HTTP, поэтому приложение должно предоставить `HttpClient` — без него реестр сообщает `HttpClient is required for loading icons from URLs`, а иконка откатывается к шрифтовому классу. Чтобы зарегистрировать иконки вообще без запросов, добавьте их как встроенные литералы через `KbqIconRegistry.addSvgIconLiteral()`.

#### Спрайт-файл

Подходит, если у вас готовый SVG-спрайт и все иконки нужно загрузить одним HTTP-запросом.

```ts
import { provideHttpClient } from '@angular/common/http';
import { kbqIconsProvider } from '@koobiq/components/icon';

bootstrapApplication(AppComponent, {
    providers: [
        provideHttpClient(),
        kbqIconsProvider(
            { spriteUrl: '/assets/icons/sprite.symbol.svg' },
            { spriteUrl: '/assets/brand/sprite.symbol.svg', namespace: 'brand' }
        )
    ]
});

@Component({
    imports: [KbqIconModule],
    template: `
        <i kbq-icon="plus_16"></i>
        <i kbq-icon="brand:logo_24"></i>
    `
})
export class AppComponent {}
```

#### Обработка URL

Подходит, если иконки расположены по предсказуемым URL и должны загружаться по требованию (без спрайта).

```ts
import { provideHttpClient } from '@angular/common/http';
import { kbqIconsResolverProvider } from '@koobiq/components/icon';

bootstrapApplication(AppComponent, {
    providers: [
        provideHttpClient(),
        kbqIconsResolverProvider((name) => `/assets/icons/${name}.svg`)
    ]
});

@Component({
    imports: [KbqIconModule],
    template: `
        <i kbq-icon="plus_16"></i>
    `
})
export class AppComponent {}
```

#### Словарь

`kbqIconsDictProvider` — тот же обработчик, но с явным списком: запись «имя → URL», по которой ищется иконка. Имя, которого нет в словаре, переходит к следующему обработчику, а затем к шрифтовому классу.

```ts
import { provideHttpClient } from '@angular/common/http';
import { kbqIconsDictProvider } from '@koobiq/components/icon';

bootstrapApplication(AppComponent, {
    providers: [
        provideHttpClient(),
        kbqIconsDictProvider({
            plus_16: '/assets/icons/plus_16.svg',
            logo_24: '/assets/brand/logo_24.svg'
        })
    ]
});
```

#### Встроенные литералы

Единственный вариант, не выполняющий запросов. Разметка проходит через очистку HTML в Angular, которая вырезает `<svg>` целиком, поэтому её нужно передать как `SafeHtml`, за который приложение ручается:

```ts
import { inject, provideAppInitializer } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { KbqIconRegistry } from '@koobiq/components/icon';

bootstrapApplication(AppComponent, {
    providers: [
        provideAppInitializer(() => {
            const sanitizer = inject(DomSanitizer);

            inject(KbqIconRegistry).addSvgIconLiteral('plus_16', sanitizer.bypassSecurityTrustHtml(PLUS_16_SVG));
        })
    ]
});
```

---

### Доступность

У иконки нет собственного текста, поэтому `<i kbq-icon>` по умолчанию помечен `aria-hidden="true"`, и вспомогательные технологии его пропускают. Почти везде это верно: иконка повторяет подпись, которая уже есть в кнопке, ссылке или строке рядом.

Иконка, которая является единственным носителем смысла, должна отказаться от этого умолчания и назвать себя:

```html
<i kbq-icon="kbq-triangle-exclamation_16" role="img" aria-hidden="false" aria-label="Ошибка"></i>
```

`kbq-icon-button` никогда не скрывается: это интерактивный элемент, и ему нужно собственное имя. Задайте `aria-label` (или `aria-labelledby`); в режиме разработки компонент предупреждает, если нет ни того, ни другого. На элементе, который не является нативным `<button>`, он сам добавляет `role="button"`, активацию по Enter и Space и `aria-disabled`.

---

### Двухцветные иконки

Часть SVG-иконок (например, `folder-dot_16`, `envelope-dot_24`) содержит дополнительный акцентный элемент, цвет которого можно задать отдельно от основного цвета иконки. Акцентный цвет управляется CSS-переменной `--icon-accent-color` и по умолчанию равен `currentColor`.

```css
.my-scope {
    --icon-accent-color: var(--kbq-foreground-error);
}
```

Переменная применяется только к SVG-иконкам — шрифтовые иконки всегда одноцветные.

Полный список двухцветных иконок доступен на странице [Иконки](/ru/icons) с включённым фильтром «Только двухцветные».
