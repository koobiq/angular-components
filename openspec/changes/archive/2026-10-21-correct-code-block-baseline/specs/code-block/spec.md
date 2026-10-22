# code-block Specification Delta

## MODIFIED Requirements

### Requirement: Fallback language

A file without a `language` SHALL be highlighted as the fallback language, `plaintext` by default, which `KBQ_CODE_BLOCK_FALLBACK_FILE_LANGUAGE` or `kbqCodeBlockFallbackFileLanguageProvider()` replaces. A language highlight.js does not know SHALL fall back the same way and, in development mode, log the console warning `[KbqCodeBlock] Unknown file language: "<language>". Fall back to "<fallback>".` with the file. The loaded highlight.js MUST know the fallback; otherwise highlighting throws.

#### Scenario: File without a language

- **WHEN** the active file has no `language` and the block uses the full highlight.js package
- **THEN** `data-language` is `plaintext` and nothing is logged

#### Scenario: Unknown language

- **WHEN** the active file has `language: 'invalid_file_language'` and the block uses the full highlight.js package
- **THEN** `data-language` is `plaintext`
- **AND** a warning naming `invalid_file_language` is logged in development mode

#### Scenario: Fallback the configured core does not know

- **WHEN** a configuration loads `highlight.js/lib/core` and registers only `typescript`, and the active file has no `language`
- **THEN** highlighting the file throws `Unknown language: "plaintext"`

### Requirement: Content warnings in development mode

In development mode the block SHALL log `[KbqCodeBlock] File content contains illegal characters.` when highlight.js reports illegal content, which stock highlight.js 11 never does for the block's call, and `[KbqCodeBlock] File content does not match the specified programming language.` when highlight.js scores the content of a file in a known language other than `plaintext` with zero relevance, even if it highlighted part of it. Production builds MUST NOT log either warning.

#### Scenario: Content that does not match its language

- **WHEN** a file declares a known language but highlight.js scores its content with zero relevance
- **THEN** the mismatch warning is logged in development mode

#### Scenario: Highlighted content scored zero

- **WHEN** a file with `language: 'typescript'` holds only `42`
- **THEN** the number is highlighted and the mismatch warning is logged in development mode

### Requirement: Collapsed code does not scroll

While a positive `maxHeight` is set, the show all button is shown and `viewAll` is off, the code area SHALL be clipped at `maxHeight` without scrolling, and it MUST NOT be in the tab order.

#### Scenario: Collapsed block

- **WHEN** `maxHeight` is 200, the code is taller than that and `viewAll` is off
- **THEN** the code area cannot be scrolled and is skipped when tabbing

### Requirement: Expanding and collapsing

`viewAll` (default `false`, two-way as `[(viewAll)]`) SHALL lift the height limit and add the host class `kbq-code-block_view-all` while it is on. Clicking the show all button or calling `toggleViewAll()` SHALL flip `viewAll` and emit `viewAllChange` with the new value, and when that collapses the block it SHALL scroll the code area back to the top. Turning `viewAll` off through its input or by writing the signal SHALL neither emit `viewAllChange` nor scroll.

#### Scenario: Expanding

- **WHEN** `maxHeight` is 200 and `toggleViewAll()` is called
- **THEN** the code area has no height limit and `viewAllChange` emits `true`

#### Scenario: Collapsing

- **WHEN** an expanded block is collapsed with the button
- **THEN** the height limit returns and the code area is scrolled to the top

### Requirement: Show all from the keyboard

Enter on the show all button SHALL toggle `viewAll` once and prevent the key's default action. With a positive `maxHeight`, keyboard focus SHALL move to the code area when Enter expands the block, and SHALL stay on the button when it collapses the block.

#### Scenario: Enter expands

- **WHEN** `maxHeight` is 200, the button of a collapsed block has focus and the user presses Enter
- **THEN** the block expands once and the code area has keyboard focus

### Requirement: Active file

`activeFileIndex` (default `0`, two-way as `[(activeFileIndex)]`) SHALL choose the rendered file and the selected tab, which has the class `kbq-selected`. A bound value SHALL be read as a number, so a numeric string such as `"1"` selects that index; one that does not read as a non-negative integer, including `undefined`, SHALL read as `0`. An index past the end of `files` SHALL render the first file and select its tab while `activeFileIndex()` keeps the bound value.

#### Scenario: Selecting the second file

- **WHEN** `activeFileIndex` is set to 1
- **THEN** the second file is rendered and its tab has `kbq-selected`

#### Scenario: Index out of range

- **WHEN** `activeFileIndex` is 2 and `files` shrinks to two entries
- **THEN** the first file is rendered and `activeFileIndex()` is still 2

#### Scenario: Numeric string

- **WHEN** the block is written with `activeFileIndex="1"` and two files
- **THEN** `activeFileIndex()` is `1` and the second file is rendered

### Requirement: Copying the code

Clicking the copy button SHALL copy the raw `content` of the active file to the clipboard. When the copy succeeds, the button's tooltip SHALL read `copiedTooltip` until it is hidden. It SHALL read `copyTooltip` again the next time it is shown only if the copy button existed when the block's view was first initialized; a copy button that appears later, once `canCopy` is turned on, does not switch back.

#### Scenario: Successful copy

- **WHEN** the user clicks the copy button
- **THEN** the clipboard holds the active file's content and the tooltip reads `copiedTooltip`

#### Scenario: Copy button turned on later

- **WHEN** `canCopy` is `false` on the first render and later `true`, and the user copies the code and hovers the copy button again after its tooltip has hidden
- **THEN** the tooltip still reads `copiedTooltip`

### Requirement: Keyboard access to the code area

In the browser, the code area SHALL be in the tab order only while its content overflows it and no maximum height is in effect, re-evaluated after every render; otherwise its `tabIndex` SHALL be -1. When rendered on the server, it SHALL keep `tabindex="0"`. Keyboard focus on it SHALL add the class `cdk-keyboard-focused` and draw a focus outline.

#### Scenario: Code that fits

- **WHEN** the code fits the code area in the browser
- **THEN** the code area has `tabIndex` -1

#### Scenario: Code that overflows

- **WHEN** the code overflows the code area and no `maxHeight` is set
- **THEN** after the next render the code area has `tabIndex` 0

#### Scenario: Server render

- **WHEN** the block is rendered on the server
- **THEN** the code area has `tabindex="0"`
