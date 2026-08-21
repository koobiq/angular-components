`KbqScrollbar` добавляет настраиваемый скроллбар к области с прокручиваемым содержимым. Прокрутка выполняется нативным механизмом браузера, поэтому сохраняется управление колёсиком мыши, жестами и клавиатурой.

## Режим отображения

Режим задаётся входным параметром `kbqScrollbarMode`:

| Режим    | Описание                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------ |
| `hover`  | Скроллбар появляется при наведении указателя или клавиатурном фокусе. Используется по умолчанию. |
| `always` | Скроллбар отображается постоянно, если содержимое выходит за границы области.                    |
| `native` | Отображается системный скроллбар браузера.                                                       |
| `hidden` | Скроллбар скрыт, но содержимое можно прокручивать.                                               |

Режим по умолчанию для приложения или отдельной области DI можно изменить с помощью `kbqScrollbarOptionsProvider`.

<!-- example(scrollbar-overview) -->

## Виртуальный скролл

Чтобы добавить кастомный скроллбар к `cdk-virtual-scroll-viewport`, примените к нему директиву `kbqScrollbarViewport`. Директива поддерживает те же режимы отображения.

<!-- example(scrollbar-virtual-scroll) -->

## Программное управление прокруткой

Получите компонент через экспорт `kbqScrollbar` и используйте его публичные методы:

| Метод                            | Описание                                                                     |
| -------------------------------- | ---------------------------------------------------------------------------- |
| `scrollTo`                       | Прокручивает до заданных координат.                                          |
| `scrollToTop` и `scrollToBottom` | Прокручивают к началу или концу вертикальной оси.                            |
| `scrollStart` и `scrollEnd`      | Прокручивают к логическому началу или концу горизонтальной оси с учётом RTL. |
| `scrollToElement`                | Прокручивает до элемента или CSS-селектора с необязательными отступами.      |
| `scrollIntoView`                 | Располагает элемент в центре области просмотра.                              |

В методах с параметром `behavior` можно выбрать нативное поведение прокрутки `auto` или `smooth`.

<!-- example(scrollbar-scroll-to) -->

## Браузерный скроллбар

Используйте `kbqNativeScrollbar` для кастомизации нативного скроллбара элемента без замены браузерного механизма прокрутки. Добавьте `kbqNativeScrollbarDescendants`, чтобы применить ту же кастомизацию к нативным скроллбарам всех его дочерних элементов на любом уровне вложенности.

<!-- example(native-scrollbar) -->

## События прокрутки

Подпишитесь на `scrollChanges`, чтобы отслеживать нативные события прокрутки области:

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
