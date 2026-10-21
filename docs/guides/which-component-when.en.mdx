# Which component when

Maps a **task** to a Koobiq component, and names the neighboring component it is confused with.

Written for the `which_component_when` tool of the Koobiq MCP server. An agent without this mapping picks the
component whose name looks like a word in the request — the frequent failure is not "found nothing" but "found the
neighbor": `autocomplete` for a multi-select, `toast` for a message that must be acknowledged, `tabs` for a form
control.

## How to read it

- [Disambiguation](#disambiguation) — the clusters where the neighbor is picked. The useful part; read it first.
- [Component index](#component-index) — one line per component, grouped by the job it does.
- [Keyword index](#keyword-index) — words a request is likely to use, mapped to the cluster to read.

Each disambiguation row answers three things: what to use, what not to use, and why not. "Why not" is the part an
agent cannot reconstruct from component names.

## Provenance

The component docs carry the usage prose for roughly a third of the library:

| Source                                                | What it actually holds                                                                                                                                                            |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/components/*/<id>.en.mdx` — intro paragraph | Present for every component. One sentence, says _what_ it is; _when_ only by implication                                                                                          |
| `### When to use`                                     | 7 components: `tree`, `modal`, `sidepanel`, `timepicker`, `loader-overlay`, `link`, `dynamic-translation`                                                                         |
| `### Recommendations` / `### Guidelines`              | 15 components: `accordion`, `badge`, `button-group`, `inline-edit`, `list`, `popover`, `radio`, `select`, `skeleton`, `split-button`, `tabs`, `tag`, `title`, `toggle`, `tooltip` |
| `modal.en.mdx` → `### Related components`             | The richest comparison text in the repo: modal against popover, sidepanel, inline forms, accordion, toast, a new page, undo                                                       |
| Cross-links in prose                                  | Scattered "use X instead": `list` → `select`/`tree`, `title` → `tooltip`/`popover`, `tag` → `badge`, `tabs` → `navbar`                                                            |
| `*.ru.mdx`                                            | A faithful mirror of the English pages — same sections, same count. No extra guidance to mine                                                                                     |
| `packages/docs-examples/**` `@title`                  | 623 titles, but they name features ("Select multiple"), not tasks. Usable as keywords only                                                                                        |
| `apps/docs/src/llms.txt`, `llms-full.txt`             | A link index and the same MDX text. No formulations of their own                                                                                                                  |

Everything else below — the clusters, the "why not", the per-component lines for the ~50 components that document
only what they are — was written for this guide from the docs, the public API and the component code. Keep it here
rather than scattering it back into the MDX pages: the comparisons cross component boundaries, and a page about one
component is the wrong place to say which other component wins.

The MCP server reads this file as an ordinary guide: `build-guides.ts` picks it up from `docs/guides` along with
the rest, in both languages. This file is the single source of truth — the server holds no copy of the mapping.

## Disambiguation

### Pick a value from a set

| Task                                                         | Use                                             | Not                   | Why not                                                                         |
| ------------------------------------------------------------ | ----------------------------------------------- | --------------------- | ------------------------------------------------------------------------------- |
| One value from a closed list, in a form                      | `select`                                        | `autocomplete`        | Autocomplete is a text field that suggests; it accepts what the user types      |
| Several values from a closed list                            | `select` + `multiple`                           | `autocomplete`        | Autocomplete has no `multiple` input at all                                     |
| Several values from a long list (hundreds)                   | `select` + `multiple` + search + virtual scroll | `tree-select`         | Tree select is for data that _is_ a hierarchy, not for data that is merely long |
| Several values from a hierarchy                              | `tree-select` + `multiple`                      | `select`              | Select flattens: the parent-child relation is lost                              |
| One value, list comes from a server query as the user types  | `autocomplete`                                  | `select`              | Select owns its option list; it has no text input to drive a query              |
| Several values, user may enter values outside the dictionary | `tag-autocomplete`                              | `select` + `multiple` | Select cannot accept a value that is not an option                              |
| Several free-form values, no dictionary                      | `tag-input`                                     | `tag-autocomplete`    | Autocomplete's dropdown with nothing to suggest is noise                        |
| Show and remove values chosen elsewhere                      | `tag-list`                                      | `tag-input`           | Tag input also _enters_ values; a read-only set does not need that              |
| 2–7 exclusive options, all visible                           | `radio`                                         | `select`              | Hiding a handful of options behind a trigger costs a click for nothing          |
| More than 7 exclusive options                                | `select`                                        | `radio`               | Docs cap a radio group at ~7 rows                                               |
| 3–5 exclusive options, short labels, room in a row           | `button-toggle`                                 | `radio`, `tabs`       | Radio spends a row per option; tabs switch content and are not a form control   |
| Independent on/off options, saved with the form              | `checkbox`                                      | `toggle`              | A toggle promises the change already took effect                                |
| One setting that applies instantly                           | `toggle`                                        | `checkbox`            | A checkbox implies a later Save                                                 |
| Partially selected group header                              | `checkbox` + `indeterminate`                    | two checkboxes        | The third state is built in                                                     |
| Select rows of page content, not a form value                | `list` + `multiple="checkbox"`                  | `select`              | Select is a form control behind a trigger; a list is content                    |
| Hundreds of items in a hierarchy                             | `tree`                                          | `list`                | Docs: without hierarchy and volume, a plain list is better                      |
| A menu of commands                                           | `dropdown`                                      | `select`              | Select holds a value; a dropdown runs actions                                   |

For the long multi-select: project `[kbqSelectSearch]` into the panel (docs recommend search past 10 options) and
wrap the options in `cdk-virtual-scroll-viewport`. With object values, supply `virtualOptionFactory` so the trigger
can label a value whose option is not rendered. The "select all" row is not rendered together with virtual scroll —
it can only act on options currently rendered.

### Show that something is in progress

| Task                                                        | Use                                  | Not                  | Why not                                                                       |
| ----------------------------------------------------------- | ------------------------------------ | -------------------- | ----------------------------------------------------------------------------- |
| Share of the work is known and worth showing                | `progress-bar`                       | `progress-spinner`   | A spinner cannot show how much is left; put the remaining time beside the bar |
| Duration unknown, short wait, little room, a single element | `progress-spinner`                   | `progress-bar`       | A bar with `indeterminate` claims a width it does not have                    |
| A whole block is busy and must not be touched               | `loader-overlay`                     | `progress-spinner`   | A bare spinner does not stop interaction with the block underneath            |
| Page or section content loading, 2–10 s                     | `skeleton`                           | `progress-spinner`   | Docs: skeletons suit full-page loading and keep the layout from jumping       |
| Loading takes under 1 s                                     | nothing                              | `skeleton`           | Docs: no indicator is needed below a second                                   |
| A button's own action takes over 1–2 s                      | `class="kbq-progress"` on the button | `loader-overlay`     | Overlaying the page for one button is out of proportion                       |
| A long file upload                                          | `file-upload` (own progress)         | `progress-bar` alone | The component already reports per-file state                                  |

### Tell the user something

| Task                                                       | Use                                      | Not                   | Why not                                                                                   |
| ---------------------------------------------------------- | ---------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------- |
| An error the user must acknowledge before continuing       | `modal`                                  | `toast`, `alert`      | A toast is allowed to be missed; an alert sits in the page and does not block             |
| Result of an operation, no response needed, may be missed  | `toast`                                  | `modal`               | Docs: avoid modality unless an answer is required                                         |
| A standing status or problem tied to a page region         | `alert`                                  | `toast`               | A toast disappears; a reported problem has to stay (a non-closable alert)                 |
| A message the user should be able to re-read later         | `notification-center`                    | `toast`               | A toast leaves no trace — pair the two when both matter                                   |
| "Are you sure?" before a destructive action                | do it, offer undo                        | `modal`               | Docs name the undo pattern as the preferred one; keep the modal for the irreversible case |
| A short text hint                                          | `tooltip`                                | `popover`             | A popover takes focus and expects interaction                                             |
| Full text, but only when it is truncated                   | `kbq-title`                              | `tooltip`             | A plain tooltip fires even when the text fits                                             |
| Content with controls or links beside a trigger            | `popover`                                | `tooltip`, `dropdown` | A tooltip holds no controls; a dropdown has no Tab navigation inside                      |
| Nothing to show: no data, no search results, a failed load | `empty-state`                            | `alert`               | An alert annotates content; here there is no content                                      |
| Validation errors of one field                             | `form-field` hints + `ErrorStateMatcher` | `alert`               | The matcher decides _when_ errors surface; the field renders them                         |

### An extra layer over the page

| Task                                           | Use             | Not         | Why not                                                                       |
| ---------------------------------------------- | --------------- | ----------- | ----------------------------------------------------------------------------- |
| Short blocking task, a small form, settings    | `modal`         | `sidepanel` | Narrow and tall content reads badly in a modal; wide content badly in a panel |
| A lot of data, tall narrow content, stacking   | `sidepanel`     | `modal`     | Docs: modals should not be stacked; non-modal sidepanels stack                |
| Preview a row while the table stays usable     | `content-panel` | `sidepanel` | A content panel shifts adjacent content instead of covering it                |
| A permanent collapsible region of the layout   | `sidebar`       | `sidepanel` | A sidepanel is a transient window, not part of the layout                     |
| Two regions the user resizes                   | `splitter`      | `resizer`   | The resizer directive resizes one element, with no neighbor logic             |
| One element resizable by drag                  | `resizer`       | `splitter`  | A splitter owns the layout of the panels inside it                            |
| A small dialog by a trigger, page stays usable | `popover`       | `modal`     | Docs: a popover claims attention less disruptively                            |
| Commands by a trigger                          | `dropdown`      | `popover`   | A popover captures focus; a command menu does not need to                     |
| Bulk actions over selected rows                | `actions-panel` | `top-bar`   | The panel appears with the selection and counts it                            |

### Text that does not fit

| Task                                                 | Use               | Not              | Why not                                                        |
| ---------------------------------------------------- | ----------------- | ---------------- | -------------------------------------------------------------- |
| One line cut at the end, full text on hover when cut | `kbq-title`       | `tooltip`        | Only `kbq-title` keeps quiet while the text fits               |
| One line where the start and the end both matter     | `ellipsis-center` | `kbq-title`      | Paths, hashes and file names lose their meaning cut at the end |
| Multi-line text collapsed to N lines, with expansion | `clamped-text`    | CSS `line-clamp` | The component owns the trigger, its a11y and the locale text   |
| A list collapsed to N items, with expansion          | `clamped-list`    | `overflow-items` | A clamped list counts items; overflow items measure width      |
| A row of items collapsed to the container width      | `overflow-items`  | `clamped-list`   | The limit here is pixels, and it changes as the box resizes    |

### Tabular and structured data

| Task                                               | Use                                            | Not                 | Why not                                                      |
| -------------------------------------------------- | ---------------------------------------------- | ------------------- | ------------------------------------------------------------ |
| A static table, no sorting, no column resizing     | `table`                                        | AG Grid             | A data grid is a large dependency for plain rows             |
| Sorting, column resize and reorder, virtual scroll | AG Grid (`docs/data-grid`)                     | `table`             | Docs: the table offers only what native HTML tables do       |
| Attributes of one entity, term → value             | `dl`                                           | `table`             | A two-column table has to re-implement the responsive layout |
| Filtering a table or a list, with saved filters    | `filter-bar`                                   | `select` per column | The filter bar owns pipes, search, saving and state restore  |
| Highlight why a row matched                        | `kbqHighlightBackground` / `mcHighlight` pipes | manual markup       | The pipes wrap matches in `<mark>` with the right class      |
| Items the user picks from                          | `list`                                         | `table`             | A table row is not a selection control                       |

### Navigation

| Task                                               | Use             | Not            | Why not                                                         |
| -------------------------------------------------- | --------------- | -------------- | --------------------------------------------------------------- |
| Main product navigation                            | `navbar`        | `tabs`         | Docs name tabs for in-page navigation only                      |
| A toolbar that stays visible: title, actions       | `top-bar`       | `navbar`       | The navbar is product-level; the top bar belongs to the screen  |
| Where the user is in a hierarchy                   | `breadcrumbs`   | `top-bar` text | Breadcrumbs navigate and collapse under `max`                   |
| Switch between groups of content on one page       | `tabs`          | `accordion`    | Tabs show one group at a time; an accordion can show several    |
| Switch the view of the same data (list/tile/table) | `button-toggle` | `tabs`         | Docs list this as a misuse of tabs                              |
| Reveal extra content in place                      | `accordion`     | `modal`        | Docs: an accordion or "show more" is the least intrusive option |
| Between applications and platforms                 | `app-switcher`  | `dropdown`     | The switcher is the agreed pattern and shape for this           |
| Go to another page, or a button inside a sentence  | `link`          | `button`       | For a button in running text, use the pseudo-link variant       |

### Editing existing data

| Task                                               | Use                     | Not                     | Why not                                                            |
| -------------------------------------------------- | ----------------------- | ----------------------- | ------------------------------------------------------------------ |
| Change one or two fields among many, saved at once | `inline-edit`           | a form                  | Docs: inline edit saves on change, without a global Save           |
| Create a new entity                                | a form (`form-field`)   | `inline-edit`           | Docs rule out inline edit for creation                             |
| Fields that validate each other, masks, prompts    | a form                  | `inline-edit`           | Docs rule out inline edit for dependent or complex validation      |
| Critical data, or a save that needs confirmation   | `modal` with a form     | `inline-edit`           | Docs rule out inline edit here too                                 |
| Pick a date                                        | `datepicker`            | `input`                 | Masking, parsing and calendar come with the component              |
| Pick a date range                                  | two `datepicker` inputs | one datepicker          | There is no range widget; bind `minDate`/`maxDate` and `min`/`max` |
| Pick a time                                        | `timepicker`            | `input`                 | Same reason as the datepicker                                      |
| Pick a period ("last 24 hours", or a manual range) | `time-range`            | two `timepicker` fields | The menu carries the presets                                       |
| Pick a timezone                                    | `timezone`              | `select`                | It extends select with the timezone option template                |
| Upload files                                       | `file-upload`           | `input[file]`           | Drag area, size, errors and the list come with it                  |
| A search field that should stay small until used   | `search-expandable`     | `input`                 | It collapses into an icon button; bind it to a form control        |

### Labels, marks, identity

| Task                                              | Use           | Not        | Why not                                                     |
| ------------------------------------------------- | ------------- | ---------- | ----------------------------------------------------------- |
| A status or count label in a table or a list      | `badge`       | `tag`      | Docs: tags belong inside input controls, badges stand alone |
| A token for a value chosen in a control           | `tag`         | `badge`    | Same rule, read the other way                               |
| A country                                         | `flag`        | `icon`     | The flag shapes and crops whatever image you pass           |
| A decorative icon with a backing, in place of art | `icon-item`   | `icon`     | The backing is what draws the eye                           |
| A clickable icon                                  | `icon-button` | `icon`     | The button carries the hit area, states and focus ring      |
| An internal system user                           | `username`    | plain text | The pattern fixes which attributes identify a person        |

## Component index

One line each: when to reach for it. `→` names the neighbor to prefer in the case that follows.

### Choosing values

- `select` — one or more values from a list the application owns; search past 10 options, virtual scroll for long lists. → `autocomplete` when the value is typed, `tree-select` when the data is a hierarchy.
- `tree-select` — one or more values from hierarchical data, with the tree kept visible while searching.
- `autocomplete` — a text field that suggests matches while typing, including server-driven suggestions; single value.
- `tag-autocomplete` — several values from a dictionary, with custom values allowed; the dropdown is an autocomplete panel.
- `tag-input` — several free-form values entered as tags.
- `tag-list` — a set of tags with keyboard navigation, selection and removal; no entry of its own.
- `tag` — one token inside an input control. → `badge` for a standalone label.
- `list` — related items as page content, single or multiple (`multiple="checkbox"` when the state must be visible at a glance); virtual scroll for long lists, but not together with dragging.
- `tree` — hundreds of items the user navigates as a catalog. → `list` without hierarchy or volume.
- `radio` — up to ~7 mutually exclusive options, all visible.
- `checkbox` — independent options, and the group state via `indeterminate`.
- `toggle` — a binary setting that applies immediately, with no Save.
- `button-toggle` — 3–5 short exclusive options in one row, in a form or a filter.
- `dropdown` — a menu of actions or options beside a trigger, with disabled, loading and footer states.
- `timezone` — timezone selection; `kbq-select` with a timezone option template, no multiple selection.
- `time-range` — a period: a preset, or boundaries entered by hand.

### Data entry

- `form-field` — the wrapper that gives a control its label, hint, error and cleaner; input, select, textarea, autocomplete, tag input, tag autocomplete, timepicker, timezone and tree select are built to sit inside it.
- `input` — text, number and password entry with formatting, masks and validation.
- `textarea` — multi-line text.
- `datepicker` — a date, typed or picked from the calendar; `minDate`/`maxDate` bound the calendar, `min`/`max` on the input drive validation.
- `timepicker` — a time, typed into a masked field.
- `file-upload` — files, single or multiple, with a drop area, sizes, icons and per-file errors.
- `search-expandable` — a search field that expands from an icon button; it is a form control and throws without one.
- `inline-edit` — edit a value where it is displayed, saving at once. → a form for creation, dependent fields, complex validation or critical data.
- `filter-bar` — filtering a table or a list: typed pipes, search inside pipes, required and locked filters, saved filters, state restore.

### Actions

- `button` — an action, on a native `<button>` or `<a>`; `kbq-progress` for actions over 1–2 s.
- `icon-button` — an action that needs no label.
- `button-group` — buttons that belong together, styled as one control. → `split-button` for a main action plus variants, `button-toggle` to choose a value.
- `split-button` — one dominant action plus a menu of its variants. Only when a single action covers most of the use; otherwise a `dropdown`.
- `actions-panel` — a panel of bulk actions over the current selection, with the count.
- `link` — navigation between pages; the pseudo-link variant for a button inside running text.

### Feedback and status

- `alert` — a standing message in the page: a hint, a status change, a problem. Non-closable when the system reports the problem.
- `toast` — a transient message in the corner, for when no answer is required and missing it is acceptable.
- `modal` — a window that blocks the page, for a short task or an answer the system is waiting for. → `popover`, `sidepanel`, an inline form or undo wherever modality is avoidable.
- `notification-center` — the list of application notifications, opened from the navbar, grouped by date with an unread counter.
- `empty-state` — a placeholder where content, results or a successful load are missing.
- `progress-bar` — a measurable share of a long process, ideally with the remaining time beside it.
- `progress-spinner` — an unquantified or short wait, or one element loading.
- `loader-overlay` — a block that is busy, with interaction suppressed.
- `skeleton` — the shape of content that is loading for 2–10 s, so the layout does not jump.
- `badge` — a status, count or characteristic of an object, on its own.

### Overlays

- `popover` — a non-modal dialog by a trigger that may hold inputs and buttons; it captures focus and supports Tab inside.
- `tooltip` — a short hint on hover or focus, text only.
- `kbq-title` — the same tooltip, but only when the element's text is actually truncated.
- `sidepanel` — a window sliding from the edge over the page, modal or non-modal; non-modal panels stack with an offset. For a lot of data in a tall layout.
- `content-panel` — a panel that slides in and shifts the adjacent content, typically a quick preview of a table row.
- `dropdown` — see Choosing values.

### Layout and structure

- `sidebar` — collapsible side content that is part of the layout, with its state saved.
- `splitter` — neighboring panels resized by dragging the separator, with constraints, snapping and collapsing.
- `resizer` — a directive that resizes one element in a given direction by dragging.
- `divider` — a separator line, horizontal or vertical.
- `accordion` — blocks of content the user expands on demand, in a logical order and with titles that say what is inside.
- `tabs` — groups of content on one page, switched without a reload. → `navbar` for main navigation, `button-toggle` or `dropdown` to switch the view of the same data, `radio`/`button-toggle` in forms.
- `scrollbar` — a styled scrollbar (`hover`, `always`, `native`, `hidden`), programmatic scrolling and scroll events; `kbqScrollbarViewport` for a `cdk-virtual-scroll-viewport`, `kbqNativeScrollbar` to restyle the browser's own.
- `overflow-items` — a row of items that collapses to the container width, from the end or from the start.
- `clamped-text` — long text collapsed to a number of lines, with an expand trigger.
- `clamped-list` — a long list collapsed to a number of items, with an expand trigger.
- `ellipsis-center` — a single line truncated in the middle, keeping the start and the end readable.
- `layout-flex` — CSS classes for arranging, aligning and ordering flex children.

### Navigation

- `navbar` — the product's main menu, top or left, with room for the app switcher, the main action, the notification center and search.
- `top-bar` — a toolbar that stays visible on the screen: logo, title, breadcrumbs, actions.
- `breadcrumbs` — the path to the current page, collapsing into a dropdown under `max`; every item needs a `routerLink`.
- `app-switcher` — switching between applications and platforms.

### Data display

- `table` — a plain HTML table with Koobiq styling, sticky header and border options; no sorting, no column resizing. → AG Grid for either.
- `dl` — term and description pairs, adaptive, horizontal or vertical, optionally with resizable columns.
- `username` — the attributes that identify an internal system user.
- `flag` — a country flag, shaped and cropped from the image you project or pass as `svg`.
- `icon` — an icon from the `@koobiq/icons` font.
- `icon-item` — an icon on a backing, where graphics should draw attention instead of an illustration.

### Content rendering

- `markdown` — a Markdown string rendered as HTML; needs `marked`.
- `code-block` — source code with syntax highlighting; needs `highlight.js@^11`.
- `dynamic-translation` — components, links and styled fragments embedded into an already-translated string.
- `kbqHighlightBackground` / `mcHighlight` pipes — the matched substring marked up in a result, as a background or in bold.

### Not components

- `core` — the shared entry point: behaviors, a11y, keycodes, locales, overlay helpers, selection models, theming, formatters, validators and the test helpers.
- `DateFormatter` — dates and times in the corporate format, following the active locale.
- Number and file-size formatters — numbers and byte sizes in the conventions of the current locale.
- `ErrorStateMatcher` — the policy that decides _when_ a control shows the errors it already has.
- Forms layout utilities — arranging fields, labels, hints and messages in horizontal, vertical or grouped layouts.
- Typography and theming — the font scale and the token-driven themes; see the theming guide.

## Keyword index

Words a request is likely to use → the cluster that settles it.

- multiselect, multiple, chips, tokens, 500 options, long list, virtual scroll → Pick a value from a set
- search field, suggest, type-ahead, dictionary, free value → Pick a value from a set
- on/off, switch, instant setting, checkbox group, partially selected → Pick a value from a set
- loading, spinner, percent, remaining time, placeholder, skeleton, busy block → Show that something is in progress
- error, warning, success, acknowledge, confirm, "are you sure", notify, missed message, history of messages → Tell the user something
- empty, no data, no results, nothing found, failed to load → Tell the user something
- dialog, window, drawer, panel, preview, blocks the page, stacking → An extra layer over the page
- hint, hover, truncated, ellipsis, three dots, "show more", collapse, fit the width → Text that does not fit and Tell the user something
- table, grid, sort, resize columns, key-value, attributes, filters, highlight matches → Tabular and structured data
- menu, main navigation, toolbar, breadcrumbs, tabs, sections, switch view, another app → Navigation
- edit in place, pencil, save immediately, form, date, time, period, timezone, upload → Editing existing data
- label, status, count, country, avatar, user, clickable icon → Labels, marks, identity
