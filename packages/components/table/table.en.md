A table is similar to a grid but simpler in structure. Users cannot sort columns or change their widths. Only standard HTML table capabilities are available.

<!-- example(table-overview) -->

By default, text in cells wraps to a new line:

<!-- example(table-full-width) -->

### Borders

Use `border` to draw a line under every row.

In most cases, borders should be avoided, but sometimes they help support the layout when a table has gaps due to cell content varying between long and short text.

Borders are also useful in tables with complex structures — for example, when rows are grouped or some cells are merged vertically.

<!-- example(table-with-borders) -->

### Disable hover

Use `disableHover` to remove the background color change on row hover. This is useful when rows are not interactive and the hover highlight would be misleading.

<!-- example(table-disable-hover) -->

### Sticky header

If a table has a lot of rows, use `stickyHeader` to keep the column names visible while you scroll down. This way you always see what each column means, even after scrolling.

<!-- example(table-sticky-header) -->

The pinned header is opaque, so anything the browser scrolls to the top edge of the container ends up underneath it. The table keeps its own cells and the focusable content inside them clear of the header on its own; if your scroll container holds content of your own as well, set `scroll-padding-block-start` on it to the header height.

The header is painted with `--kbq-background-card`, which matches a modal, a sidepanel or a card. For a table placed directly on the page background, override `--kbq-table-sticky-header-background: var(--kbq-background-bg)`.
