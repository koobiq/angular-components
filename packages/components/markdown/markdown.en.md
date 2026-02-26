`KbqMarkdown` - component that allows converting text written in _Markdown_ markup language into _HTML_.

<div class="kbq-callout kbq-callout_theme">
<div class="kbq-callout__header">Note</div>
<div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">

For the component to work, the [`marked`](https://github.com/markedjs/marked) dependency is required:

```bash
npm install marked
```

</div>
</div>

### Headers

<!-- example(markdown-headers) -->

### Paragraph

<!-- example(markdown-paragraph) -->

### Text emphasis

<!-- example(markdown-selection) -->

### Blockquote

<!-- example(markdown-quote) -->

### Lists

<!-- example(markdown-list) -->

### Inline code

<!-- example(markdown-code) -->

### Code block

<!-- example(markdown-code-block) -->

### Horizontal rule

<!-- example(markdown-divider) -->

### Link

<!-- example(markdown-link) -->

### Image

<!-- example(markdown-image) -->

### Table

<!-- example(markdown-table) -->

### Line break

To create a line break in a component template, you need to add two spaces `&#32;&#32;` at the end of the line.

<!-- example(markdown-line-break) -->

When using the `markdownText` attribute, you need to add `\n` at the end of the line and also enable the configuration option `{ breaks: true }`.

<!-- example(markdown-line-break-with-markdown-text-input) -->
