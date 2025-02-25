An accordion is an interactive UI element that allows users to expand individual sections of information on demand, organizing content into compact sections.

<div class="kbq-callout kbq-callout_theme">
<div class="kbq-callout__header">Note</div>
<div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">

For the component to work, the [`@radix-ng/primitives@^0.20.2`](https://github.com/radix-ng/primitives/tree/primitives%400.20.2) dependency is required:

```bash
npm install @radix-ng/primitives@^0.20.2
```

</div>
</div>

<!-- example(accordion-overview) -->

### States

#### Trigger Placement

By default, the trigger is positioned on the left side. If needed, it can be placed within the section header after the title or on the right side of the header.

<!-- example(accordion-states) -->

#### Section Expansion

By default, the accordion allows only one section to be expanded at a time, but it can be configured to allow multiple sections to be opened simultaneously.

<!-- example(accordion-sections) -->

#### Inactive Section

If necessary, a section can be disabled to prevent it from being expanded.

<!-- example(accordion-inactive-section) -->

#### Content

Content inside a section can be placed within the section header or in the content area.

##### Inside the Section Header

The section header can include an icon, description, left and right badges, and additional actions (using an Icon Button).

<!-- example(accordion-header) -->

##### Inside the Content Area

The content area can hold any type of content.

<!-- example(accordion-content) -->

### Usage Examples

#### Inside a Section

<!-- example(accordion-in-section) -->

#### Inside a Panel

<!-- example(accordion-in-panel) -->

### Recommendations

-   Each accordion section should have a clear and informative title that accurately reflects its content. This helps users quickly find the information they need.
-   Accordion sections should be organized in a logical order, such as alphabetical order, a hierarchical structure, or grouped by topic.
