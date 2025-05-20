`<kbq-scrollbar>` - это компонент который используется для настройки параметров скроллбара.

<div class="kbq-callout kbq-callout_theme">
<div class="kbq-callout__header">Обрати внимание</div>
<div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">

Для работы компонента, необходимо наличие [`overlayscrollbars@2.7.3`](https://github.com/KingSora/OverlayScrollbars/tree/v2.7.0) зависимости:

```bash
npm install overlayscrollbars@2.7.3
```

</div>
</div>

## Настройка и передача параметров:

- для определенного скроллбара, при помощи атрибута `options`:

<!-- example(scrollbar-with-options) -->

- для всех скроллбаров в модуле, при помощи _Dependency Injection_ c использованием `KBQ_SCROLLBAR_CONFIG` токена:

<!-- example(scrollbar-with-custom-config) -->

### Обработка событий:

```ts
<kbq-scrollbar
    (onInitialize)="onInitialize($event)"
    (onDestroy)="onDestroy($event)"
    (onScroll)="onScroll($event)"
    (onUpdate)="onUpdate($event)"
>
    ...
</kbq-scrollbar>
```
