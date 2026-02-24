A tooltip is a hint that appears when hovering over or focusing on an interface element.
A tooltip cannot contain interactive elements.

### When to use

- For short explanatory text about interface elements.
- To display labels for icons that have no adjacent text.
- If text does not fit in the allocated space and is truncated with an ellipsis (for example, in table columns). In this case, the tooltip displays the full text.
- To show a hint with headings, lists, tables, etc.

### Component structure

#### Variations

A custom tooltip is always preferable to a system one. Do not use both system and custom tooltips in the same interface.

##### Simple

- Tooltip body with text
- Arrow pointer

The tooltip width depends on the content; maximum is 300 pixels.

The tooltip height depends on the content.

The tooltip text should remain very brief — ideally no more than 70 characters.

<div style="margin-top: 15px;">
    <img src="./assets/images/tooltip/tooltip__structure.png" alt="tooltip structure" style="max-width: 240px"/>
</div>

<br>

A tooltip can span more than one line:

<!-- example(tooltip-multiple-lines) -->

Sometimes it is more convenient for the tooltip text not to wrap but to be written in a single line — for example, when comparing hash sums, displaying email addresses, or file paths. For such cases, the maximum tooltip width can be left unset:

<!-- example(tooltip-long) -->

##### Extended

- Tooltip body
- Arrow pointer
- Header (optional)

Do not use interactive elements (buttons, links, etc.) in an extended tooltip — they are generally unusable. If interactive elements are needed, use a [popover](/en/components/popover).

<div style="margin-top: 5px;">
    <img src="./assets/images/tooltip/tooltip-hard__structure.jpg" alt="tooltip hard structure"/>
</div>

##### Sizes

Unlike a simple tooltip, an extended tooltip has a fixed width. To make optimal use of space, it is useful to design several width variants.

The tooltip height depends on the content. The recommended maximum height is 480px (may be increased at the designer's discretion).

### How it works

#### How to open

- Hover over the trigger element
- Focus

#### How to close

- Move the pointer away from the trigger element
- Remove focus
- Scroll the page
- Press Esc

#### Delay

- When hovering over an element, the tooltip appears with a 0.4 second delay.
- When switching focus or hovering over another element with a tooltip, the delay works as follows:
    - the first tooltip appears with a 0.4 second delay,
    - subsequent tooltips appear instantly,
    - if the tooltip from the previous element has disappeared and more than 2 seconds have passed, the 0.4 second delay applies again.
- The tooltip disappears instantly.

### Alignment

Consider the context in which the tooltip appears. Configure the alignment so that the tooltip does not obscure important content.

#### Centered on the element

The arrow is positioned at the center of the tooltip and points to the center of the trigger element.

<!-- example(tooltip-placement-center) -->

#### At the edge of the element

The edge of the tooltip aligns with the edge of the trigger element; the arrow is at a fixed distance from the tooltip edge.
If the element is too small, the arrow aligns with the center of the element.

<!-- example(tooltip-placement-edges) -->

#### Relative to the cursor

<!-- example(tooltip-relative-to-pointer) -->

**Dynamic alignment**

If there is not enough space for the tooltip, it will attempt to move to another position. For example, from "bottom center" to "top center".

### Tooltip styling

#### Simple tooltip

For the light theme, a dark tooltip is used. For the dark theme, a light tooltip is used.

A separate tooltip type is used for warnings. For example, it appears when the user tries to enter a forbidden character in a field (see [Validation](/en/other/validation) for details).

<!-- example(tooltip-overview) -->

#### Extended tooltip

In an extended tooltip, the opposite applies: for the light theme, a light tooltip is used, and for the dark theme, a dark tooltip is used.

The warning variant is not used.

<!-- example(tooltip-extended) -->

#### Style

<!-- example(tooltip-style) -->

#### Arrow and offset

<!-- example(tooltip-arrow-and-offset) -->

### Related components

[Dropdown](/en/components/dropdown) — a button menu that opens a list of available actions.

[Popover](/en/components/popover) — a small non-modal dialog without dimming that opens next to the trigger element. It can contain text, input fields, and any controls.
