## MODIFIED Requirements

### Requirement: Projected content is read as plain text

The component SHALL take the projected content as its text content, exactly as the Angular template compiler leaves it: HTML entities arrive decoded, and an element in the projection contributes only its text. Unless the consumer keeps whitespace, as with `ngPreserveWhitespaces` on `kbq-markdown`, the compiler turns every run of two or more whitespace characters, decoded entities included, into one space: a lone newline survives, but not blank lines, indentation or trailing double spaces.

#### Scenario: Entity in the projection

- **WHEN** the projected content contains the line `&gt; blockquote`
- **THEN** a blockquote with the text "blockquote" is rendered

#### Scenario: Element in the projection

- **WHEN** the projected content contains `<b>bold</b>`
- **THEN** only the text "bold" reaches the parser, without the `b` element

### Requirement: Default parser options

Without `KBQ_MARKDOWN_MARKED_OPTIONS`, the component SHALL parse with the defaults of the global `marked` instance, which a call to `marked.use()` or `marked.setOptions()` anywhere in the application changes for every `kbq-markdown`. While those defaults are the ones `marked` ships, GitHub Flavored Markdown is on, and a single newline inside a paragraph MUST NOT produce a line break.

#### Scenario: Table without options

- **WHEN** no options are provided, the defaults of the global `marked` instance are unchanged and the source contains a pipe table
- **THEN** a `table` element is rendered

#### Scenario: Single newline without options

- **WHEN** no options are provided, the defaults of the global `marked` instance are unchanged and `markdownText` contains two lines separated by a single newline
- **THEN** both lines are rendered in one paragraph without a `br`

### Requirement: HTML in the Markdown is not sanitized

The component SHALL insert the generated HTML without Angular's sanitization. Raw HTML written in the Markdown, its attributes included, MUST reach the DOM as `marked` passes it through, apart from the class aliasing: an element of a listed tag other than `p` and `th` gets the alias class in front of its attributes, which shadows its own `class` attribute.

#### Scenario: Inline HTML element

- **WHEN** the source contains `<abbr title="HyperText Markup Language">HTML</abbr>`
- **THEN** an `abbr` element with that `title` is rendered

#### Scenario: Event handler attribute

- **WHEN** the source contains `<img src="x" onerror="handler()">`
- **THEN** the rendered `img` keeps its `onerror` attribute

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

### Requirement: Parsing service

`KbqMarkdownService.parseToHtml(markdown, options?)` SHALL return the HTML string produced by the global `marked` instance with the given options, with the same `kbq-markdown__*` classes the component adds. The returned string MUST NOT be sanitized. Parsing has to be synchronous: when `async` is on, in the given options or in the defaults of the global `marked` instance, `marked` returns a promise and the method throws a `TypeError` instead of returning.

#### Scenario: Paragraph

- **WHEN** `parseToHtml('paragraph')` is called
- **THEN** the result contains `<p class="kbq-markdown__p">`

#### Scenario: Raw HTML passes through

- **WHEN** `parseToHtml('<p >spaced</p>')` is called
- **THEN** the result is `<p class="kbq-markdown__p">spaced</p>`
