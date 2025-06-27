Component for automatically hiding elements with dynamic adaptation to the container width.

Supports two modes of operation:

- hiding from the end (default)
- hiding from the start

Configurable via the `reverseOverflowOrder` attribute.

<!-- example(overflow-items-overview) -->

### Order of hiding

The order in which elements are hidden is determined using the `order` attribute for the `KbqOverflowItem` directive.

<!-- example(overflow-items-with-order) -->

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
