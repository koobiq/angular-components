`KbqScrollbar` — настраиваемый скроллбар. Его можно показывать постоянно, при наведении или прокрутке либо скрыть. Компонент поддерживает управление колесом мыши, жестами и клавиатурой, а также предоставляет методы программной прокрутки.

## Режим отображения

Входной параметр `kbqScrollbarMode` задает режим отображения:

| Режим    | Описание                                                                                           |
| -------- | -------------------------------------------------------------------------------------------------- |
| `hover`  | Скроллбар появляется при наведении курсора или во время прокрутки. Режим используется по умолчанию |
| `always` | Скроллбар отображается, пока содержимое не помещается                                              |
| `native` | Браузер отображает собственный скроллбар                                                           |
| `hidden` | Скроллбар не отображается, но содержимое можно прокручивать                                        |

`kbqScrollbarOptionsProvider` задает режим по умолчанию для всего приложения или отдельного инжектора.

<!-- example(scrollbar-overview) -->

## Виртуальная прокрутка

Примените директиву `kbqScrollbarViewport` к `cdk-virtual-scroll-viewport`, чтобы добавить настраиваемый скроллбар. Директива поддерживает те же режимы отображения.

<!-- example(scrollbar-virtual-scroll) -->

## Программное управление прокруткой

Получите экземпляр компонента по имени экспорта `kbqScrollbar` и вызовите один из публичных методов:

| Метод                            | Описание                                                                                              |
| -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `scrollTo`                       | Прокручивает до заданных координат                                                                    |
| `scrollToTop` и `scrollToBottom` | Прокручивают до верхней или нижней границы                                                            |
| `scrollStart` и `scrollEnd`      | Прокручивают к логическому началу или концу по горизонтали с учетом RTL                               |
| `scrollToElement`                | Прокручивает до элемента, указанного напрямую или CSS-селектором. Поддерживает дополнительные отступы |
| `scrollIntoView`                 | Располагает элемент в центре области просмотра                                                        |

Параметр `behavior` принимает значения `auto`, `instant` и `smooth`.

<!-- example(scrollbar-scroll-to) -->

## Индикатор прокрутки

Вызовите метод `flashScrollIndicators`, чтобы ненадолго показать скроллбар — это подскажет, что доступна прокрутка:

```ts
import { afterNextRender, ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { KbqScrollbar } from '@koobiq/components/scrollbar';

@Component({
    imports: [KbqScrollbar],
    template: `
        <kbq-scrollbar>...</kbq-scrollbar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlashScrollIndicatorsExample {
    private readonly scrollbar = viewChild.required(KbqScrollbar);

    constructor() {
        afterNextRender(() => {
            this.scrollbar().flashScrollIndicators();
        });
    }
}
```

## Скроллбар браузера

Директива `kbqNativeScrollbar` настраивает внешний вид скроллбара элемента, не заменяя браузерный механизм прокрутки. Добавьте `kbqNativeScrollbarDescendants`, чтобы применить те же настройки к скроллбарам вложенных элементов.

<!-- example(native-scrollbar) -->

## События прокрутки

Подпишитесь на `scrollChanges`, чтобы отслеживать события `scroll`:

```ts
import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqScrollbar } from '@koobiq/components/scrollbar';

@Component({
    imports: [KbqScrollbar],
    template: `
        <kbq-scrollbar>...</kbq-scrollbar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScrollEventsExample {
    private readonly scrollbar = viewChild.required(KbqScrollbar);
    private readonly destroyRef = inject(DestroyRef);

    constructor() {
        afterNextRender(() => {
            this.scrollbar()
                .scrollChanges.pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(() => {
                    // Обработайте событие прокрутки.
                });
        });
    }
}
```
