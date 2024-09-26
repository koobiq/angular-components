`<kbq-scrollbar>` - это компонент (обертка над библиотекой [`overlayscrollbars`](https://github.com/KingSora/OverlayScrollbars)),
который используется для настройки параметров скроллбара.

**Обрати внимание!** Для работы компонента, необходимо наличие `overlayscrollbars@2.7.3` зависимости, установи её при отсутствии:

```
npm install overlayscrollbars@2.7.3
```

## Настройка и передача параметров:

-   для определенного скроллбара, при помощи атрибута `options`:

<!-- example(scrollbar-with-options) -->

-   для всех скроллбаров в модуле, при помощи _Dependency Injection_ c использованием `KBQ_SCROLLBAR_CONFIG` токена:

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
