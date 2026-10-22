# Spec Delta

## Purpose

Describes what `kbq-code-block` from `@koobiq/components/code-block` guarantees to consumers: how it renders and highlights code files, how its header, tabs, height limit, soft wrap and action bar behave, and how users read, switch, copy, download and open files with a pointer, the keyboard or assistive technology.

## ADDED Requirements

### Requirement: Rendering the active file

The block SHALL render the `content` of the active entry of `files` (an array of `KbqCodeBlockFile` with `content` and optional `filename`, `language` and `link`) as preformatted code. `files` SHALL default to an empty array.

#### Scenario: One file

- **WHEN** `files` holds one file
- **THEN** the code area shows that file's content

### Requirement: Empty file list

With an empty `files` list the block SHALL render no code and MUST NOT throw. Copying and downloading SHALL then do nothing, and no external link button SHALL be shown.

#### Scenario: Files cleared at runtime

- **WHEN** `files` is set to an empty array after the block has rendered
- **THEN** change detection does not throw and the code area holds no code

### Requirement: Syntax highlighting

The code element SHALL carry the class `hljs`. Once highlight.js is available, the block SHALL replace the plain content with highlight.js markup for the file's `language`, sanitized as HTML, and set `data-language` on the code element to the language highlight.js used. Switching the active file SHALL highlight the new file.

#### Scenario: Highlighted HTML file

- **WHEN** the active file has `language: 'html'` and highlighting has finished
- **THEN** the code element has the class `hljs` and `data-language="html"`

#### Scenario: Switching files

- **WHEN** `activeFileIndex` changes to a TypeScript file and then to a CSS file
- **THEN** `data-language` becomes `typescript` and then `css`

### Requirement: Fallback language

A file without a `language` SHALL be highlighted as the fallback language, `plaintext` by default, which `KBQ_CODE_BLOCK_FALLBACK_FILE_LANGUAGE` or `kbqCodeBlockFallbackFileLanguageProvider()` replaces. A language highlight.js does not know SHALL fall back the same way and, in development mode, log the console warning `[KbqCodeBlock] Unknown file language: "<language>". Fall back to "<fallback>".` with the file.

#### Scenario: File without a language

- **WHEN** the active file has no `language`
- **THEN** `data-language` is `plaintext` and nothing is logged

#### Scenario: Unknown language

- **WHEN** the active file has `language: 'invalid_file_language'`
- **THEN** `data-language` is `plaintext`
- **AND** a warning naming `invalid_file_language` is logged in development mode

### Requirement: Content warnings in development mode

In development mode the block SHALL log `[KbqCodeBlock] File content contains illegal characters.` when highlight.js reports illegal content, and `[KbqCodeBlock] File content does not match the specified programming language.` when a known language other than `plaintext` finds nothing to highlight. Production builds MUST NOT log either warning.

#### Scenario: Content that does not match its language

- **WHEN** a file declares a known language but highlight.js scores its content with zero relevance
- **THEN** the mismatch warning is logged in development mode

### Requirement: Lazy loading of highlight.js

Without a configuration, the block SHALL load the full `highlight.js` package through a dynamic import the first time a block needs it, and every block SHALL reuse that load. Until highlight.js has loaded, the code element SHALL show the file content as plain text with no `data-language`.

#### Scenario: Before and after the load

- **WHEN** a block renders while highlight.js is still loading
- **THEN** the code element shows the plain content and has no `data-language`
- **AND** once the load finishes, the content is highlighted

#### Scenario: Several blocks on one page

- **WHEN** three blocks render under the same configuration
- **THEN** highlight.js is loaded once and each block is highlighted

### Requirement: Custom highlight.js configuration

`kbqCodeBlockHighlightJsConfigProvider({ core, languages })` (token `KBQ_CODE_BLOCK_HIGHLIGHT_JS_CONFIG`) SHALL load `core` instead of the full package and register each entry of `languages` under its key. The configured languages SHALL be loaded together with the core, the first time a block under that configuration is highlighted.

#### Scenario: Core with two languages

- **WHEN** the configuration gives a core loader and loaders for `typescript` and `css`
- **THEN** each language loader is called once and both languages are registered with the core

### Requirement: Scope of a highlight.js configuration

A configuration provided by a component or a route SHALL apply only to the blocks inside it, and blocks under the same configuration object SHALL share one load.

#### Scenario: Root and component configurations

- **WHEN** a block renders under a root configuration and another inside a component that provides its own
- **THEN** each block is highlighted by the core of its own configuration, and each core is loaded once

### Requirement: Failed highlight.js load

When loading highlight.js fails, the block SHALL keep showing the plain content, stop waiting for highlighting, and log `[KbqCodeBlock] Failed to load highlight.js.` with the error in development mode. The next change of the active file SHALL try the load again.

#### Scenario: Offline load

- **WHEN** the core loader rejects
- **THEN** the plain content stays and a warning is logged
- **AND** after the active file changes, the loader is called again and the new file is highlighted

### Requirement: Highlighting during server rendering

On the server, the application SHALL stay unstable until the code is highlighted, so the rendered page contains highlighted markup.

#### Scenario: Server render

- **WHEN** a block renders on the server and highlight.js has not loaded yet
- **THEN** the application is not stable until the code has been highlighted

### Requirement: Server markup during hydration

In the browser, markup that the server highlighted SHALL stay in place, and the application SHALL be stable, until highlight.js has loaded; the file SHALL then be highlighted again. If the load fails, the server markup SHALL stay. A different file that arrives before the load SHALL replace the server markup with its plain content.

#### Scenario: Hydrated block

- **WHEN** a block hydrates with highlighted markup from the server
- **THEN** that markup stays while highlight.js loads and is replaced by a fresh highlight afterwards

#### Scenario: File changed before the load

- **WHEN** the active file changes before highlight.js has loaded
- **THEN** the code element shows the new file's plain content and has no `data-language`

### Requirement: Line numbers

`lineNumbers` (default `false`) SHALL show a column of line numbers next to the code. The numbered rows SHALL be built whether or not `lineNumbers` is set; without it the host has the class `kbq-code-block_hide-line-numbers` and the number column is hidden.

#### Scenario: Numbers off by default

- **WHEN** a block renders without `lineNumbers`
- **THEN** the host has `kbq-code-block_hide-line-numbers`

#### Scenario: Turning numbers on

- **WHEN** `lineNumbers` is set to `true`
- **THEN** the class is removed and the numbers are shown

### Requirement: Line numbering rules

Line numbers SHALL start at 1 and count the lines of the content, not counting a trailing empty line. Content of a single line SHALL render without numbered rows, so it shows no number even with `lineNumbers` set.

#### Scenario: Multi-line file

- **WHEN** a three-line file renders with `lineNumbers`
- **THEN** its lines are numbered 1, 2 and 3

#### Scenario: Single-line file

- **WHEN** a one-line file renders with `lineNumbers`
- **THEN** no line number is shown

### Requirement: Header shadow on scroll

When the code area is scrolled down from its top, the header SHALL show a shadow under it, and SHALL drop the shadow when the code area is scrolled back to the top.

#### Scenario: Scrolled code

- **WHEN** the user scrolls the code area down
- **THEN** a shadow appears under the header

### Requirement: Maximum height

`maxHeight`, in pixels, SHALL limit the height of the code area while `viewAll` is off. It accepts a number or a numeric string; any value that is not a finite number SHALL read back as `undefined` and set no limit, and a value of zero or less SHALL set no limit either.

#### Scenario: Numeric string

- **WHEN** the block is written with `maxHeight="200"`
- **THEN** `maxHeight()` is `200` and the code area is at most 200 px high

#### Scenario: Not a number

- **WHEN** `maxHeight` is bound to `'200px'` or to `undefined`
- **THEN** `maxHeight()` is `undefined` and the height is not limited

### Requirement: Show all button

When `maxHeight` is set and the code is taller than it, the block SHALL render a button at the bottom of the code area. It SHALL read `viewAllText` with a down chevron while collapsed and `viewLessText` with an up chevron while expanded. The button SHALL appear and disappear as the code grows or shrinks and as `maxHeight` changes, including a `maxHeight` bound after the first render.

#### Scenario: Code taller than the limit

- **WHEN** `maxHeight` is 200 and the code is 500 px high
- **THEN** the button is shown

#### Scenario: Code that shrinks

- **WHEN** the code shrinks below `maxHeight`
- **THEN** the button is removed

#### Scenario: Limit bound later

- **WHEN** `maxHeight` is bound to 200 after the block has rendered 500 px of code, and later to 1000
- **THEN** the button appears and then disappears

### Requirement: Collapsed code does not scroll

While the show all button is shown and `viewAll` is off, the code area SHALL be clipped at `maxHeight` without scrolling, and it MUST NOT be in the tab order.

#### Scenario: Collapsed block

- **WHEN** the code is taller than `maxHeight` and `viewAll` is off
- **THEN** the code area cannot be scrolled and is skipped when tabbing

### Requirement: Expanding and collapsing

`viewAll` (default `false`, two-way as `[(viewAll)]`) SHALL lift the height limit and add the host class `kbq-code-block_view-all` while it is on. Clicking the show all button or calling `toggleViewAll()` SHALL flip `viewAll` and emit `viewAllChange` with the new value. Collapsing SHALL scroll the code area back to the top.

#### Scenario: Expanding

- **WHEN** `maxHeight` is 200 and `toggleViewAll()` is called
- **THEN** the code area has no height limit and `viewAllChange` emits `true`

#### Scenario: Collapsing

- **WHEN** an expanded block is collapsed with the button
- **THEN** the height limit returns and the code area is scrolled to the top

### Requirement: Show all from the keyboard

Enter on the show all button SHALL toggle `viewAll` once and prevent the key's default action. When it expands the block, keyboard focus SHALL move to the code area; when it collapses the block, focus SHALL stay on the button.

#### Scenario: Enter expands

- **WHEN** the button of a collapsed block has focus and the user presses Enter
- **THEN** the block expands once and the code area has keyboard focus

### Requirement: Soft wrap

`softWrap` (default `false`, two-way as `[(softWrap)]`) SHALL wrap lines that are wider than the code area and add the host class `kbq-code-block_soft-wrap`. Without it, lines SHALL NOT wrap and wide code overflows horizontally. The setting SHALL be kept when the block is collapsed and expanded.

#### Scenario: Wrapping on

- **WHEN** `softWrap` is set to `true`
- **THEN** the host has `kbq-code-block_soft-wrap` and long lines wrap

### Requirement: Soft wrap toggle

With `canToggleSoftWrap` (default `false`) the action bar SHALL show a toggle button. Clicking it or calling `toggleSoftWrap()` SHALL flip `softWrap` and emit `softWrapChange` with the new value. The icon SHALL show the state a click leads to, and the button's name and tooltip SHALL be `softWrapOnTooltip` while wrapping is off and `softWrapOffTooltip` while it is on. The toggle SHALL be available whatever the `viewAll` state.

#### Scenario: Toggle shown on request

- **WHEN** `canToggleSoftWrap` is set
- **THEN** the action bar contains the soft wrap toggle

#### Scenario: Clicking the toggle

- **WHEN** wrapping is off and the user clicks the toggle
- **THEN** `softWrap` becomes `true` and `softWrapChange` emits `true`

### Requirement: File tabs

Unless tabs are hidden, the header SHALL show one tab per file, labelled with its `filename`, or with the fallback file name when `filename` is missing or empty.

#### Scenario: File without a name

- **WHEN** the files are one without a `filename` and one named `koobiq`
- **THEN** the tabs read `code` and `koobiq`

### Requirement: Fallback file name

The fallback file name SHALL be `code` by default, and `KBQ_CODE_BLOCK_FALLBACK_FILE_NAME` or `kbqCodeBlockFallbackFileNameProvider()` SHALL replace it. It SHALL be used for tab labels and download names; the file objects MUST NOT be modified.

#### Scenario: Provided name

- **WHEN** `kbqCodeBlockFallbackFileNameProvider('snippet')` is provided and a file has no `filename`
- **THEN** its tab reads `snippet`

### Requirement: Custom tab label

An `<ng-template kbqCodeBlockTabLinkContent>` projected into the block SHALL replace the label of every tab. The template context SHALL provide the file as `$implicit` and the fallback file name as `fallbackFileName`.

#### Scenario: Template label

- **WHEN** a tab label template rendering a fixed text is projected
- **THEN** the tab shows that text instead of the file name

### Requirement: Hiding tabs

`hideTabs` (default `false`) SHALL remove the tab bar and add the host class `kbq-code-block_hide-tabs`. A single file without a `filename` SHALL hide the tabs whatever `hideTabs` is bound to, and the tabs SHALL come back when the files get names. The block MUST NOT emit `hideTabsChange` when it hides the tabs by itself.

#### Scenario: Hiding by input

- **WHEN** `hideTabs` is set to `true`
- **THEN** the tab bar is removed and the host has `kbq-code-block_hide-tabs`

#### Scenario: Single unnamed file

- **WHEN** `files` holds one file without a `filename` and `hideTabs` is `false`
- **THEN** the tab bar is not rendered

#### Scenario: Files named later

- **WHEN** the single unnamed file is replaced by two named files
- **THEN** the tab bar is rendered again

### Requirement: Single named file

With exactly one file that has a `filename`, its tab SHALL be shown but SHALL NOT respond to the pointer and SHALL NOT be marked as selected.

#### Scenario: One named file

- **WHEN** `files` holds one file named `index.html`
- **THEN** the header shows its tab without the selected state, and clicking it does nothing

### Requirement: Active file

`activeFileIndex` (default `0`, two-way as `[(activeFileIndex)]`) SHALL choose the rendered file and the selected tab, which has the class `kbq-selected`. A value that is not a non-negative integer, including `undefined`, SHALL read as `0`. An index past the end of `files` SHALL render the first file and select its tab while `activeFileIndex()` keeps the bound value.

#### Scenario: Selecting the second file

- **WHEN** `activeFileIndex` is set to 1
- **THEN** the second file is rendered and its tab has `kbq-selected`

#### Scenario: Index out of range

- **WHEN** `activeFileIndex` is 2 and `files` shrinks to two entries
- **THEN** the first file is rendered and `activeFileIndex()` is still 2

### Requirement: Switching tabs

Clicking the tab of a file other than `activeFileIndex()` SHALL set `activeFileIndex`, emit `activeFileIndexChange` with the new index and scroll the code area to the top. Clicking the tab whose index equals `activeFileIndex()` SHALL do nothing.

#### Scenario: Clicking another tab

- **WHEN** the first file is active and the user clicks the third tab
- **THEN** the third file is rendered, `activeFileIndexChange` emits 2 and the code area is at the top

#### Scenario: Clicking the selected tab

- **WHEN** the user clicks the tab that is already selected
- **THEN** no `activeFileIndexChange` is emitted

### Requirement: Filled style

`filled` (default `false`) SHALL add the host classes `kbq-code-block_filled` and `kbq-code-block_no-border`; without it the host SHALL have `kbq-code-block_outline`.

#### Scenario: Filled block

- **WHEN** `filled` is set to `true`
- **THEN** the host has `kbq-code-block_filled` and `kbq-code-block_no-border`

#### Scenario: Outline by default

- **WHEN** `filled` is not set
- **THEN** the host has `kbq-code-block_outline`

### Requirement: Style without a border

`noBorder` (default `false`) SHALL add the host class `kbq-code-block_no-border`, which removes the border.

#### Scenario: No border

- **WHEN** `noBorder` is set to `true`
- **THEN** the host has `kbq-code-block_no-border`

### Requirement: Action bar visibility

The action bar SHALL be shown, and the host SHALL have `kbq-code-block_show-actionbar`, while tabs are shown, on iOS and Android, or with `alwaysShowActionbar`. Otherwise it SHALL be hidden and SHALL appear 100 ms after the pointer enters the block and hide 100 ms after it leaves. A block rendered under a resting pointer SHALL show it at once. With tabs hidden it floats over the top-right corner of the code.

#### Scenario: Tabs shown

- **WHEN** the tabs are shown
- **THEN** the host has `kbq-code-block_show-actionbar`

#### Scenario: Hover with hidden tabs

- **WHEN** the tabs are hidden and the pointer enters the block
- **THEN** after 100 ms the action bar is shown, and 100 ms after the pointer leaves it is hidden again

#### Scenario: Mobile device

- **WHEN** the block renders on iOS or Android with the tabs hidden
- **THEN** the action bar is shown without hover

### Requirement: Always showing the action bar

`alwaysShowActionbar` SHALL keep the action bar visible whatever the tabs and the pointer do. Its default SHALL come from `KBQ_CODE_BLOCK_DEFAULT_OPTIONS`, set with `kbqCodeBlockDefaultOptionsProvider({ alwaysShowActionbar })`, and is `false` without it; a bound input SHALL override the provided default. Turning it off SHALL restore the hover behaviour.

#### Scenario: Provided default

- **WHEN** `kbqCodeBlockDefaultOptionsProvider({ alwaysShowActionbar: true })` is provided and the tabs are hidden
- **THEN** the action bar is shown without hover

#### Scenario: Input overrides the default

- **WHEN** the same default is provided and the block binds `[alwaysShowActionbar]="false"` with the tabs hidden
- **THEN** the action bar is hidden until hovered

### Requirement: Action bar buttons

The action bar SHALL contain, in this order, the soft wrap toggle when `canToggleSoftWrap` is set, the download button when `canDownload` is set, the copy button when `canCopy` is set, and the external link button when the active file has a `link`. `canCopy` SHALL default to `true`; `canToggleSoftWrap` and `canDownload` SHALL default to `false`.

#### Scenario: Defaults

- **WHEN** a block renders with no action inputs and a file without `link`
- **THEN** the action bar contains only the copy button

#### Scenario: Copy turned off

- **WHEN** the block is written with `canCopy="false"`
- **THEN** no copy button is rendered

### Requirement: Copying the code

Clicking the copy button SHALL copy the raw `content` of the active file to the clipboard. When the copy succeeds, the button's tooltip SHALL read `copiedTooltip` until it is hidden, and SHALL read `copyTooltip` again the next time it is shown.

#### Scenario: Successful copy

- **WHEN** the user clicks the copy button
- **THEN** the clipboard holds the active file's content and the tooltip reads `copiedTooltip`

### Requirement: Downloading the code

Clicking the download button SHALL download the raw `content` of the active file as a `text/plain` file named after its `filename`, or after the fallback file name when it has none.

#### Scenario: Unnamed file

- **WHEN** the active file has no `filename` and the user clicks the download button
- **THEN** a download of the content as `text/plain` starts with the suggested name `code`

### Requirement: Opening the external link

When the active file has a `link`, the action bar SHALL show a button that opens the link, sanitized as a URL, in a new browsing context.

#### Scenario: File with a link

- **WHEN** the active file has `link: 'https://koobiq.io'` and the user clicks the link button
- **THEN** `https://koobiq.io` opens in a new tab

### Requirement: Keyboard access to the code area

In the browser, the code area SHALL be in the tab order only while it can scroll and no maximum height is in effect, re-evaluated after every render; otherwise its `tabIndex` SHALL be -1. When rendered on the server, it SHALL keep `tabindex="0"`. Keyboard focus on it SHALL add the class `cdk-keyboard-focused` and draw a focus outline.

#### Scenario: Code that fits

- **WHEN** the code fits the code area in the browser
- **THEN** the code area has `tabIndex` -1

#### Scenario: Code that overflows

- **WHEN** the code overflows the code area and no `maxHeight` is set
- **THEN** after the next render the code area has `tabIndex` 0

#### Scenario: Server render

- **WHEN** the block is rendered on the server
- **THEN** the code area has `tabindex="0"`

### Requirement: Programmatic scrolling

`scrollTo(options)` SHALL scroll the code area with the scrollbar's scroll options. While highlighting is still pending, the scroll SHALL wait until highlighting has settled.

#### Scenario: Highlighting done

- **WHEN** highlighting has finished and `scrollTo({ top: 50 })` is called
- **THEN** the code area scrolls at once

#### Scenario: Highlighting pending

- **WHEN** `scrollTo({ top: 100 })` is called while highlight.js is loading
- **THEN** the code area scrolls only after highlighting has finished

### Requirement: Scrollbar reveal on arrival

Once highlighting has settled, a code area that can scroll SHALL briefly reveal its scrollbar without the pointer near it; a code area that fits SHALL reveal nothing.

#### Scenario: Overflowing code

- **WHEN** a block with code taller than its height finishes highlighting
- **THEN** its scrollbar track is revealed

#### Scenario: Fitting code

- **WHEN** a block whose code fits finishes highlighting
- **THEN** no scrollbar appears

### Requirement: Names of the action buttons

The soft wrap toggle, the download button, the copy button and the external link button SHALL have an `aria-label` and a tooltip from the code block locale strings: the soft wrap text for the current state, `downloadTooltip`, `copyTooltip` and `openExternalSystemTooltip`. The copy button's `aria-label` SHALL stay `copyTooltip` after a copy.

#### Scenario: Default names

- **WHEN** a block with every action and wrapping off renders in the `en-US` locale
- **THEN** the buttons are named "Enable word wrap", "Download", "Copy" and "Open in the external system"

### Requirement: Tab semantics

With tabs shown, the tab bar SHALL have `role="tablist"`, each tab `role="tab"` with `aria-selected` and `aria-controls` pointing at the code area, and the code area `role="tabpanel"` labelled by the selected tab. Only the selected tab SHALL be in the tab order; the arrow keys, Home and End SHALL move focus between tabs, and Enter or Space SHALL select the focused tab. The code area SHALL keep `role="tabpanel"` when tabs are hidden.

#### Scenario: Selecting a tab from the keyboard

- **WHEN** a tab has focus, the user presses Right Arrow and then Enter
- **THEN** focus moves to the next tab and its file becomes active

### Requirement: Localized strings

The strings the block renders — `softWrapOnTooltip`, `softWrapOffTooltip`, `downloadTooltip`, `copyTooltip`, `copiedTooltip`, `viewAllText`, `viewLessText` and `openExternalSystemTooltip` of the `codeBlock` locale section — SHALL follow the active locale, `ru-RU` by default. `kbqCodeBlockLocaleConfigurationProvider()` SHALL override the strings it is given, and `[localeOverrides]` SHALL override them for one block.

#### Scenario: Switching the locale

- **WHEN** the application switches the locale to `en-US`
- **THEN** the show all button reads "Show all"

#### Scenario: Provider override

- **WHEN** `kbqCodeBlockLocaleConfigurationProvider()` gives custom values for every string
- **THEN** the block uses those values

### Requirement: Boolean attribute inputs

The boolean inputs `lineNumbers`, `filled`, `canToggleSoftWrap`, `softWrap`, `viewAll`, `canDownload`, `canCopy`, `alwaysShowActionbar`, `noBorder` and `hideTabs` SHALL read a valueless attribute as `true` and the string `"false"` as `false`.

#### Scenario: Valueless attributes

- **WHEN** the block is written with `softWrap canDownload`
- **THEN** `softWrap()` and `canDownload()` are `true`

### Requirement: Writable state signals

`files`, `activeFileIndex`, `softWrap`, `viewAll`, `hideTabs` and `canDownload` SHALL be writable signals that start from their inputs. A value written in code SHALL hold until the corresponding input receives a new value, which replaces it.

#### Scenario: Written in code, then rebound

- **WHEN** code calls `codeBlock.softWrap.set(true)` and the bound `softWrap` input later changes to `false`
- **THEN** `softWrap()` is `true` until the binding changes, and `false` afterwards

### Requirement: Module and template reference

`KbqCodeBlockModule` SHALL export the standalone `KbqCodeBlock` and `KbqCodeBlockTabLinkContent`. The component SHALL be exported to templates as `kbqCodeBlock`.

#### Scenario: Template reference

- **WHEN** a template declares `<kbq-code-block #block="kbqCodeBlock" />`
- **THEN** `block.toggleSoftWrap()`, `block.toggleViewAll()` and `block.scrollTo()` can be called from that template
