Description list displays term-description pairs in adaptive, horizontal, or vertical layouts.

### Default (adaptive)

<!-- example(dl-overview) -->

### Small (adaptive)

<!-- example(dl-small) -->

### Horizontal

<!-- example(dl-horizontal-overview) -->

### Vertical

<!-- example(dl-vertical-overview) -->

### Resizable

The `resizable` flag allows changing column widths by dragging the separator.

Minimum column widths are set with `dtMinWidth` and `ddMinWidth`. Two-way binding with `[(dtWidth)]` is used to set and preserve the width programmatically and synchronize it across lists.

<!-- example(dl-resizable) -->

### Long text

Text with spaces wraps at word boundaries, while strings without spaces wrap between characters. For example, identifiers, hashes, paths, and URLs wrap this way. The columns do not expand.

<!-- example(dl-long-text) -->
