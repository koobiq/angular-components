A popover is a small non-modal dialog without dimming that opens next to a trigger element. It can contain text, input fields, and any other controls.

<!-- example(popover-common) -->

### States

#### Size

By default, the popover opens with a preset **Medium** width, but two additional sizes and the option to use a custom value are available.

<!-- example(popover-width) -->

Popovers with compact content open with reduced inner padding. Popovers of this size have no header or footer:

<!-- example(popover-small) -->

The height of the popover depends on its content. The recommended maximum height is 480px (may be increased at the designer's discretion).

<!-- example(popover-height) -->

#### Configuring padding

To flexibly control popover padding based on its content, reset the default values using `[defaultPaddings]="false"`. Then apply inner padding (padding) directly in the template of the content area:

<!-- example(popover-paddings) -->

#### Hiding the arrow

The arrow extending from the popover can be hidden, which allows the popover to be positioned closer to the trigger element.

<!-- cspell:ignore arrowless -->

<!-- example(popover-arrowless) -->

#### Offset

The popover has an additional `kbqPopoverOffset` parameter that controls the offset of the popover relative to the trigger element.

<!-- example(popover-arrow-and-offset) -->

#### Alignment

Consider the context in which the popover appears. Configure the alignment so that the popover does not obscure elements that may be needed.

##### Centered on the element

The arrow is positioned at the center of the popover and points to the middle of the trigger element.

<!-- example(popover-placement-center) -->

##### At the edge of the element

The popover aligns with the edge of the trigger element; the arrow is at a fixed distance from the edge of the popover. If the trigger element is too small, the arrow aligns with its center.

<!-- example(popover-placement-edges) -->

#### Behavior when scrolling the page

By default, the popover does not close when the page scrolls and scrolls along with the page, remaining at the position from which it was opened.

The popover can be configured to close when the page scrolls; which behavior to choose is up to the designer.

<!-- example(popover-scroll) -->

### Usage examples

The popover can be used without a header and footer — these are optional elements.

The size of the vertical inner padding in the content area depends on the presence of a header and footer. Without a header, the top padding increases. Without a footer, the bottom padding increases.

<!-- example(popover-header) -->

#### Title in the content area

The title can be moved to the content area instead of placing it in a separate header panel. This approach works well when there is no scrolling in the popover.

<!-- example(popover-content) -->

#### Close button in the top corner

The close button can be placed in the header or in the top right corner when there is no header panel. This is a way to eliminate a footer with a single "Close" button.

<!-- example(popover-close) -->

### Recommendations

When a short text without interactive elements needs to be shown in a popup, use a [tooltip](/en/components/tooltip).

A [Dropdown](/en/components/dropdown) is suitable for showing a list of commands. Dropdown does not support Tab navigation inside the dropdown menu. A popover, on the other hand, works like a modal window: when opened, it captures focus and navigates through the window's content.
