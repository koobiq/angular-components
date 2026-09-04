An accordion is an interactive UI element that allows users to expand and collapse individual blocks of information on demand, organizing them into compact sections.

<!-- example(accordion-overview) -->

### States

#### Trigger Placement

By default, the trigger is positioned on the left side. If needed, it can be placed in the left part of the section header after the title or on the right side of the section header.

<!-- example(accordion-states) -->

#### Section Expansion

By default, the accordion allows only one section to be expanded at a time. However, it is possible to enable the expansion of all sections simultaneously.

<!-- example(accordion-sections) -->

#### Inactive Section

If necessary, a section can be disabled, preventing it from being expanded.

<!-- example(accordion-inactive-section) -->

#### Content Placement

The content inside a section can be placed within the section header or inside the content area.

##### Inside the Section Header

The section header can additionally include an icon, description, left and right badges, as well as extra actions (using an Icon Button).

<!-- example(accordion-header) -->

##### Inside the Content Area

This area can contain any type of content.

<!-- example(accordion-content) -->

##### Interactive Elements

Buttons, dropdown menus and form controls can be placed in the section header next to the trigger, as well as inside the content area. Place them **next to** the trigger, never inside it: the trigger is a `role="button"`, and nesting focusable elements in it breaks accessibility. Enter and Space toggle the section only while the trigger itself is focused.

<!-- example(accordion-interactive-elements) -->

### State Saving

The accordion remembers which sections were expanded and restores them on the next render. This is on by default — pass `[useStateSaving]="false"` for an accordion whose initial state the application owns.

<!-- example(accordion-state-saving) -->

The storage key comes from `stateSavingKey`. Without one it is derived from where the accordion sits in the document: the chain of tag names up to `<body>`, cut short by the first `id` on the way, which becomes the anchor. An accordion inside `<section id="settings">` persists under `#settings/kbq-accordion`, so everything above that `id` can be restructured without moving the key. Restructuring below it does move the key, and what was saved under the previous one is left behind until it expires — set `stateSavingKey`, or an `id`, wherever that matters.

Sections without an explicit `[value]` are persisted by position. Give them a `[value]` when the set of sections can change: inserting one ahead of another shifts every position after it, and the state is then restored into the wrong sections.

Only the values of expanded sections present in the current render are persisted: values no longer matching any section are dropped while restoring.

Precedence on init is a bound `[value]` > the persisted state > `defaultValue`. Once a state has been persisted, `defaultValue` no longer applies — including when the user collapsed every section. Use `clearSavedState()` to remove the persisted state.

The state is kept in `localStorage` under a `kbq.state.` prefix, and an entry that goes 90 days without being written or read is collected (`KBQ_STATE_SAVING_TTL`). To keep the state for the tab session only, provide `KbqSessionStorageStateStore`:

```ts
providers: [{ provide: KBQ_STATE_STORE, useExisting: KbqSessionStorageStateStore }];
```

A custom store — a backend, for instance — implements the `KbqStateStore` interface and is provided through the same token. Provided in the accordion's own `providers`, the replacement is scoped to that accordion instead of the whole application. When it is one of the browser storages, extend `KbqWebStorageStateStore` instead: it already guards against SSR, unavailable storage and unreadable payloads.

### Usage Examples

#### Inside a Section

<!-- example(accordion-in-section) -->

#### Inside a Panel

<!-- example(accordion-in-panel) -->

### Recommendations

- Each accordion section should have a clear and informative title that accurately reflects its content. This helps users quickly find the necessary information.
- Accordion sections should be organized in a logical sequence, such as alphabetical order, hierarchical structure, or thematic grouping.
