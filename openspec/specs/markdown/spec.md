# markdown Specification

## Purpose

Describes what `kbq-markdown` from `@koobiq/components/markdown` guarantees to consumers: where it takes the Markdown source from, when it renders it again, which options reach the parser, and what HTML and `kbq-markdown__*` classes each Markdown construct produces.

## Requirements

### Requirement: Markdown is rendered as HTML

The component SHALL convert its Markdown source into HTML with the `marked` library and render that HTML inside the host, in a child element with the class `kbq-markdown__output`.

#### Scenario: Heading from the input

- **WHEN** a consumer renders `<kbq-markdown [markdownText]="'# Title'" />`
- **THEN** the `kbq-markdown__output` element contains an `h1` with the text "Title"

### Requirement: The input takes precedence over projected content

When `markdownText` holds a non-empty string, the component SHALL render it and MUST ignore any projected content.

#### Scenario: Both sources given

- **WHEN** `markdownText` is `'# from the input'` and the projected content is `# from the projection`
- **THEN** the rendered `h1` reads "from the input"

### Requirement: Changing the input re-renders the output

The component SHALL render again whenever the value bound to `markdownText` changes, replacing the previous output.

#### Scenario: New text

- **WHEN** `markdownText` changes from `'# One'` to `'# Two'`
- **THEN** the output holds a single `h1` that reads "Two"

#### Scenario: Text cleared without projected content

- **WHEN** `markdownText` is set to `null` and nothing is projected
- **THEN** the `kbq-markdown__output` element is empty

### Requirement: Projected content is the fallback source

When `markdownText` is `null` (its default) or an empty string, the component SHALL render the text of the content projected between its tags instead.

#### Scenario: Projected content only

- **WHEN** a consumer writes Markdown between `<kbq-markdown ngPreserveWhitespaces>` and `</kbq-markdown>` without binding `markdownText`
- **THEN** that Markdown is rendered

#### Scenario: Input cleared

- **WHEN** `markdownText` changes from `'# from the input'` to `null` and the projected content is `# from the projection`
- **THEN** the rendered `h1` reads "from the projection"

#### Scenario: Empty string

- **WHEN** `markdownText` is `''` and Markdown is projected
- **THEN** the projected Markdown is rendered

### Requirement: Projected content is read as plain text

The component SHALL take the projected content as its text content, exactly as the Angular template compiler leaves it: HTML entities arrive decoded, and an element in the projection contributes only its text. Unless the consumer keeps whitespace, as with `ngPreserveWhitespaces` on `kbq-markdown`, the compiler turns every run of two or more whitespace characters, decoded entities included, into one space: a lone newline survives, but not blank lines, indentation or trailing double spaces.

#### Scenario: Entity in the projection

- **WHEN** the projected content contains the line `&gt; blockquote`
- **THEN** a blockquote with the text "blockquote" is rendered

#### Scenario: Element in the projection

- **WHEN** the projected content contains `<b>bold</b>`
- **THEN** only the text "bold" reaches the parser, without the `b` element

### Requirement: Projected source is not displayed

The projected content SHALL stay in the DOM inside a child element with the class `kbq-markdown__input`, and that element MUST NOT be displayed; only the rendered output is visible.

#### Scenario: Projected Markdown

- **WHEN** Markdown is projected into the component
- **THEN** the raw Markdown text is not visible on the page
- **AND** the rendered HTML is

### Requirement: Changing projected content re-renders the output

The component SHALL watch the projected content and render again whenever its text changes, including content that appears only after the first render.

#### Scenario: Interpolated projection changes

- **WHEN** the projected content is `{{ projected() }}` and the signal changes from `'# first'` to `'# second'`
- **THEN** the rendered `h1` reads "second"

#### Scenario: Projection appears later

- **WHEN** the projected content is wrapped in an `@if` that is false at the first render and later becomes true
- **THEN** the Markdown inside it is rendered once it appears

### Requirement: Projected content renders in the browser only

The component SHALL read the projected content only after its first render in the browser. In server-rendered HTML the output MUST contain only what `markdownText` produces; projected Markdown is rendered once the application runs in the browser.

#### Scenario: Server rendering with projected Markdown

- **WHEN** a page with projected Markdown and no `markdownText` is rendered on the server
- **THEN** the `kbq-markdown__output` element of the server HTML is empty
- **AND** it is filled after the application starts in the browser

### Requirement: Parser options come from an injection token

The component SHALL pass the options provided through `KBQ_MARKDOWN_MARKED_OPTIONS` to `marked` on every render. `kbqMarkdownMarkedOptionsProvider(options)` SHALL return a provider for that token. The token is optional and is resolved from the component's injector, so a provider on an enclosing component or on the application applies.

#### Scenario: Line breaks enabled

- **WHEN** an enclosing component provides `kbqMarkdownMarkedOptionsProvider({ breaks: true })` and `markdownText` contains a single newline between two lines
- **THEN** the two lines are rendered separated by a `br`

### Requirement: Default parser options

Without `KBQ_MARKDOWN_MARKED_OPTIONS`, the component SHALL parse with the defaults of the global `marked` instance, which a call to `marked.use()` or `marked.setOptions()` anywhere in the application changes for every `kbq-markdown`. While those defaults are the ones `marked` ships, GitHub Flavored Markdown is on, and a single newline inside a paragraph MUST NOT produce a line break.

#### Scenario: Table without options

- **WHEN** no options are provided, the defaults of the global `marked` instance are unchanged and the source contains a pipe table
- **THEN** a `table` element is rendered

#### Scenario: Single newline without options

- **WHEN** no options are provided, the defaults of the global `marked` instance are unchanged and `markdownText` contains two lines separated by a single newline
- **THEN** both lines are rendered in one paragraph without a `br`

### Requirement: Generated elements carry prefixed classes

Each `a`, `blockquote`, `code`, `h1` to `h6`, `hr`, `img`, `li`, `ol`, `p`, `pre`, `table`, `tbody`, `td`, `th`, `thead`, `tr` and `ul` element in the generated HTML SHALL get the class `kbq-markdown__<tag>`, subject to the exceptions in the next requirements. The prefix SHALL be exported as `CLASS_PREFIX` with the value `'kbq-markdown'`. Elements not in the list, such as `strong` and `em`, get no class.

#### Scenario: Paragraph and link

- **WHEN** the source is `[title](https://koobiq.io)`
- **THEN** the output contains `<p class="kbq-markdown__p">` and an `a` element with the class `kbq-markdown__a`

#### Scenario: Emphasis

- **WHEN** the source is `**bold**`
- **THEN** the `strong` element has no class

### Requirement: Only whole tag names are aliased

The component SHALL give the class of a listed tag only to elements with exactly that tag name. An element whose name merely starts with a listed name MUST keep its own alias or get none.

#### Scenario: Abbreviation is not a link

- **WHEN** the source contains `<abbr title="HyperText Markup Language">HTML</abbr>`
- **THEN** the `abbr` element is rendered unchanged and the output contains no `kbq-markdown__a` class

#### Scenario: Table head and code block keep their own classes

- **WHEN** the source contains a table and a fenced code block
- **THEN** the `thead` element has the class `kbq-markdown__thead`, not `kbq-markdown__th`
- **AND** the `pre` element has the class `kbq-markdown__pre`, not `kbq-markdown__p`

### Requirement: Paragraphs and header cells are aliased only without attributes

A `p` or `th` element SHALL get its class only when its opening tag has no attributes; whitespace before the closing bracket is allowed. A `p` or `th` with attributes MUST be left without the class. As shipped, the header cells of aligned table columns therefore have no class.

#### Scenario: Whitespace in the opening tag

- **WHEN** the source contains the raw HTML `<p >spaced</p>`
- **THEN** the output is `<p class="kbq-markdown__p">spaced</p>`

#### Scenario: Aligned column

- **WHEN** a table column is aligned with `:---`, `:---:` or `---:`
- **THEN** its `th` element has an `align` attribute and no class
- **AND** the `td` elements of that column have both the `align` attribute and the class `kbq-markdown__td`

### Requirement: The alias class shadows an existing class attribute

For the other listed tags, the component SHALL insert its own `class` attribute in front of the element's attributes. When the element already has a `class` attribute, the browser keeps the first one, so the element MUST end up with only the `kbq-markdown__<tag>` class.

#### Scenario: Fenced code block with a language

- **WHEN** the source is a fenced code block whose opening fence names the language `bash`
- **THEN** its `code` element has only the class `kbq-markdown__code` and no `language-bash` class

### Requirement: HTML in the Markdown is not sanitized

The component SHALL insert the generated HTML without Angular's sanitization. Raw HTML written in the Markdown, its attributes included, MUST reach the DOM as `marked` passes it through, apart from the class aliasing: an element of a listed tag other than `p` and `th` gets the alias class in front of its attributes, which shadows its own `class` attribute.

#### Scenario: Inline HTML element

- **WHEN** the source contains `<abbr title="HyperText Markup Language">HTML</abbr>`
- **THEN** an `abbr` element with that `title` is rendered

#### Scenario: Event handler attribute

- **WHEN** the source contains `<img src="x" onerror="handler()">`
- **THEN** the rendered `img` keeps its `onerror` attribute

### Requirement: Host element

The host element SHALL carry the class `kbq-markdown` and MUST NOT get a role or an ARIA attribute from the component; the semantics of the content come from the generated elements.

#### Scenario: Rendered host

- **WHEN** the component is rendered
- **THEN** the host has the class `kbq-markdown` and no `role` or `aria-*` attribute

### Requirement: Native scrollbars are styled

The component SHALL apply the library's native scrollbar styling to its host and to every element inside it, marking the host with the classes `kbq-native-scrollbar` and `kbq-native-scrollbar_descendants`.

#### Scenario: Host classes

- **WHEN** the component is rendered
- **THEN** its host has the classes `kbq-native-scrollbar` and `kbq-native-scrollbar_descendants`

### Requirement: Headings

A line starting with one to six `#` characters SHALL render as a heading element of that level, `h1` to `h6`, with the class `kbq-markdown__h1` to `kbq-markdown__h6`.

#### Scenario: All levels

- **WHEN** the source has one line for each of `#` to `######`
- **THEN** the output holds `h1` to `h6` elements in that order, each with its `kbq-markdown__h<level>` class

### Requirement: Paragraphs

Text separated by blank lines SHALL render as separate `p` elements with the class `kbq-markdown__p`.

#### Scenario: Two blocks of text

- **WHEN** the source has two blocks of text separated by a blank line
- **THEN** the output holds two `p` elements with the class `kbq-markdown__p`

### Requirement: Text emphasis

Text wrapped in `**` or `__` SHALL render as `strong`, text wrapped in `*` or `_` as `em`, and text wrapped in `***` or `___` as `strong` inside `em`.

#### Scenario: Bold and italic

- **WHEN** the source is `***bold and italic text***`
- **THEN** the output holds an `em` element that contains a `strong` element with the text

### Requirement: Blockquote

Lines starting with `>` SHALL render as a `blockquote` element with the class `kbq-markdown__blockquote`, with the quoted text in a `p` element with the class `kbq-markdown__p`.

#### Scenario: One-line quote

- **WHEN** the source is `> blockquote`
- **THEN** the output holds a `blockquote` with the class `kbq-markdown__blockquote` that contains a `p` with the text "blockquote"

### Requirement: Lists

Lines starting with a number and a dot SHALL render as an `ol` element with the class `kbq-markdown__ol`, and lines starting with a bullet such as `-` as a `ul` element with the class `kbq-markdown__ul`. Each item SHALL be an `li` element with the class `kbq-markdown__li`.

#### Scenario: Ordered list

- **WHEN** the source has the lines `1. First item`, `2. Second item` and `3. Third item`
- **THEN** the output holds an `ol` with the class `kbq-markdown__ol` and three `li` elements with the class `kbq-markdown__li`

#### Scenario: Unordered list

- **WHEN** the source has three lines starting with `-`
- **THEN** the output holds a `ul` with the class `kbq-markdown__ul` and three `li` elements with the class `kbq-markdown__li`

### Requirement: Inline code

Text wrapped in backticks SHALL render as a `code` element with the class `kbq-markdown__code` inside the surrounding paragraph.

#### Scenario: Code in a paragraph

- **WHEN** the source is `` `inline code` ``
- **THEN** the output holds a `p` that contains a `code` element with the class `kbq-markdown__code` and the text "inline code"

### Requirement: Code block

A fenced code block SHALL render as a `pre` element with the class `kbq-markdown__pre` that contains a `code` element with the class `kbq-markdown__code`. The text of the block MUST be shown literally, with `<` and `>` displayed rather than parsed as markup.

#### Scenario: Fenced block

- **WHEN** the source is a fenced block with the line `npm install jquery`
- **THEN** the output holds `pre.kbq-markdown__pre` containing `code.kbq-markdown__code` with that line

#### Scenario: Markup inside a block

- **WHEN** a fenced block contains `<!DOCTYPE html>`
- **THEN** the text `<!DOCTYPE html>` is displayed in the block and no element is created from it

### Requirement: Horizontal rule

A line of `---` between blocks SHALL render as an `hr` element with the class `kbq-markdown__hr`.

#### Scenario: Divider

- **WHEN** the source has a line `---` between two paragraphs
- **THEN** the output holds an `hr` with the class `kbq-markdown__hr` between them

### Requirement: Links

`[text](url)` SHALL render as an `a` element with the class `kbq-markdown__a` and an `href` equal to the URL, keeping a title given in the Markdown. The component MUST NOT add a `target` or route the link through the Angular router. Inline code inside the link text keeps its `kbq-markdown__code` class.

#### Scenario: Plain link

- **WHEN** the source is `[title](https://www.koobiq.io)`
- **THEN** the output holds `<a class="kbq-markdown__a" href="https://www.koobiq.io">title</a>` inside a paragraph

#### Scenario: Code in a link

- **WHEN** the source is ``A [`brute-force` attack](#)``
- **THEN** the link contains a `code` element with the class `kbq-markdown__code` followed by the text " attack"

### Requirement: Link focus ring follows keyboard focus

A rendered link SHALL show a solid focus outline when it receives focus in keyboard modality, and MUST NOT show it when it is focused by a pointer click.

#### Scenario: Keyboard focus

- **WHEN** the user has pressed a key and a link then receives focus
- **THEN** the link's `outline-style` is `solid`

#### Scenario: Click focus

- **WHEN** the user clicks a link
- **THEN** the link has focus and its `outline-style` is `none`

### Requirement: Images

`![alt](src)` SHALL render as an `img` element with the class `kbq-markdown__img`, the given `src`, and an `alt` attribute equal to the alt text, which is empty when the Markdown gives none.

#### Scenario: Image without alt text

- **WHEN** the source is `![](https://www.koobiq.io)`
- **THEN** the output holds an `img` with the class `kbq-markdown__img`, that `src` and `alt=""`

### Requirement: Image caption

An emphasized line directly under an image SHALL render in the same paragraph, as an `em` element that immediately follows the `img`, and SHALL be displayed as a caption on a line of its own under the image.

#### Scenario: Caption line

- **WHEN** the source is `![With caption text](https://www.koobiq.io)` followed on the next line by `_Image caption text_`
- **THEN** the paragraph holds the `img` followed by an `em` with the text "Image caption text"
- **AND** the caption is displayed under the image rather than beside it

### Requirement: Tables

A pipe table SHALL render as a `table` element with the class `kbq-markdown__table`, holding a `thead` and a `tbody` with the classes `kbq-markdown__thead` and `kbq-markdown__tbody`, rows with the class `kbq-markdown__tr`, body cells with the class `kbq-markdown__td`, and header cells with the class `kbq-markdown__th` unless their column is aligned. Column alignment from the separator row SHALL be set as an `align` attribute on the cells of that column.

#### Scenario: Table with a header row and two body rows

- **WHEN** the source is a pipe table with a header row and two body rows
- **THEN** the output holds `table.kbq-markdown__table` with one header row in `thead.kbq-markdown__thead` and two rows in `tbody.kbq-markdown__tbody`

#### Scenario: Right-aligned column

- **WHEN** the separator row marks a column with `---:`
- **THEN** every cell of that column has `align="right"`
- **AND** the header cell of that column has no class

### Requirement: Line break with two trailing spaces

Two spaces at the end of a line that another line of the same paragraph follows SHALL render as a `br` element, with or without parser options; at the end of the last line of a paragraph they MUST NOT produce a `br`. In a template, the spaces can be written as `&#32;&#32;`; in projected content they survive only where the template keeps whitespace, for example with `ngPreserveWhitespaces`.

#### Scenario: Projected line break

- **WHEN** the projected content, with whitespace kept, has the line `First line&#32;&#32;` followed by the line `Second line`
- **THEN** the paragraph holds "First line", a `br` and "Second line"

### Requirement: Module provides the component

`KbqMarkdownModule` SHALL export the `kbq-markdown` component and provide the parsing service it needs, so that importing the module is enough to use the component.

#### Scenario: Standalone component importing the module

- **WHEN** a standalone component lists `KbqMarkdownModule` in its `imports` and renders `<kbq-markdown>`
- **THEN** the Markdown is rendered without any other provider

### Requirement: Parsing service

`KbqMarkdownService.parseToHtml(markdown, options?)` SHALL return the HTML string produced by the global `marked` instance with the given options, with the same `kbq-markdown__*` classes the component adds. The returned string MUST NOT be sanitized. Parsing has to be synchronous: when `async` is on, in the given options or in the defaults of the global `marked` instance, `marked` returns a promise and the method throws a `TypeError` instead of returning.

#### Scenario: Paragraph

- **WHEN** `parseToHtml('paragraph')` is called
- **THEN** the result contains `<p class="kbq-markdown__p">`

#### Scenario: Raw HTML passes through

- **WHEN** `parseToHtml('<p >spaced</p>')` is called
- **THEN** the result is `<p class="kbq-markdown__p">spaced</p>`
