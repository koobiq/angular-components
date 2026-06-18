The `kbq-title` directive shows a [tooltip](/en/components/tooltip) with the full text when the element's content does not fit and is truncated with an ellipsis. The tooltip appears only on actual overflow — on hover or keyboard focus — and stays out of the way when the text is fully visible.

<!-- example(title-overview) -->

### Key features

- The tooltip appears only when the text overflows — horizontally or vertically (when clamped to a number of lines). If the text fits, no tooltip is shown.
- Works both with plain text and with complex nested markup via the `#kbqTitleContainer` (measured container) and `#kbqTitleText` (text element) template references.
- Supports multiple `#kbqTitleText` elements: the tooltip is shown if any of them overflows.
- Lets you provide custom tooltip content — a string or a template — through the `[kbq-title]` attribute.
- Automatically tracks content and window-size changes and recalculates overflow.
- Accessibility: the tooltip opens on keyboard focus and hides when focus is lost.

### Container and text

To detect overflow correctly in nested markup, mark the measured container with `#kbqTitleContainer` and the text element with `#kbqTitleText`. The directive compares the container and text sizes and shows the tooltip when the text does not fit.

```html
<div kbq-title>
    <div #kbqTitleContainer>
        <div #kbqTitleText>{{ value }}</div>
    </div>
</div>
```

### Multiple text elements

When the container holds several text elements (for example, a name and a value in a [filter-bar](/en/components/filter-bar) pipe), mark each of them with `#kbqTitleText`. The tooltip appears if at least one element overflows.

<!-- example(title-multiple-text) -->

### Multiline text

The directive accounts for vertical overflow as well as horizontal. This is useful when the text is clamped to several lines (`-webkit-line-clamp`).

<!-- example(title-vertical-overflow) -->

### Custom tooltip content

By default the truncated text of the element is used as the tooltip content. To provide custom content, pass a string or a template reference (`TemplateRef`) to the `[kbq-title]` attribute. This is handy when you need formatted text or extra information.

<!-- example(title-custom-content) -->

### Two-line list options

In two-line [list](/en/components/list) options a single `kbq-title` directive can cover the whole option. Mark both lines (name and description) with `#kbqTitleText` and the shared container with `#kbqTitleContainer`. The tooltip appears when at least one of the lines overflows and shows the full text of the option.

<!-- example(title-list-option) -->

### Recommendations

- Use `kbq-title` for text that can be truncated: headings, table cells, values in filters and lists.
- If the tooltip must always be shown (not only on overflow) or contain interactive elements, use [Tooltip](/en/components/tooltip) or [Popover](/en/components/popover).
- Keep the tooltip content short and clear.
