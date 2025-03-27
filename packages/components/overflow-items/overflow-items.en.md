Component for automatically hiding elements with dynamic adaptation to the container width.

### Простое скрытие

Supports two modes of operation:

-   hiding from the end (default)
-   hiding from the start

Configurable via the `reverseOverflowOrder` attribute.

<!-- example(overflow-items-overview) -->

### Hiding in the Middle

Similar to simple hiding, but the starting point for hiding elements is set using the `overflowStartIndex` attribute.  
If all elements are hidden, the remaining ones are checked.

<!-- example(overflow-items-result-offset) -->
