Component for automatically hiding elements with dynamic adaptation to the container width.

Supports two modes of operation:

- Hiding from the end (default).
- Hiding from the start.

Configurable via the `reverseOverflowOrder` attribute.

<!-- example(overflow-items-overview) -->

### Order of hiding

The order in which elements are hidden is determined using the `order` attribute for the `KbqOverflowItem` directive.

<!-- example(overflow-items-with-order) -->

### Always visible elements

If you need some elements to always remain visible, you can use the `alwaysVisible` attribute for the `KbqOverflowItem` directive.

<!-- example(overflow-items-with-always-visible-item) -->

### Element alignment

Element alignment within the container is set using the CSS property [`justify-content`](https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content).

<!-- example(overflow-items-justify-content) -->

### Orientation

By default, elements are hidden horizontally. If you need to hide elements vertically, you can use the `orientation="vertical"` attribute.

<!-- example(overflow-items-with-vertical-orientation) -->

### Delay when hiding/showing

The delay for hiding/showing elements is set using the `debounceTime` attribute. Enabling this option positively
affects performance when there are many elements or when the container size changes frequently.

```html
<div kbqOverflowItems [debounceTime]="300">...</div>
```

### Additional target for ResizeObserver

Sometimes the container size can change not only when the browser window is resized, but also when other elements on the page change size (for example: [Sidebar](en/components/sidebar)). To track such changes, you can use the `additionalResizeObserverTargets` attribute.
The attribute accepts either a single element or an array of elements whose size changes will trigger recalculation of hidden elements. By default, `document.body` is tracked.

```html
<div kbqOverflowItems [additionalResizeObserverTargets]="sidebarContainerElement">...</div>
```
