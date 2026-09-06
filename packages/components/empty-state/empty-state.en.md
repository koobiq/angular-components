A placeholder component for empty states or error messages. The border is not part of the component; it is shown only for illustration purposes.

<!-- example(empty-state-overview) -->

### Size

For full-screen placeholders, a block with larger-sized elements can be used.

<!-- example(empty-state-big) -->

### Size - variations

The component size is set using the `size` attribute.

<!-- example(empty-state-size) -->

### Align

Content can be aligned to the center or to the top. The `alignTop` attribute selects the top.

<!-- example(empty-state-align) -->

The component has no height of its own: it grows as a flex item, and in any other container it is exactly as tall as its content, which leaves both alignments looking the same. Give the component or its container a height — the examples here use `min-height` — for the alignment to have an effect.

### Error

The Empty State component can be used to display an error message. It is switched on with the `errorColor` attribute: the title and the text turn red, and an icon in the illustration slot is tinted with them.

<!-- example(empty-state-error) -->

### Content

#### Illustration

The illustration size can be changed. A large illustration is suitable for full-screen placeholders. If a placeholder is needed for just a specific block, the illustration can be made compact or omitted entirely.

<!-- example(empty-state-content) -->

In a center-aligned component with an illustration, an additional bottom offset is added, which raises the composition to provide optical compensation.

#### Icon

An icon can be used as the illustration.

<!-- example(empty-state-icon) -->

#### Title

<!-- example(empty-state-title) -->

#### Actions

One or more actions can be placed below the text: buttons, links, and pseudo-links.

<!-- example(empty-state-actions) -->

<!-- example(empty-state-actions2) -->

#### Text only

<!-- example(empty-state-text-only) -->

### Accessibility

The title is rendered with heading typography — `subheading` at the normal size, `headline` at the big one — so write it as a real heading of the level the surrounding page calls for, `<h2 kbq-empty-state-title>`, rather than as a `div`. The component zeroes the browser's own heading margin, so the spacing stays the same whichever element is used.

An empty state is usually inserted into a page that has already been read: after a search returns nothing, or after a request fails. Add `role="status"` on `<kbq-empty-state>` so that assistive technology announces it, or `role="alert"` for the error variant, which is announced more insistently.

The component adds no `role` of its own, because an empty state that is part of the page from the start — an initially empty list, say — has nothing to announce.
