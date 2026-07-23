Koobiq provides two pipes for highlighting text matches — `mcHighlight` and `kbqHighlightBackground`. Highlighting matches helps users quickly understand why a result is relevant and speeds up navigation through lists. Depending on the context, one of two styles is used.

Both pipes take a string and a search argument, wrapping the found matches in a `<mark>` tag — `kbq-highlight` for the bold style, `kbq-highlight-background` for the background-color style.

#### Bold

Used in homogeneous lists rendered inline on the page, without a dropdown or overlay (for example, filtering a tree list). This style is unobtrusive and ideal for quickly scanning familiar data: the user immediately sees that the searched word is in the row but is not distracted from the main choice.

#### Background color

Used in selects and other dropdown pickers with search (for example, choosing a department or a name), and in search results over complex content — descriptions, messages, articles. The solid background stays legible over hover and active row states inside overlay panels, and also draws attention even inside long texts.

<!-- example(highlight-select) -->

<!-- example(highlight-background) -->

Matches in search results with a complex layout

<!-- example(highlight-background-complex) -->

Matches in a table:

<!-- example(highlight-background-table) -->
