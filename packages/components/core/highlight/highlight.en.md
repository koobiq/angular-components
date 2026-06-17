mcHighlight is a pipe for highlighting text matches. Highlighting matches helps users quickly understand why a result is relevant and speeds up navigation through lists. Depending on the context, two styles are used.

The pipe takes a string and a search argument, wrapping the found matches in a <mark class="kbq-highlight"> tag.

#### Bold

Used in selects with search and homogeneous lists (for example, choosing a department or a name). This style is unobtrusive and ideal for quickly scanning familiar data: the user immediately sees that the searched word is in the row but is not distracted from the main choice.

<!-- example(highlight-select) -->

#### Background color

Used in search results over complex content — descriptions, messages, articles. Highlighting also draws attention even inside long texts.

<!-- example(highlight-background) -->

Matches in search results with a complex layout

<!-- example(highlight-background-complex) -->

Matches in a table:

<!-- example(highlight-background-table) -->
