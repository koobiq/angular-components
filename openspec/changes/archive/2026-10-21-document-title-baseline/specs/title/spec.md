# Spec Delta

## Purpose

Describes what the `kbq-title` directive from `@koobiq/components/title` guarantees to consumers: it shows a tooltip with the full text of an element only while that text is truncated, decides truncation from the elements it measures, follows changes of the content and the container size, and opens on hover and keyboard focus.

## ADDED Requirements

### Requirement: Attribute directive with a template reference

The directive SHALL attach to any element that carries the `kbq-title` attribute. It SHALL be standalone, SHALL be re-exported by `KbqTitleModule`, and SHALL be reachable from a template reference through `exportAs` `kbqTitle`, which exposes the `isOverflown` and `viewValue` getters and the tooltip trigger it extends.

#### Scenario: Reading the directive from a template reference

- **WHEN** a template declares `<div kbq-title #title="kbqTitle">Hello World</div>`
- **THEN** `title.viewValue` is `'Hello World'`
- **AND** `title.isOverflown` reports whether that text is truncated

### Requirement: Hover opens the tooltip over truncated text

When the pointer enters the host and the measured text is wider than its container, the directive SHALL open a tooltip after the tooltip enter delay, 400 ms unless `kbqEnterDelay` says otherwise.

#### Scenario: Truncated text is hovered

- **WHEN** the user hovers a host whose text is cut with an ellipsis
- **THEN** a tooltip opens and contains the full text of the host

### Requirement: Pointer leave closes the tooltip

When the pointer leaves the host, the directive SHALL close an open tooltip and keep it closed until the next hover or keyboard focus finds the text truncated again.

#### Scenario: Pointer leaves the host

- **WHEN** the tooltip of a truncated host is open and the pointer leaves the host
- **THEN** the tooltip closes

### Requirement: No tooltip for text that fits

When the measured text fits its container in both directions, hovering or keyboard-focusing the host MUST NOT open a tooltip.

#### Scenario: Short text in a wide container

- **WHEN** the user hovers a 400 px wide host that shows `Short`
- **THEN** no tooltip opens, even after the enter delay has passed

#### Scenario: Short text with template references

- **WHEN** the `#kbqTitleText` element is narrower than its `#kbqTitleContainer` and the user hovers the host
- **THEN** no tooltip opens

### Requirement: Vertical overflow counts as truncation

Text whose scroll height exceeds the height of its container, such as text clamped to a number of lines with `-webkit-line-clamp`, SHALL count as truncated, so hovering the host opens the tooltip.

#### Scenario: Text clamped to two lines

- **WHEN** a host clamps a long text to two lines and the user hovers it
- **THEN** the tooltip opens

### Requirement: Sub-pixel overflow counts only when it is visible

When the whole-pixel measurements show no overflow, because the text's scroll width equals the container's width or is zero and nothing overflows vertically, the directive SHALL compare the fractional widths of text and container. With `text-overflow: ellipsis` on the text element or on the container, any positive difference SHALL count as truncation. Otherwise both widths SHALL be rounded to whole pixels first, so a clip that rounds away MUST NOT count.

#### Scenario: Sub-pixel clip without an ellipsis

- **WHEN** a host with `text-overflow: clip` is 124 px wide and its text needs 124.4 px
- **THEN** the text does not count as truncated and hovering opens no tooltip

#### Scenario: Sub-pixel overflow with an ellipsis

- **WHEN** a host with `text-overflow: ellipsis` is 124 px wide and its text needs 124.4 px
- **THEN** the text counts as truncated and hovering opens the tooltip

#### Scenario: Ellipsis set on the container only

- **WHEN** the `#kbqTitleContainer` has `text-overflow: ellipsis`, the `#kbqTitleText` element keeps `clip`, and the text is 0.4 px wider than the container
- **THEN** the text counts as truncated

#### Scenario: Widths that round to different pixels

- **WHEN** `text-overflow` is `clip`, the container is 124 px wide and the text needs 124.5 px or more
- **THEN** the text counts as truncated

### Requirement: Measurement leaves the DOM unchanged

To measure text that is the only child node of the host, the directive temporarily adds an element to the container. It MUST remove that element before the measurement returns, also when measuring throws, so the consumer's DOM is the same before and after.

#### Scenario: Measuring a plain-text host

- **WHEN** the user hovers a host that holds only a text node and whose text fits
- **THEN** the host has the same child nodes afterwards as before

### Requirement: Template references select the measured elements

The directive SHALL measure the element marked `#kbqTitleContainer` in the host's content as the container, and the elements marked `#kbqTitleText`, at any depth, as the text. Without these references it SHALL measure the host element itself as both container and text.

#### Scenario: Container and text references

- **WHEN** the host contains `<div #kbqTitleContainer><div #kbqTitleText>{{ value }}</div></div>`
- **THEN** the text element is measured against the container element

#### Scenario: Bare host

- **WHEN** the host has no `#kbqTitleContainer` and no `#kbqTitleText`
- **THEN** the host element is measured against itself

### Requirement: Any of several text elements can trigger the tooltip

With several `#kbqTitleText` elements, the text SHALL count as truncated when any one of them overflows the container, and MUST NOT count as truncated when all of them fit.

#### Scenario: One of two elements overflows

- **WHEN** a name and a value are both marked `#kbqTitleText` and only the value overflows the container
- **THEN** the text counts as truncated and hovering opens the tooltip

#### Scenario: Every element fits

- **WHEN** both elements fit the container
- **THEN** the text does not count as truncated

### Requirement: Text clipped by its siblings counts as truncated

With more than one text element, an element whose own box is narrower than its content SHALL count as truncated even when its full text would fit the container on its own. An element whose client width is zero, such as an inline element, MUST NOT count as clipped by this rule.

#### Scenario: Value squeezed by the name next to it

- **WHEN** the container is 296 px wide, the value needs 255 px, and the name leaves the value a 237 px box
- **THEN** the text counts as truncated and hovering opens the tooltip

#### Scenario: Every element shows its whole text

- **WHEN** each text element is as wide as its content
- **THEN** the text does not count as truncated

### Requirement: Host components supply the measured elements

When the host component provides `KBQ_TITLE_TEXT_REF`, as options and dropdown items do, the directive SHALL measure its `textElement` as the text and its `parentTextElement` as the container, each falling back to the host element when the component leaves it unset. `#kbqTitleText` and `#kbqTitleContainer` references in the host's content SHALL take precedence over them.

#### Scenario: Component with a text element only

- **WHEN** `kbq-title` is put on a component that provides `KBQ_TITLE_TEXT_REF` with a `textElement` and no `parentTextElement`
- **THEN** that `textElement` is measured against the host element

#### Scenario: Component with a clipping container

- **WHEN** a tree option provides its text container as `parentTextElement`
- **THEN** overflow is decided by that container, not by the wider option host

#### Scenario: Projected text reference on such a component

- **WHEN** a tree option with `kbq-title` projects a `<span #kbqTitleText>`
- **THEN** that span is measured as the text, against the container the option supplies

### Requirement: Default tooltip content is the container text

Without explicit content, the tooltip SHALL show the `textContent` of the measured container with leading and trailing whitespace removed. `viewValue` SHALL return the same text, and an empty string for an empty container.

#### Scenario: Plain host

- **WHEN** the host is `<div kbq-title>Hello World</div>`
- **THEN** the tooltip content and `viewValue` are `'Hello World'`

#### Scenario: Container reference

- **WHEN** the `#kbqTitleContainer` holds the text `Container text`
- **THEN** `viewValue` is `'Container text'`

#### Scenario: Empty host

- **WHEN** the host has no text
- **THEN** `viewValue` is an empty string

### Requirement: Empty content opens no tooltip

When neither `[kbq-title]` nor the container text gives any content, the directive MUST NOT open a tooltip, even if the host is reported as overflown.

#### Scenario: Hovering an empty host

- **WHEN** a host without text and without a bound value is hovered
- **THEN** no tooltip and no empty overlay pane is created

### Requirement: Explicit tooltip content

`[kbq-title]` SHALL accept a string or a `TemplateRef`. A non-empty string SHALL be shown as the tooltip text and a template SHALL be rendered inside the tooltip. A bare `kbq-title` attribute or an empty string SHALL fall back to the container text. Truncation SHALL still be decided by the measured text, not by the explicit content.

#### Scenario: String content

- **WHEN** the host is `<div [kbq-title]="'Explicit tooltip'">Hello World</div>`
- **THEN** the tooltip content is `'Explicit tooltip'`

#### Scenario: Template content

- **WHEN** `[kbq-title]` is bound to an `<ng-template>` and the user hovers the truncated host
- **THEN** the tooltip renders that template

#### Scenario: Bare attribute

- **WHEN** the host is `<div kbq-title>Hello World</div>`
- **THEN** the tooltip content is the host text

### Requirement: A rebound value takes effect at once

When the value bound to `[kbq-title]` changes, the directive SHALL put the new content into an open tooltip and re-evaluate truncation at once, without waiting for the next hover.

#### Scenario: Rebinding while the tooltip is open

- **WHEN** the tooltip shows `First` and the bound value changes to `Second`
- **THEN** the open tooltip shows `Second`

#### Scenario: Rebinding while the tooltip is closed

- **WHEN** the bound value changes on a truncated host that has not been hovered
- **THEN** the content is the new value and the tooltip is enabled

### Requirement: Content mutations are followed

When the content of the measured container changes, the directive SHALL refresh the default tooltip content and re-evaluate truncation at once, and SHALL ignore the further mutations that arrive within the next 100 ms. When the text then fits, an open tooltip SHALL close.

#### Scenario: Host text replaced

- **WHEN** the host text changes to `' Updated Text '`
- **THEN** the tooltip content becomes `'Updated Text'`

#### Scenario: New text fits

- **WHEN** the content changes and the text no longer overflows
- **THEN** the tooltip is disabled

### Requirement: Container resizes are followed

The directive SHALL observe the size of the measured container itself, not the window, and SHALL re-evaluate truncation 100 ms after the last resize. When the text then fits, an open tooltip SHALL close. A resize alone MUST NOT open the tooltip.

#### Scenario: Container-only resize

- **WHEN** a splitter drag or a sidebar collapse resizes the container without resizing the window
- **THEN** truncation is re-evaluated

#### Scenario: Container grows until the text fits

- **WHEN** the container is resized so that its text fits
- **THEN** the tooltip is disabled 100 ms after the resize

#### Scenario: Container shrinks until the text is cut

- **WHEN** the container is resized so that its text overflows
- **THEN** the tooltip is enabled but opens only on the next hover or keyboard focus

### Requirement: Trigger is fixed to hover and keyboard focus

The directive SHALL always report `hover` as its `trigger` and open only on hover and keyboard focus. A `kbqTrigger` value, including one that a `kbqPopover` on the same host shares through that alias, SHALL be accepted without error and MUST NOT change this.

#### Scenario: Assigning another trigger

- **WHEN** `trigger` is set to `'click'`
- **THEN** `trigger` still reads `'hover'`

### Requirement: Keyboard focus opens the tooltip

When the host receives focus from the keyboard and its text is truncated, the directive SHALL open the tooltip after the enter delay. When the text fits, keyboard focus MUST NOT open it.

#### Scenario: Tabbing onto a truncated button

- **WHEN** the user tabs onto a `<button kbq-title>` whose label is cut
- **THEN** the tooltip opens and contains the full label

#### Scenario: Tabbing onto a button whose label fits

- **WHEN** the user tabs onto a `<button kbq-title>` whose label fits
- **THEN** no tooltip opens

### Requirement: Blur and non-keyboard focus close the tooltip

When the host loses focus, or receives focus from the mouse, touch or a program, the directive SHALL close the tooltip and keep it closed until the next hover or keyboard focus. Clicking a focusable host therefore closes a tooltip that hovering opened.

#### Scenario: Focus leaves the host

- **WHEN** the tooltip was opened by keyboard focus and the user tabs away
- **THEN** the tooltip closes

#### Scenario: Mouse focus after keyboard focus

- **WHEN** the tooltip was opened by keyboard focus and the host is then focused with the mouse
- **THEN** the tooltip closes

### Requirement: Tooltip returns after a pop-up on the same host

When a pop-up anchored to the same host, such as a popover or a dropdown, has opened and closed, the title tooltip SHALL open again for a keyboard user once focus has left the host and come back, without any pointer movement.

#### Scenario: Keyboard user after a popover

- **WHEN** a popover on the truncated host opens and closes, and the user then moves focus away and tabs back onto the host
- **THEN** the title tooltip opens

### Requirement: Truncation verdict wins over kbqTooltipDisabled

`kbqTooltipDisabled` set to `true` SHALL keep the tooltip closed even over truncated text. Set back to `false` or unbound, it MUST NOT open a tooltip for text that fits. The `disabled` property SHALL read the effective state rather than the bound value.

#### Scenario: Disabled over truncated text

- **WHEN** `kbqTooltipDisabled` is `true` and the user hovers a truncated host
- **THEN** no tooltip opens and `disabled` is `true`

#### Scenario: Re-enabled over text that fits

- **WHEN** the text fits and `kbqTooltipDisabled` goes from `true` to `false`
- **THEN** `disabled` stays `true`

### Requirement: Tooltip ignores pointer events by default

`ignoreTooltipPointerEvents` SHALL default to `true`, which puts the `cdk-overlay-pane_ignore-pointer-events` class on the tooltip's overlay pane so that clicks and hovers reach the content beneath it. Set to `false`, the pane SHALL stay hoverable like that of a plain `kbqTooltip`.

#### Scenario: Default pane

- **WHEN** the tooltip of a truncated host opens
- **THEN** its overlay pane has the `cdk-overlay-pane_ignore-pointer-events` class

#### Scenario: Opting out

- **WHEN** `[ignoreTooltipPointerEvents]="false"` is set and the tooltip opens
- **THEN** its overlay pane does not have that class

### Requirement: Default placement keeps the tooltip centred

With no `kbqPlacementPriority` and the default `top` placement, the directive SHALL try the placements `top`, `bottom`, `right` and `left`, in that order, and no corner-anchored placement. An explicit `kbqPlacementPriority`, or a `kbqPlacement` other than `top`, SHALL be used unchanged.

#### Scenario: Bare host

- **WHEN** neither `kbqPlacement` nor `kbqPlacementPriority` is set
- **THEN** the placement priority is `['top', 'bottom', 'right', 'left']`

#### Scenario: Explicit priority

- **WHEN** `[kbqPlacementPriority]="['bottom']"` is set
- **THEN** the placement priority is `['bottom']`

#### Scenario: Explicit placement

- **WHEN** `kbqPlacement` is `'left'`
- **THEN** no placement priority is set and the tooltip's own fallbacks for `left` apply

### Requirement: Repeated text does not describe the host

While the tooltip is open, the host SHALL point its `aria-describedby` at the tooltip only when the tooltip content differs from the host's own trimmed text, so assistive technology does not read the same text twice. Content from a template, or a string that differs, SHALL be added and removed again when the tooltip closes, keeping any other ids.

#### Scenario: Default content

- **WHEN** the tooltip of a bare `kbq-title` host opens
- **THEN** the host gets no `aria-describedby` from the tooltip

#### Scenario: Custom content

- **WHEN** the tooltip of a host with `[kbq-title]="'More details'"` opens
- **THEN** the host's `aria-describedby` contains the tooltip id until the tooltip closes

### Requirement: Destroyed directive stops observing

When the directive is destroyed, it SHALL stop observing the container's size and content and stop monitoring focus, so later resizes or mutations change nothing and no subscription is left behind.

#### Scenario: Resize after destroy

- **WHEN** the directive is destroyed and its former container is then resized
- **THEN** the directive's state does not change
