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
