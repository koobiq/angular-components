`KbqScrollbar` adds a customizable scrollbar to a scrollable content area. Scrolling uses the browser's native mechanism, preserving mouse wheel, touch gesture, and keyboard controls.

## Display mode

The `kbqScrollbarMode` input controls how the scrollbar is displayed:

| Mode     | Description                                                               |
| -------- | ------------------------------------------------------------------------- |
| `hover`  | Shows the scrollbar on pointer hover or scroll. This is the default mode. |
| `always` | Always shows the scrollbar when the content overflows its container.      |
| `native` | Shows the browser's native scrollbar.                                     |
| `hidden` | Hides the scrollbar while keeping the content scrollable.                 |

Use `kbqScrollbarOptionsProvider` to change the default mode for the application or a specific dependency injection scope.

<!-- example(scrollbar-overview) -->

## Virtual scroll

Apply the `kbqScrollbarViewport` directive to `cdk-virtual-scroll-viewport` to add a custom scrollbar. The directive supports the same display modes.

<!-- example(scrollbar-virtual-scroll) -->

## Programmatic scrolling

Access the component through its `kbqScrollbar` export and use its public methods:

| Method                             | Description                                                                |
| ---------------------------------- | -------------------------------------------------------------------------- |
| `scrollTo`                         | Scrolls to specified coordinates.                                          |
| `scrollToTop` and `scrollToBottom` | Scroll to the start or end of the vertical axis.                           |
| `scrollStart` and `scrollEnd`      | Scroll to the logical start or end of the horizontal axis, respecting RTL. |
| `scrollToElement`                  | Scrolls to an element or CSS selector with optional offsets.               |
| `scrollIntoView`                   | Centers an element within the viewport.                                    |

Methods that accept a `behavior` parameter support the native `auto` and `smooth` scrolling behaviors.

<!-- example(scrollbar-scroll-to) -->

## Scroll indicators

Call `flashScrollIndicators` to briefly reveal the scrollbar and hint that the content is scrollable:

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

Use `kbqNativeScrollbar` to customize an element's browser-rendered scrollbar without replacing native scrolling. Add `kbqNativeScrollbarDescendants` to apply the same customization to the native scrollbars of all its descendant elements.

<!-- example(native-scrollbar) -->

## Scroll events

Subscribe to `scrollChanges` to track the viewport's native scroll events:

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
