`KbqScrollbar` adds a customizable scrollbar to a scrollable content area. Scrolling uses the browser's native mechanism, preserving mouse wheel, touch gesture, and keyboard controls.

## Display mode

The `kbqScrollbarMode` input controls how the scrollbar is displayed:

- `hover` — shows the scrollbar on pointer hover or keyboard focus. This is the default mode.
- `always` — always shows the scrollbar when the content overflows its container.
- `native` — shows the browser's native scrollbar.
- `hidden` — hides the scrollbar while keeping the content scrollable.

Use `kbqScrollbarOptionsProvider` to change the default mode for the application or a specific dependency injection scope.

<!-- example(scrollbar-overview) -->

## Virtual scroll

Apply the `kbqScrollbarViewport` directive to `cdk-virtual-scroll-viewport` to add a custom scrollbar. The directive supports the same display modes.

<!-- example(scrollbar-virtual-scroll) -->

## Programmatic scrolling

Access the component through its `kbqScrollbar` export and use its public methods:

- `scrollTo` — scrolls to specified coordinates;
- `scrollToTop` and `scrollToBottom` — scroll to the start or end of the vertical axis;
- `scrollStart` and `scrollEnd` — scroll to the logical start or end of the horizontal axis, respecting RTL;
- `scrollToElement` — scrolls to an element or CSS selector with optional offsets;
- `scrollIntoView` — centers an element within the viewport.

Methods that accept a `behavior` parameter support the native `auto` and `smooth` scrolling behaviors. Scroll events are available through `scrollChanges`.

<!-- example(scrollbar-scroll-to) -->

## Browser scrollbar

Use `kbqNativeScrollbar` to customize only the native scrollbar. Add `kbqNativeScrollbarDescendants` to apply the customization to descendant elements.

<!-- example(native-scrollbar) -->
