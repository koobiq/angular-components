Component for automatically hiding elements with dynamic adaptation to the container width.

### Simple Hiding

Supports two modes of operation:

-   hiding from the end (default)
-   hiding from the start

Configurable via the `reverseOverflowOrder` attribute.

<!-- example(overflow-items-overview) -->

### Hiding in the Middle

Similar to simple hiding, but the order of hidden elements is determined by the `order` attribute inside `KbqOverflowItem`.  
If all elements are hidden, the remaining ones are checked.

<!-- example(overflow-items-overflow-order) -->
