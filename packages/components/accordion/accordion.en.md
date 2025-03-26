An accordion is an interactive UI element that allows users to expand and collapse individual blocks of information on demand, organizing them into compact sections.

<div class="kbq-callout kbq-callout_theme">
<div class="kbq-callout__header">Pay Attention</div>
<div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">

For the component to work, the following dependency is required: [`@radix-ng/primitives@0.23.0`](https://github.com/radix-ng/primitives/tree/primitives%400.23.0)

```bash
npm install @radix-ng/primitives@0.23.0
```

</div>
</div>

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

### Usage Examples

#### Inside a Section

<!-- example(accordion-in-section) -->

#### Inside a Panel

<!-- example(accordion-in-panel) -->

### Recommendations

-   Each accordion section should have a clear and informative title that accurately reflects its content. This helps users quickly find the necessary information.
-   Accordion sections should be organized in a logical sequence, such as alphabetical order, hierarchical structure, or thematic grouping.
