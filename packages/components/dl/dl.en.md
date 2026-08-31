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

Long strings without spaces, such as identifiers or file paths, are broken between characters and no longer stretch the columns.

<!-- example(dl-long-text) -->
