`<kbq-code-block>` is a component that displays reformatted text content with syntax highlighting.

<div class="kbq-callout kbq-callout_theme">
<div class="kbq-callout__header">Note</div>
<div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">

For the component to work, the [`highlight.js@^11`](https://github.com/highlightjs/highlight.js/tree/11.10.0) dependency is required:

```bash
npm install highlight.js@^11
```

</div>
</div>

### Line numbers

Numbering lines is useful for referencing a specific location in the document. Line numbers are disabled by default and can be enabled using the `lineNumbers` attribute.

<!-- example(code-block-with-line-numbers) -->

### Changing the block height

The block can expand to fill the available screen area if reviewing the code is one of the main tasks in the interface. When screen space is limited or the code only supplements the main content, a developer can use a block with a fixed height, configured using the `maxHeight` attribute.

For compactness, it can be useful to show a portion of the document with the option to expand everything, using the `viewAll` attribute. The block will increase in height and all the code will be visible, avoiding double scrolling. In the collapsed state, there is no scrolling and the line wrap toggle is unavailable. If you change the wrap mode and then collapse and expand the code, the setting is preserved.

<!-- example(code-block-with-max-height) -->

### Soft line wrap

By default, lines do not wrap. The wrap mode can be configured in advance using the `softWrap` attribute, and the user can also be given the ability to control this with a toggle button in the action panel, enabled using the `canToggleSoftWrap` attribute.

The icon in the button represents the future state after activation; the icon changes after the wrap mode is toggled.

<!-- example(code-block-with-soft-wrap) -->

### Displaying multiple documents

Multiple documents are placed in the block within tabs. The tab title is formed from the `filename` field. If needed, tabs can be hidden using the `hideTabs` attribute, and the active tab can be set using the `activeFileIndex` attribute.

Tabs are hidden automatically for a single document with an empty `filename`.

<!-- example(code-block-with-tabs) -->

The tab header block is displayed without a shadow by default. If content extends beyond the area, a shadow appears under the tab header block when the code block content is scrolled.

<!-- example(code-block-with-tabs-and-shadow) -->

### Visual styling

Two visual styles are available for the block: with a border or with a background contrasting to the page background. The contrasting background prevents the block from getting lost on a screen with varied content, and is configured using the `filled` attribute.

<!-- example(code-block-with-filled) -->

### Without borders

When the code block should fill an entire container or screen, it is best to use a style without a border and background, configured using the `noBorder` attribute.

<!-- example(code-block-with-no-border) -->

### Action panel

The action panel is located in the upper right corner of the block, visible on hover or when one of the buttons is focused, and stays fixed during scrolling. The component configuration determines which actions are available.

#### Changing wrap mode

The user can toggle the wrap mode using a toggle button; this option is disabled by default and can be configured using the `canToggleSoftWrap` attribute.

```html
<kbq-code-block [files]="files" canToggleSoftWrap />
```

#### Downloading the document

The user can save/download the document to a file; this option is disabled by default and can be configured using the `canDownload` attribute.

The file name and extension are taken from the `filename` field. The default file name is _code_, and the default extension is _txt_.

```html
<kbq-code-block [files]="files" canDownload />
```

#### Copying the document text

The user can copy the document text; this option is enabled by default and can be configured using the `canCopy` attribute.

```html
<kbq-code-block [files]="files" canCopy="false" />
```

#### Opening the document in an external system

The address is taken from the `link` field. The link opens in a new tab.

<!-- example(code-block-with-link) -->
