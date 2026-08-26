A popover is a small non-modal dialog without dimming that opens next to a trigger element. It can contain text, input fields, and any other controls.

<!-- example(popover-overview) -->

### States

#### Size

By default, the popover opens with a preset **Medium** width, but two additional sizes and the option to use a custom value are available.

<!-- example(popover-width) -->

Popovers with compact content open with reduced inner padding. Popovers of this size have no header or footer:

<!-- example(popover-small) -->

The height of the popover depends on its content. The recommended maximum height is 480px (may be increased at the designer's discretion).

<!-- example(popover-height) -->

#### Configuring padding

To flexibly control popover padding based on its content, reset the default values using `[kbqPopoverDefaultPaddings]="false"`. Then apply inner padding (padding) directly in the template of the content area:

<!-- example(popover-paddings) -->

The default padding also keeps the focus outline of the first field in the content area from being clipped by the panel, which hides its overflow. After resetting it, reserve that space in your own padding.

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

The behavior is controlled by `kbqPopoverCloseOnScroll`, which has three states. Left unbound, the popover survives a scroll but still closes once it has scrolled out of a container marked with the `kbq-hide-nested-popup` class. Set to `true`, it closes on any scroll. Set to `false`, it never closes on a scroll — not even in such a container.

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

#### Confirming an action

`[kbqPopoverConfirm]` is a ready-made variant of the popover that asks the user to confirm an action. It has neither a header nor a footer: the panel holds the question and a single confirming button, emits `confirm` when that button is pressed, and closes itself.

```html
<button kbq-button kbqPopoverConfirm (confirm)="deleteReport()">Delete</button>
```

Both strings are optional and can be set per trigger:

```html
<button
    kbq-button
    kbqPopoverConfirm
    kbqPopoverConfirmText="Delete the report?"
    kbqPopoverConfirmButtonText="Delete"
    (confirm)="deleteReport()"
>
    Delete
</button>
```

Left unbound, the question and the button caption come from the `popoverConfirm` section of the active locale, so an application that switched its locale gets the translated wording without configuring anything. To override the wording for a whole application — or for any part of it — provide `KBQ_POPOVER_CONFIRM_TEXT` and `KBQ_POPOVER_CONFIRM_BUTTON_TEXT`: an input beats the provider, and the provider beats the locale.

### Opening and closing

By default the popover opens on a click and on `Enter`/`Space`, and closes on a click outside it, on `Esc`, or through the close button. Other triggers are selected with `kbqTrigger`: `hover`, `focus`, `manual`, or a comma-separated combination of them.

`kbqEnterDelay` and `kbqLeaveDelay` set the delays before opening and closing, in milliseconds. Both default to `0`, with one exception: a popover whose trigger includes `hover` closes after 500 ms unless `kbqLeaveDelay` is bound explicitly, which keeps the panel reachable while the pointer travels towards it. Bind `kbqLeaveDelay="0"` to opt out.

`kbqTrigger`, `kbqEnterDelay` and `kbqLeaveDelay` are shared with the [tooltip](/en/components/tooltip) directive, so binding them on an element that carries both reconfigures both.

### Layering

By default, the popover appears above the horizontal [Navbar](/en/components/navbar) and [Topbar](/en/components/topbar), and above adjacent elements in other cases.

To prevent the popover from overlapping a required element during scrolling and instead have it hidden beneath it, adjust its position using a custom z-index or offset parameters.

<!-- example(popover-scrolling-and-layering) -->

### Accessibility

The panel is exposed as a dialog and is labelled by its header. A popover without a header has nothing to take its name from, so give it one with `kbqPopoverAriaLabel`: until the panel has a name it is not announced as a dialog at all, because an unnamed dialog tells the user nothing.

Opening the popover by click, by keyboard or programmatically moves focus into the panel and keeps it there while it is open; every closing path returns focus to the trigger. A popover opened by hover or focus does not take focus, because it is dismissed by the pointer leaving it.

### Recommendations

When a short text without interactive elements needs to be shown in a popup, use a [tooltip](/en/components/tooltip).

A [Dropdown](/en/components/dropdown) is suitable for showing a list of commands. Dropdown does not support Tab navigation inside the dropdown menu. A popover, on the other hand, works like a modal window: when opened, it captures focus and navigates through the window's content.
