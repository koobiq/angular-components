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

The accordion remembers which sections were expanded and restores the state after a page reload. On by default — use `[useStateSaving]="false"` to turn it off on a specific component.

<!-- example(accordion-state-saving) -->

Give the sections a `[value]`. Without one they are persisted by position, and inserting a section shifts everything after it into the wrong state.

A bound `[value]` wins over the persisted state, which wins over `defaultValue`. `clearSavedState()` removes what is stored.

Keys, storage and expiry work the same for every component that persists — see [Saving component state](/en/components/core/overview#saving-component-state).

### Usage Examples

#### Inside a Section

<!-- example(accordion-in-section) -->

#### Inside a Panel

<!-- example(accordion-in-panel) -->

### Recommendations

- Each accordion section should have a clear and informative title that accurately reflects its content. This helps users quickly find the necessary information.
- Accordion sections should be organized in a logical sequence, such as alphabetical order, hierarchical structure, or thematic grouping.
