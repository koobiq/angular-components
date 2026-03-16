Tooltip — a hint that appears on hover or focus. The tooltip closes when the cursor is moved away, focus is removed, or the page is scrolled.

<!-- example(tooltip-overview) -->

### Width

The tooltip size is determined by its content, but the component width cannot exceed 300px.

<!-- example(tooltip-width) -->

Sometimes it's more convenient if the text in the tooltip doesn't wrap and is displayed on a single line. For example, when comparing checksums, outputting email addresses, or file and folder paths. For such cases, don't limit the tooltip width.

<!-- example(tooltip-wide-width) -->

#### Style

<!-- example(tooltip-style) -->

#### Arrow

Add a pointer arrow when it can be confusing which element the hint relates to.

<!-- example(tooltip-arrow) -->

### Positioning

#### Relative to Element

In normal circumstances, the tooltip opens at the top centered. The position near the trigger element can be adjusted manually.

Choose a position where the tooltip won't cover content that the user will interact with next. For example, in a vertical list, open tooltips to the side so the hint doesn't interfere with viewing the neighboring element in the reading direction.

<!-- example(tooltip-placements) -->

#### Position Priority

If there isn't enough space to display the tooltip, it will open on the opposite side. The kbqPlacementPriority attribute helps configure fallback positions if they need to differ from the default order.

#### Near the Cursor

When configuring kbqRelativeToPointer="true", the tooltip is positioned relative to the cursor. This is often needed for long strings (checksums, email, paths) so the hint appears right at the cursor.

<!-- example(tooltip-relative-to-pointer) -->

### Offset

<!-- example(tooltip-offset) -->

### Delay

When hovering over an element, the tooltip appears with a 0.4 second delay and disappears instantly.

When switching focus or hovering over another element with a tooltip, the delay works as follows:

- The first tooltip appears with standard delay,
- Subsequent tooltips appear instantly,
- If the previous element's tooltip has disappeared and more than 2 seconds have passed, the 0.4 second delay applies again.

<!-- example(tooltip-hide-with-timeout) -->

### Usage Examples

#### Tooltip for Disabled Button

If a certain button or function is unavailable, the tooltip can explain why.

<!-- example(tooltip-disabled) -->

### Custom Hints

For special cases, you can change the tooltip dimensions and place more than just text inside it. Use the Contrast-fade style, which is similar to the application background, to ensure content contrast against the tooltip background.

<!-- example(tooltip-extended) -->

### Recommendations

- If you need to use interactive elements (buttons, links, etc.) inside the tooltip, use [Popover](/components/popover) instead.
- The Tooltip component is always preferable to the system one. Don't use both methods simultaneously in the same interface.
- For tooltips to work effectively, it's important to keep them brief and clear. Long explanations can be difficult to read and distracting, so it's best to avoid them.
- The tooltip height depends on the content. The recommended maximum height is 480px (may be increased at the designer's discretion).
