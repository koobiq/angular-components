<!-- covers: accordion, actions-panel, alert, app-switcher, autocomplete, badge, breadcrumbs, button, button-group, button-toggle, checkbox, clamped-list, clamped-text, code-block, content-panel, datepicker, dl, dropdown, empty-state, file-upload, filter-bar, form-field, icon, icon-button, icon-item, inline-edit, input, link, list, loader-overlay, markdown, modal, navbar, notification-center, overflow-items, popover, progress-bar, progress-spinner, radio, resizer, search-expandable, select, sidebar, sidepanel, skeleton, split-button, splitter, table, tabs, tag, tag-autocomplete, tag-input, tag-list, textarea, time-range, timepicker, timezone, title, toast, toggle, tooltip, top-bar, tree, tree-select, username -->

# Choosing between similar components

Find the need in its group, pick the component, then read its full reference before writing code. Each entry gives the entry point, the main selector or class and the reference file; the nested line says when to use the component and what to use instead.

- [Choosing a value](#choosing-a-value)
- [Overlays](#overlays)
- [Feedback and status](#feedback-and-status)
- [Progress and loading](#progress-and-loading)
- [Navigation](#navigation)
- [Data display](#data-display)
- [Text entry and fields](#text-entry-and-fields)
- [Actions](#actions)
- [Panels and layout](#panels-and-layout)

## Choosing a value

Decide by the number of options, whether they fit on screen, whether the user types the values and whether the data is hierarchical.

- **Checkbox**: `@koobiq/components/checkbox`, `<kbq-checkbox>`. Reference: `node_modules/@koobiq/components/agent-docs/components/checkbox.md`
    - Use for independent options and for a yes/no value saved with a form; `[indeterminate]` on a parent checkbox shows a partly selected group. Not for settings applied at once (toggle) or mutually exclusive options (radio).
- **Toggle**: `@koobiq/components/toggle`, `<kbq-toggle>`. Reference: `node_modules/@koobiq/components/agent-docs/components/toggle.md`
    - Use for an on/off setting applied immediately, with no Save button. Not for values saved by submitting a form (checkbox) or choices that are not binary (radio, select).
- **Radio**: `@koobiq/components/radio`, `<kbq-radio-group>` with `<kbq-radio-button>`. Reference: `node_modules/@koobiq/components/agent-docs/components/radio.md`
    - Use for one of up to 7 mutually exclusive, related options. Not for more than 7 options (select), short options with enough horizontal space (button toggle) or a boolean (toggle).
- **Button toggle**: `@koobiq/components/button-toggle`, `<kbq-button-toggle-group>` with `<kbq-button-toggle>`. Reference: `node_modules/@koobiq/components/agent-docs/components/button-toggle.md`
    - Use for 3-5 short options that fit one row without wrapping, including another view of the same data; `multiple` makes the toggles independent. Not for longer lists (radio, select) or plain actions (button group).
- **Select**: `@koobiq/components/select`, `<kbq-select>` with `<kbq-option>`. Reference: `node_modules/@koobiq/components/agent-docs/components/select.md`
    - Use for one value, or several with `multiple`, from a predefined list; add search to lists of more than 10 options. Not for values the user types (autocomplete, tag autocomplete), hierarchical data (tree select) or an empty list of options (an input, or a dialog that creates the entity).
- **Autocomplete**: `@koobiq/components/autocomplete`, `<kbq-autocomplete>` attached through `input[kbqAutocomplete]` (a `textarea` works too). Reference: `node_modules/@koobiq/components/agent-docs/components/autocomplete.md`
    - Use for a text field that suggests matching options while the user types; `kbqAutocompleteTextMode` inserts the option at the caret for mentions and slash commands. For a fixed list without typing use select, for several values tag autocomplete.
- **Tree select**: `@koobiq/components/tree-select`, `<kbq-tree-select>` with `<kbq-tree-selection>`. Reference: `node_modules/@koobiq/components/agent-docs/components/tree-select.md`
    - Use for one or several values from hierarchical data in a form field. Not for flat lists (select) or a tree shown on the page (tree).
- **Tag autocomplete**: `@koobiq/components/tags`, `<kbq-tag-list>` with `input[kbqTagInputFor]` and `<kbq-autocomplete>`. Reference: `node_modules/@koobiq/components/agent-docs/components/tag-autocomplete.md`
    - Use for several values picked from a dictionary, plus new values the user types. For values limited to a fixed list use select with `multiple`.
- **Tag input**: `@koobiq/components/tags`, `<kbq-tag-list>` with `input[kbqTagInputFor]`. Reference: `node_modules/@koobiq/components/agent-docs/components/tag-input.md`
    - Use for several free-form values that become tags on Enter, a separator key or paste. When there is a dictionary to suggest from, use tag autocomplete.
- **Tag list**: `@koobiq/components/tags`, `<kbq-tag-list>` with `<kbq-tag>`. Reference: `node_modules/@koobiq/components/agent-docs/components/tag-list.md`
    - Use as the container of tag input and tag autocomplete, or alone for a set of tags the user removes, selects or reorders.
- **List**: `@koobiq/components/list`, `<kbq-list-selection>` with `<kbq-list-option>`. Reference: `node_modules/@koobiq/components/agent-docs/components/list.md`
    - Use for an always visible list of related items where the user selects one or several; `multiple="checkbox"` keeps the selection readable. Not for one value from a closed set in a form (select) or hierarchical data (tree). `<kbq-list>` with `<kbq-list-item>` is a plain container without selection.

## Overlays

Prefer overlays that leave the page usable; open a modal only when the task must block the page.

- **Tooltip**: `@koobiq/components/tooltip`, `[kbqTooltip]`. Reference: `node_modules/@koobiq/components/agent-docs/components/tooltip.md`
    - Use for a brief hint on hover or focus, such as the name of an icon-only button or why a control is disabled. Not for buttons, links or other interactive content (popover) or the full text of truncated content (title).
- **Popover**: `@koobiq/components/popover`, `[kbqPopover]` with `kbqPopoverContent`; `[kbqPopoverConfirm]` asks to confirm an action. Reference: `node_modules/@koobiq/components/agent-docs/components/popover.md`
    - Use for a small non-modal dialog next to its trigger with text, fields or other controls. Not for short text without controls (tooltip), a list of commands (dropdown) or an important answer the system waits for (modal).
- **Dropdown**: `@koobiq/components/dropdown`, `<kbq-dropdown>` opened by `[kbqDropdownTriggerFor]`, items `[kbq-dropdown-item]`. Reference: `node_modules/@koobiq/components/agent-docs/components/dropdown.md`
    - Use for a menu of actions next to a trigger, with nested menus and search (`kbqDropdownSearch`) when needed. Not for fields and other content navigated with Tab (popover) or a form value (select).
- **Modal**: `@koobiq/components/modal`, `KbqModalService` (`create()`, `open()`, `confirm()`). Reference: `node_modules/@koobiq/components/agent-docs/components/modal.md`
    - Use for a short task the user starts that must block the page: a short form, settings, a single question. Not for long content (sidepanel or a separate page), a dialog opened from another modal, or "Are you sure?" before a reversible action (perform it and offer undo).
- **Sidepanel**: `@koobiq/components/sidepanel`, `KbqSidepanelService.open()`. Reference: `node_modules/@koobiq/components/agent-docs/components/sidepanel.md`
    - Use for a lot of data, long and narrow content, and flows that open panels on top of each other; the default modal mode suits editing, `hasBackdrop: false` suits read-only viewing with the page still usable. Not for short, wide content (modal) or a preview that should shift the page instead of covering it (content panel).

## Feedback and status

Decide by lifetime and place: a message the user may miss goes to a toast, a message that stays with the content goes to an alert.

- **Toast**: `@koobiq/components/toast`, `KbqToastService.show()`. Reference: `node_modules/@koobiq/components/agent-docs/components/toast.md`
    - Use for a message that needs no response and is not tied to an element: the result of an operation, a started background process, an error that does not stop work. Not for confirming commands (modal, `[kbqPopoverConfirm]`) or information that must stay visible (alert).
- **Alert**: `@koobiq/components/alert`, `<kbq-alert>` with `alertColor` (`error`, `warning`, `success`, `info`). Reference: `node_modules/@koobiq/components/agent-docs/components/alert.md`
    - Use for important information within the page: a hint, a status change, a problem, or a form error not tied to one field (above the first field); `[compact]="true"` suits popovers and forms. Not for transient results (toast); an error of one field goes to `<kbq-error>` in its form field.
- **Notification center**: `@koobiq/components/notification-center`, `<kbq-notification-center>` or `[kbqNotificationCenterTrigger]`, fed by `KbqNotificationCenterService`. Reference: `node_modules/@koobiq/components/agent-docs/components/notification-center.md`
    - Use for the list of application notifications grouped by date, opened from the main menu or in a popover. Not for a single transient message (toast).
- **Empty state**: `@koobiq/components/empty-state`, `<kbq-empty-state>`. Reference: `node_modules/@koobiq/components/agent-docs/components/empty-state.md`
    - Use in place of the content of an empty block or page, or for a load error with `errorColor`, optionally with actions. It replaces the missing content; a message shown alongside content is an alert.
- **Badge**: `@koobiq/components/badge`, `<kbq-badge>`. Reference: `node_modules/@koobiq/components/agent-docs/components/badge.md`
    - Use for the status, count or another characteristic of an object, on its own, in tables and key-value lists; do not overuse it. Not for tokens in input controls (tag).
- **Tag**: `@koobiq/components/tags`, `<kbq-tag>`. Reference: `node_modules/@koobiq/components/agent-docs/components/tag.md`
    - Use only as a token inside input controls: select with `multiple`, tag input, tag autocomplete, tag list. Not for colored labels in tables or key-value lists (badge).

## Progress and loading

Decide by duration and scope: show nothing under 1 s; use a skeleton for page content that loads in 2-10 s, a spinner for one element and a progress bar for long processes.

- **Skeleton**: `@koobiq/components/skeleton`, `<kbq-skeleton>`, or `[kbqSkeleton]` on an existing element. Reference: `node_modules/@koobiq/components/agent-docs/components/skeleton.md`
    - Use while page or panel content loads, to show its structure and avoid layout shifts. Not for one element such as a video (progress spinner) or long processes (progress bar).
- **Loader overlay**: `@koobiq/components/loader-overlay`, `<kbq-loader-overlay>`. Reference: `node_modules/@koobiq/components/agent-docs/components/loader-overlay.md`
    - Use when a block is loading or running a process and must not be used meanwhile, for example a form being submitted; for loading of the whole page, use its enlarged spinner. For page content that loads in 2-10 s, prefer a skeleton.
- **Progress spinner**: `@koobiq/components/progress-spinner`, `<kbq-progress-spinner>` with `mode` (`determinate` with `value`, or `indeterminate`). Reference: `node_modules/@koobiq/components/agent-docs/components/progress-spinner.md`
    - Use for loading of a single element, or for a long process.
- **Progress bar**: `@koobiq/components/progress-bar`, `<kbq-progress-bar>` with `mode` and `value` from 0 to 100. Reference: `node_modules/@koobiq/components/agent-docs/components/progress-bar.md`
    - Use for long processes such as file conversion, upload or download, with the remaining time next to it.
- **Button in progress**: `@koobiq/components/button`, `[kbq-button]` with the `kbq-progress` class. Reference: `node_modules/@koobiq/components/agent-docs/components/button.md`
    - Use when the action of a button, such as submitting a form, takes more than 1-2 s.

## Navigation

The navbar works at product level, the top bar at page level, tabs inside a page; links lead to other pages.

- **Navbar**: `@koobiq/components/navbar`, `<kbq-navbar>` or `<kbq-vertical-navbar>`. Reference: `node_modules/@koobiq/components/agent-docs/components/navbar.md`
    - Use for the main product menu: logo, section links, app switcher, main action, notification center, search. The horizontal menu suits layouts of three or more columns, the vertical one long pages. Not for switching content within a page (tabs).
- **Top bar**: `@koobiq/components/top-bar`, `<kbq-top-bar>`. Reference: `node_modules/@koobiq/components/agent-docs/components/top-bar.md`
    - Use for the toolbar that stays visible on a page: the page title or breadcrumbs on the left, page actions on the right. Not for the main menu (navbar).
- **Breadcrumbs**: `@koobiq/components/breadcrumbs`, `<kbq-breadcrumbs>` with `<kbq-breadcrumb-item>`, each with a `routerLink`. Reference: `node_modules/@koobiq/components/agent-docs/components/breadcrumbs.md`
    - Use to show where an internal page of a module sits relative to the main page, for example in the top bar. On initial screens without a path, show the page title instead.
- **Tabs**: `@koobiq/components/tabs`, `<kbq-tab-group>` with `<kbq-tab>`; for routed pages `[kbqTabNavBar]` with `[kbqTabLink]`. Reference: `node_modules/@koobiq/components/agent-docs/components/tabs.md`
    - Use to split the content of a page into groups the user switches between without reloading. Not for main navigation (navbar), form values (radio, button toggle), another view of the same data (button toggle, dropdown), a single tab, wizard steps, or content that fits on one screen.
- **Link**: `@koobiq/components/link`, `[kbq-link]` on an `a` element; `pseudo` for an action inside text. Reference: `node_modules/@koobiq/components/agent-docs/components/link.md`
    - Use for going to a page inside or outside the product. Not for the primary action of a modal or for actions outside text (button); do not link to the current page.
- **Tree**: `@koobiq/components/tree`, `<kbq-tree-selection>` with `<kbq-tree-option>`. Reference: `node_modules/@koobiq/components/agent-docs/components/tree.md`
    - Use for a hierarchical catalog of hundreds of items on the page, with single or multiple selection and search. Not for flat or small data (list) or a value in a form field (tree select).
- **App switcher**: `@koobiq/components/app-switcher`, `[kbqAppSwitcher]`. Reference: `node_modules/@koobiq/components/agent-docs/components/app-switcher.md`
    - Use for switching between applications and platforms, for example from the navbar.

## Data display

Choose by the shape of the data: rows and columns, properties of one object, a flat list (list) or a hierarchy (tree), code or rich text, long content.

- **Table**: `@koobiq/components/table`, `table[kbq-table]`. Reference: `node_modules/@koobiq/components/agent-docs/components/table.md`
    - Use for simple tables with little data and only standard HTML table features; `stickyHeader` keeps the header of a long table visible. Not for sorting, resizing or reordering columns, or large data (AG Grid), nor for a single column (list, tree).
- **AG Grid**: a separate package, `@koobiq/ag-grid-angular-theme`, that styles the `ag-grid-angular` component through the `kbqAgGridTheme` attribute. Reference: `node_modules/@koobiq/components/agent-docs/components/ag-grid.md`
    - Use for large tables with sorting, virtual scrolling, column resizing and reordering, row grouping and saved state. Not for small, simple tables (table).
- **Description list**: `@koobiq/components/dl`, `<kbq-dl>` with `<kbq-dt>` and `<kbq-dd>`. Reference: `node_modules/@koobiq/components/agent-docs/components/dl.md`
    - Use for term-description pairs, such as the properties of one object, in an adaptive, horizontal or vertical layout. To edit such values in place, use inline edit.
- **Code block**: `@koobiq/components/code-block`, `<kbq-code-block>` (needs `highlight.js`). Reference: `node_modules/@koobiq/components/agent-docs/components/code-block.md`
    - Use for code or configuration with syntax highlighting, line numbers, copy, download and several files in tabs. For Markdown text that contains code, use markdown.
- **Markdown**: `@koobiq/components/markdown`, `<kbq-markdown>` (needs `marked`). Reference: `node_modules/@koobiq/components/agent-docs/components/markdown.md`
    - Use to render Markdown text (headings, lists, tables, code) as styled HTML. For a code listing with copy and download, use code block.
- **Clamped text**: `@koobiq/components/clamped-text`, `<kbq-clamped-text>`. Reference: `node_modules/@koobiq/components/agent-docs/components/clamped-text.md`
    - Use for long text collapsed to `rows` lines (5 by default) with a control that expands it.
- **Clamped list**: `@koobiq/components/clamped-text`, `[kbqClampedList]`. Reference: `node_modules/@koobiq/components/agent-docs/components/clamped-list.md`
    - Use for a long list that shows its first items (10 by default) and expands to the rest.
- **Title**: `@koobiq/components/title`, `[kbq-title]`. Reference: `node_modules/@koobiq/components/agent-docs/components/title.md`
    - Use to show the full text in a tooltip only when it is truncated: headings, table cells, filter values, list options. Not for hints that must always show or contain controls (tooltip, popover).
- **Overflow items**: `@koobiq/components/overflow-items`, `[kbqOverflowItems]` with `[kbqOverflowItem]`. Reference: `node_modules/@koobiq/components/agent-docs/components/overflow-items.md`
    - Use to hide the items that do not fit the width (or height) of the container, for example a long list in a table cell.
- **Username**: `@koobiq/components/username`, `<kbq-username>`. Reference: `node_modules/@koobiq/components/agent-docs/components/username.md`
    - Use wherever the interface refers to an internal user of the system.

## Text entry and fields

Wrap text inputs, selects and pickers in `<kbq-form-field>`: it supplies the label, hint, error, cleaner, prefix and suffix.

- **Form field**: `@koobiq/components/form-field`, `<kbq-form-field>` with `<kbq-label>`, `<kbq-hint>`, `<kbq-error>`, `<kbq-cleaner>`, `kbqPrefix` and `kbqSuffix`. Reference: `node_modules/@koobiq/components/agent-docs/components/form-field.md`
    - Use around input, textarea, select, autocomplete, tag input, tag autocomplete, timepicker, timezone and tree select.
- **Input**: `@koobiq/components/input`, `input[kbqInput]`. Reference: `node_modules/@koobiq/components/agent-docs/components/input.md`
    - Use for single-line text; the docs add input masks to it with the Maskito library. For numbers use the number input, for passwords the password input, for multi-line text textarea.
- **Number input**: `@koobiq/components/input`, `input[kbqNumberInput]` with `<kbq-stepper>`. Reference: `node_modules/@koobiq/components/agent-docs/components/input.md`
    - Use for numbers only; thousands separators follow the locale, and `min`, `max` and `integer` restrict the value.
- **Password input**: `@koobiq/components/input`, `input[kbqInputPassword]` with `<kbq-password-toggle>` and `<kbq-password-hint>`. Reference: `node_modules/@koobiq/components/agent-docs/components/input.md`
    - Use for passwords, with a show/hide button and hints for the rules.
- **Textarea**: `@koobiq/components/textarea`, `textarea[kbqTextarea]`. Reference: `node_modules/@koobiq/components/agent-docs/components/textarea.md`
    - Use for multi-line text; `canGrow` fits the height to the content and `maxRows` limits it.
- **Search expandable**: `@koobiq/components/search-expandable`, `<kbq-search-expandable>`. Reference: `node_modules/@koobiq/components/agent-docs/components/search-expandable.md`
    - Use for a compact search that expands from an icon button, for example in a header; bind it with `[formControl]`, `formControlName` or `[(ngModel)]`, otherwise it throws. For an always visible search field use `input[kbqInput]` with a `kbqPrefix` icon and `<kbq-cleaner>`; to search options use the search of select or dropdown.
- **Filter bar**: `@koobiq/components/filter-bar`, `<kbq-filter-bar>`. Reference: `node_modules/@koobiq/components/agent-docs/components/filter-bar.md`
    - Use to filter a table or list by several parameters: filters with values from lists, trees, dates or text, text search and saved filters.
- **Inline edit**: `@koobiq/components/inline-edit`, `<kbq-inline-edit>`. Reference: `node_modules/@koobiq/components/agent-docs/components/inline-edit.md`
    - Use to change a few of many parameters in place, saved right after the change with no Save button.
    - Not inside regular forms, for creating entities, for complex validation (password, email, uniqueness, masks), dependent fields, critical data or saves that need confirmation; use a form in a modal, a popover or a separate page.
- **Datepicker**: `@koobiq/components/datepicker`, `input[kbqDatepicker]` with `<kbq-datepicker>`. Reference: `node_modules/@koobiq/components/agent-docs/components/datepicker.md`
    - Use for a date typed or picked in a calendar; a date range takes two such fields, as there is no range widget; add a timepicker for date and time. For preset periods such as the last 24 hours, use time range.
- **Timepicker**: `@koobiq/components/timepicker`, `input[kbqTimepicker]`. Reference: `node_modules/@koobiq/components/agent-docs/components/timepicker.md`
    - Use for a time of day only, in 24-hour format, with or without seconds.
- **Time range**: `@koobiq/components/time-range`, `<kbq-time-range>`. Reference: `node_modules/@koobiq/components/agent-docs/components/time-range.md`
    - Use for a period picked from presets or entered by hand, behind a trigger that can be a button, a field or a pseudo-link. Not for a single date (datepicker).
- **Timezone**: `@koobiq/components/timezone`, `<kbq-timezone-select>` with `<kbq-timezone-option>`. Reference: `node_modules/@koobiq/components/agent-docs/components/timezone.md`
    - Use for picking a time zone; it has the features of select except multiple selection.
- **File upload**: `@koobiq/components/file-upload`, `<kbq-single-file-upload>` or `<kbq-multiple-file-upload>`. Reference: `node_modules/@koobiq/components/agent-docs/components/file-upload.md`
    - Use to upload files or folders through the system dialog or drag and drop.

## Actions

A button performs an action, a link goes to a page, a pseudo-link performs an action inside running text.

- **Button**: `@koobiq/components/button`, `[kbq-button]` on a `button` or `a` element. Reference: `node_modules/@koobiq/components/agent-docs/components/button.md`
    - Use for actions, including buttons with a `[kbq-icon]` inside. Not for going to another page (link) or an action inside text (`[kbq-link]` with `pseudo`).
- **Icons**: `@koobiq/components/icon`, `[kbq-icon]`, `[kbq-icon-button]`, `[kbq-icon-item]`. References: `node_modules/@koobiq/components/agent-docs/components/icon.md`, `node_modules/@koobiq/components/agent-docs/components/icon-button.md`, `node_modules/@koobiq/components/agent-docs/components/icon-item.md`
    - Use `[kbq-icon]` for an icon, `[kbq-icon-button]` for a clickable icon such as the remove control of a tag, and `[kbq-icon-item]` for a backing icon that replaces an illustration.
- **Button group**: `@koobiq/components/button`, `<kbq-button-group>`. Reference: `node_modules/@koobiq/components/agent-docs/components/button-group.md`
    - Use to join buttons whose actions are closely related; a vertical group takes icon buttons only. Not for selecting a value (button toggle) or a primary action with related commands (split button).
- **Split button**: `@koobiq/components/split-button`, `<kbq-split-button>` holding a `[kbq-button]` and a `[kbqDropdownTriggerFor]` button. Reference: `node_modules/@koobiq/components/agent-docs/components/split-button.md`
    - Use only when one primary action covers most cases, such as Save, and the menu holds variations of it. Otherwise use a button menu: `[kbq-button]` with `[kbqDropdownTriggerFor]`.
- **Actions panel**: `@koobiq/components/actions-panel`, `KbqActionsPanel` provided in the component and opened with `open()`. Reference: `node_modules/@koobiq/components/agent-docs/components/actions-panel.md`
    - Use for bulk actions on selected objects, such as table rows. Page actions that do not depend on a selection belong in the top bar.

To confirm an action, it is often better to perform it and offer undo; otherwise use `[kbqPopoverConfirm]` on the trigger or `KbqModalService.confirm()`, never a toast.

## Panels and layout

Sidepanel and modal cover the page; the components below are part of the page layout.

- **Content panel**: `@koobiq/components/content-panel`, `<kbq-content-panel-container>` with `<kbq-content-panel>`. Reference: `node_modules/@koobiq/components/agent-docs/components/content-panel.md`
    - Use for a side panel that slides out and shifts the neighboring content, such as a quick preview of a table row. For a panel over the page, use sidepanel.
- **Sidebar**: `@koobiq/components/sidebar`, `<kbq-sidebar>`. Reference: `node_modules/@koobiq/components/agent-docs/components/sidebar.md`
    - Use for collapsible side content of the layout, with opened and closed content and the `[` and `]` shortcuts.
- **Splitter**: `@koobiq/components/splitter`, `<kbq-splitter>` with `<kbq-splitter-panel>`. Reference: `node_modules/@koobiq/components/agent-docs/components/splitter.md`
    - Use for neighboring panels resized by dragging the separator, with size limits, snapping, collapsing and nesting. To resize one element, use resizer.
- **Resizer**: `@koobiq/components/resizer`, `[kbqResizable]` with `[kbqResizer]`. Reference: `node_modules/@koobiq/components/agent-docs/components/resizer.md`
    - Use to let the pointer resize a single element in the given directions.
- **Accordion**: `@koobiq/components/accordion`, `<kbq-accordion>` with `<kbq-accordion-item>`. Reference: `node_modules/@koobiq/components/agent-docs/components/accordion.md`
    - Use for sections the user expands and collapses on demand; one section is open at a time by default.
