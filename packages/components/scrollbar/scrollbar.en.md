`KbqScrollbar` is a customizable scrollbar. It can remain visible, appear on hover or while scrolling, or stay hidden. The component supports mouse wheel, touch gestures, and keyboard controls and provides methods for programmatic scrolling.

## Display mode

The `kbqScrollbarMode` input sets the display mode:

| Mode     | Description                                                           |
| -------- | --------------------------------------------------------------------- |
| `hover`  | Appears on pointer hover or while scrolling. This is the default mode |
| `always` | Remains visible while the content overflows                           |
| `native` | Displays the browser's native scrollbar                               |
| `hidden` | Remains hidden while the content can still be scrolled                |

`kbqScrollbarOptionsProvider` sets the default mode for the entire application or a specific injector.

<!-- example(scrollbar-overview) -->

## Virtual scrolling

Apply the `kbqScrollbarViewport` directive to `cdk-virtual-scroll-viewport` to add a customizable scrollbar. The directive supports the same display modes.

<!-- example(scrollbar-virtual-scroll) -->

## Programmatic scrolling

Access the component instance through the `kbqScrollbar` export and call one of its public methods:

| Method                             | Description                                                                            |
| ---------------------------------- | -------------------------------------------------------------------------------------- |
| `scrollTo`                         | Scrolls to the specified coordinates                                                   |
| `scrollToTop` and `scrollToBottom` | Scroll to the top or bottom edge                                                       |
| `scrollStart` and `scrollEnd`      | Scroll to the logical start or end horizontally, respecting RTL                        |
| `scrollToElement`                  | Scrolls to an element specified directly or by a CSS selector. Supports custom offsets |
| `scrollIntoView`                   | Centers an element within the viewport                                                 |

The `behavior` parameter accepts `auto`, `instant`, and `smooth`.

<!-- example(scrollbar-scroll-to) -->

## Scroll indicator

Call `flashScrollIndicators` to briefly reveal the scrollbar and indicate that scrolling is available:

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

## Browser scrollbar

The `kbqNativeScrollbar` directive customizes an element's scrollbar without replacing the browser's scrolling mechanism. Add `kbqNativeScrollbarDescendants` to apply the same customization to the scrollbars of descendant elements.

<!-- example(native-scrollbar) -->

## Scroll events

Subscribe to `scrollChanges` to track `scroll` events:

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
                    // Handle the scroll event.
                });
        });
    }
}
```
