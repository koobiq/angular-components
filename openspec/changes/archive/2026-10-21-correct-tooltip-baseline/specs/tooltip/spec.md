# Spec Delta

## MODIFIED Requirements

### Requirement: Keyboard focus opens and blur closes

With `focus` in `kbqTrigger`, the tooltip SHALL open when the trigger element receives focus from the keyboard, including focus moved with `FocusMonitor.focusVia(element, 'keyboard')`, and SHALL close on `blur` after the leave delay. Focus that follows a pointer interaction, and focus whose origin cannot be attributed, MUST NOT open it. With `hideWithTimeout` and `hover` also set, it SHALL also close `kbqLeaveDelay` ms after the focus unless the pointer is on the trigger or the tooltip.

#### Scenario: Tabbing onto the trigger

- **WHEN** the user presses Tab and focus lands on the trigger
- **THEN** the tooltip opens

#### Scenario: Focus left behind by a click

- **WHEN** the trigger is focused with the `mouse` origin
- **THEN** the tooltip stays closed

#### Scenario: Unattributed focus

- **WHEN** the trigger receives a `focus` event with no preceding keyboard or pointer interaction
- **THEN** the tooltip stays closed

#### Scenario: Keyboard focus with hideWithTimeout

- **WHEN** a tooltip with the default triggers, `hideWithTimeout` and a `kbqLeaveDelay` of 1000 is opened by keyboard focus while the pointer is elsewhere
- **THEN** it closes 1000 ms after the focus, although the trigger keeps the focus

### Requirement: Tooltips driven from code

A `kbqTrigger` that names none of `hover`, `focus`, `click` and `keydown`, such as `manual` or `none`, SHALL bind none of their events: hovering, focusing, clicking or pressing Enter or Space on its element MUST NOT open it, and it SHALL open only through `show()`, `kbqVisible` and the other programmatic APIs. Besides those APIs, Escape pressed on its trigger element, a touch end there, scrolling and its parent pop-up closing still close it.

#### Scenario: Manual tooltip

- **WHEN** a tooltip has `kbqTrigger="manual"` and code calls `show(0)`
- **THEN** the tooltip opens
- **AND** hovering or focusing its element changes nothing

### Requirement: Touch end closes the tooltip

A touch that started on the trigger element SHALL close an open tooltip after the leave delay once it ends, wherever the finger is lifted: the end event of a touch goes to the element the touch started on.

#### Scenario: Lifting the finger

- **WHEN** a tooltip is open and the user lifts a finger from its trigger element
- **THEN** the tooltip closes

### Requirement: Arrow alignment on small anchors

With the arrow on, when the anchor is narrower or shorter than twice the arrow's inset (34 px at the default arrow size), a placement aligned to an edge of the anchor SHALL be shifted so that the arrow still points at the anchor. Without the arrow, or for a larger anchor, the positions MUST NOT be shifted. When the tooltip is anchored to the caret, the caret is the anchor measured.

#### Scenario: Small trigger

- **WHEN** a tooltip with an arrow opens on a 33 px trigger
- **THEN** its positions carry an offset

#### Scenario: Large trigger or no arrow

- **WHEN** the trigger is 100 px wide and 100 px tall, or the arrow is off
- **THEN** no position carries an offset

### Requirement: Fallback placements

When the tooltip does not fit in its placement, it SHALL try the default fallbacks of that placement, starting with the opposite side, except that `topLeft`, `topRight`, `bottomLeft` and `bottomRight` first try the other corner of the same side; for `top` the order is `top`, `bottom`, `right`, `rightBottom`, `leftBottom`, `bottomLeft`, `bottomRight`.

#### Scenario: No room above

- **WHEN** a tooltip with the default placement opens on a trigger at the top edge of the viewport
- **THEN** it opens below the trigger with the class `kbq-tooltip_placement-bottom`

#### Scenario: Corner placement without room on its side

- **WHEN** a tooltip with `kbqPlacement="topLeft"` would overflow the right edge of the viewport but fits aligned to the right edge of its trigger
- **THEN** it opens above the trigger with the class `kbq-tooltip_placement-top-right`

### Requirement: Placement priority

`kbqPlacementPriority`, a placement name or an array of them, SHALL replace the whole order of placements the tooltip tries, `kbqPlacement` included. Unknown names SHALL be skipped, while `topCenter` and `bottomCenter` are taken as `top` and `bottom`; a value made only of unknown names leaves the tooltip no position, and opening it fails. An empty value, `null` or a binding changed to `undefined` SHALL restore the default order.

#### Scenario: Custom order

- **WHEN** `kbqPlacementPriority` is `['bottom', 'top']`
- **THEN** the tooltip opens below the trigger when there is room, whatever `kbqPlacement` is

#### Scenario: Binding reset

- **WHEN** a bound `kbqPlacementPriority` changes from `['bottom']` to `undefined`
- **THEN** `tooltipPlacementPriority` reads `null`

### Requirement: Positioning relative to the caret

With `kbqRelativeToCaret` set, the tooltip SHALL anchor to the caret or selection of a text field: the trigger element if it is an `input`, `textarea` or `contenteditable` element, else the first one inside it. With no field, or no caret reported, it SHALL be anchored to the trigger element's box, and to the field's box when its text cannot be measured, as in a `password` input. Every placement SHALL stay available, and opening where nothing is laid out, as on the server, MUST NOT throw.

#### Scenario: Typing in an input

- **WHEN** a caret-anchored tooltip on an input opens while the user types
- **THEN** the tooltip is centred on the caret, not on the input

#### Scenario: No field

- **WHEN** a caret-anchored tooltip is attached to a `span` with no editable content
- **THEN** the tooltip is anchored to the span's box

#### Scenario: Unmeasurable field in a wrapper

- **WHEN** a caret-anchored tooltip sits on an element that wraps an `<input type="password">`
- **THEN** the tooltip is anchored to the box of the input, not to the box of the wrapper

### Requirement: Offset

`kbqTooltipOffset` SHALL set the gap in pixels, negative values included, between the tooltip and its trigger on the side facing it in `kbqPlacement`; a fallback or `kbqPlacementPriority` placement taken on opening keeps the stylesheet gap until a change of the content, context, header, arrow or offset writes it for the side shown. With `null`, the default, the stylesheet gap SHALL apply: 8 px with the arrow and 4 px without. Changing it while the tooltip is open SHALL move the open tooltip.

#### Scenario: Default gaps

- **WHEN** two tooltips placed at the bottom open, one with the arrow and one without
- **THEN** they are 8 px and 4 px below their triggers

#### Scenario: Offset changed while open

- **WHEN** a tooltip placed on top is open and `kbqTooltipOffset` becomes 24
- **THEN** the tooltip element has a bottom margin of 24 px

#### Scenario: Offset cleared

- **WHEN** `kbqTooltipOffset` changes from 24 to `null` while the tooltip is open
- **THEN** the inline margin is removed and the stylesheet gap applies

### Requirement: Returning pointer keeps the tooltip

With `hover` in `kbqTrigger`, when the pointer enters the trigger again while a close of the tooltip is pending, the pending close SHALL be cancelled and the tooltip SHALL stay open.

#### Scenario: Back within the leave delay

- **WHEN** the pointer leaves the trigger and comes back 500 ms into a 1000 ms leave delay
- **THEN** the tooltip is still open 1500 ms later

### Requirement: Tooltip pane receives the pointer

By default the overlay pane of the tooltip, which has the class `kbq-tooltip-panel`, SHALL receive pointer events. With `ignoreTooltipPointerEvents` set, and always for a tooltip whose `kbqTrigger` has no user trigger, the pane SHALL get the class `cdk-overlay-pane_ignore-pointer-events` and let clicks and hovers pass through to what is underneath. Both are read once, when the overlay is created on the first show, and kept for the life of the directive.

#### Scenario: Default pane

- **WHEN** a hover tooltip opens
- **THEN** the `kbq-tooltip-panel` pane has `pointer-events: auto`

#### Scenario: Click-through pane

- **WHEN** a tooltip with `ignoreTooltipPointerEvents` set opens
- **THEN** its pane has the class `cdk-overlay-pane_ignore-pointer-events`

#### Scenario: Pinned tooltip

- **WHEN** a `manual` tooltip is shown from code
- **THEN** its pane has the class `cdk-overlay-pane_ignore-pointer-events`

### Requirement: Moving onto the tooltip with hideWithTimeout

With `hideWithTimeout` set and `hover` in `kbqTrigger`, the pointer leaving the trigger MUST NOT close the tooltip by itself: whatever opened it, the tooltip SHALL close `kbqLeaveDelay` milliseconds after the pointer is over neither the trigger nor the tooltip, counted from the show request when the pointer is elsewhere, and the pointer entering either of them SHALL cancel that pending close. The pointer leaving a tooltip opened by hover closes it in the next task instead.

#### Scenario: Pointer rests on the tooltip

- **WHEN** `hideWithTimeout` is set, `kbqLeaveDelay` is 1000 and the pointer moves from the trigger onto the tooltip
- **THEN** the tooltip stays open for as long as the pointer is over it

#### Scenario: Pointer leaves both

- **WHEN** `hideWithTimeout` is set, `kbqLeaveDelay` is 1000 and the pointer leaves the trigger for an unrelated area
- **THEN** the tooltip closes 1000 ms later

### Requirement: Pop-up on the same element mutes the tooltip

When a pop-up that announces itself through `KBQ_SIBLING_POPUP` on the trigger element, such as a popover, dropdown or select, opens, a tooltip whose `kbqTrigger` has a user trigger SHALL close at once and drop a pending show. While that pop-up's overlay is attached, a show requested through a user trigger, `show()` or `kbqVisible` SHALL be ignored, even before the pop-up announces that it opened; a show requested earlier and still pending is dropped only by that announcement.

#### Scenario: Pop-up opens over a visible tooltip

- **WHEN** the tooltip is visible and the pop-up on the same element opens
- **THEN** the tooltip closes

#### Scenario: Pop-up opens during the enter delay

- **WHEN** the pointer has just entered the trigger and the pop-up opens, announcing it, before the enter delay ends
- **THEN** the tooltip never appears

#### Scenario: Hover while the pop-up is open

- **WHEN** the pop-up is open and the pointer hovers the trigger
- **THEN** the tooltip stays closed

### Requirement: Bindings reset to their defaults

When one of the following bound inputs changes to `undefined`, the tooltip SHALL restore its default: `kbqEnterDelay` 400, `kbqLeaveDelay` 0, `kbqRelativeToCaretVertical` `auto`, `kbqTooltipModifier` `default`, `kbqTooltipClass` empty, `kbqTooltipColor` `contrast`, `kbqTooltipOffset` `null` and `kbqTooltipContext` unset; `kbqVisible` changing to `undefined` SHALL close an open tooltip. A bound `kbqTooltipSingleInstance` reads `undefined` as `false`, not as its default.

#### Scenario: Delay binding reset

- **WHEN** a bound `kbqEnterDelay` changes from 0 to `undefined`
- **THEN** `enterDelay` reads 400

#### Scenario: Visibility binding reset

- **WHEN** a tooltip opened by `kbqVisible` set to `true` sees the binding change to `undefined`
- **THEN** the tooltip closes

### Requirement: Visibility from code

`kbqVisible` set to `true` SHALL open the tooltip after the enter delay and `false` SHALL close it after the leave delay, under the same conditions as `show()` and `hide()`. `kbqVisibleChange` SHALL emit `true` when the tooltip becomes visible and `false` when it closes for any reason other than the directive being destroyed. `isOpen` SHALL follow the visible state, and the trigger element SHALL have the class `kbq-tooltip_open` while the tooltip is open.

#### Scenario: Opening through the input

- **WHEN** `kbqVisible` is bound to `true`
- **THEN** the tooltip appears after the enter delay and `kbqVisibleChange` emits `true`
- **AND** the trigger element has the class `kbq-tooltip_open`

### Requirement: Show and hide methods

The directive SHALL be exported as `kbqTooltip`. `show(delay)` SHALL open the tooltip after `delay` ms, or `kbqEnterDelay` without an argument, and `hide(delay)` SHALL close it after `delay` ms, or `kbqLeaveDelay` without an argument. `show()` SHALL follow the rules on disabled state, empty content and muting by a pop-up on the same element, and does nothing while the last trigger event is a non-keyboard `focus`; `hide()` does nothing while the pointer that left the trigger rests on the tooltip.

#### Scenario: Pinned tooltip toggled from a button

- **WHEN** a button calls `show(0)` and later `hide(0)` on a `manual` tooltip referenced as `#tooltip="kbqTooltip"`
- **THEN** the tooltip opens in the next task and closes in the task after `hide(0)`

#### Scenario: Hiding under the pointer

- **WHEN** `hideWithTimeout` is set, `kbqLeaveDelay` is 1000, the pointer has moved from the trigger onto the open tooltip and code calls `hide(0)`
- **THEN** the tooltip stays open

### Requirement: Showing for another element

`showForElement(element)` SHALL open the tooltip anchored to the given element instead of the trigger element, under the rules of `show()`, and later opens keep that anchor until another one is set. While the tooltip is disabled or has no content it MUST NOT open, though once its overlay exists the call still moves the anchor to the element.

#### Scenario: Anchoring to an element

- **WHEN** code calls `showForElement(cell)`
- **THEN** the tooltip opens positioned against `cell`
