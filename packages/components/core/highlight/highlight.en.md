Highlighting matches helps users quickly understand why a result is relevant and speeds up navigation through lists. Depending on the context, one of two styles is used.

Koobiq provides two pipes for highlighting text matches — `kbqHighlightBackground` and `mcHighlight`. Both take a string and a search argument, wrapping the found matches in a `<mark>` tag — `kbq-highlight-background` for the background-color style and `kbq-highlight` for the bold style.

#### Background color

Used in selects and other dropdown pickers with filtering, and to highlight matches in complex content: descriptions, messages, and articles. The solid background remains legible in hover and active states within overlays and makes matches noticeable even in long texts.

<!-- example(highlight-select) -->

Matches in text:

<!-- example(highlight-background) -->

Matches in search results with a complex layout:

<!-- example(highlight-background-complex) -->

Matches in a table:

<!-- example(highlight-background-table) -->

#### Bold

This style is unobtrusive and ideal for quickly scanning familiar data: the user immediately sees that the searched word is in the row but is not distracted from the main choice.

```html
<span [innerHTML]="item | mcHighlight: searchQuery"></span>
```
