# tooltip Specification

## Purpose

Describes what the `kbqTooltip` directive from `@koobiq/components/tooltip` guarantees to consumers: when its hint opens and closes for pointer, keyboard and code, how it is timed, positioned and styled through its inputs, how it shares the screen with other tooltips and pop-ups, and how it is exposed to assistive technology.

## Requirements

### Requirement: Default triggers

`kbqTrigger` SHALL take a comma-separated list of the user triggers `hover`, `focus`, `click` and `keydown`, and the tooltip SHALL bind the events of each name in it. It SHALL default to `hover, focus`; an empty value, or a binding that changes to `undefined`, SHALL restore that default and rebind the events.

#### Scenario: No trigger given

- **WHEN** a tooltip is declared without `kbqTrigger`
- **THEN** hovering its element and focusing it from the keyboard each open it

#### Scenario: Binding reset

- **WHEN** a bound `kbqTrigger` changes from `click` to `undefined`
- **THEN** the directive's `trigger` reads `hover, focus`

### Requirement: Hover opens and leaving closes

With `hover` in `kbqTrigger`, the pointer entering the trigger element SHALL open the tooltip after the enter delay, and the pointer leaving it SHALL close the tooltip after the leave delay. The close SHALL happen in a later task, never synchronously with the `mouseleave` event, also with a leave delay of 0.

#### Scenario: Hover and leave

- **WHEN** the pointer enters the trigger and stays for 400 ms
- **THEN** the tooltip is shown
- **AND** when the pointer leaves, the tooltip is still in the DOM until the next task, and gone after it

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

### Requirement: Click trigger

With `click` in `kbqTrigger`, a click on the trigger element SHALL open the tooltip after the enter delay, and a pointer event outside the tooltip pane SHALL close it after the leave delay.

#### Scenario: Opening by click

- **WHEN** the tooltip has `kbqTrigger="click"` and the user clicks its trigger
- **THEN** the tooltip opens after the enter delay

#### Scenario: Clicking elsewhere

- **WHEN** a click-triggered tooltip is open and the user clicks outside it
- **THEN** the tooltip closes

### Requirement: Keydown trigger

With `keydown` in `kbqTrigger`, Enter or Space pressed on the trigger element SHALL open the tooltip one task later, after the enter delay, whatever the origin of the focus on the trigger. The keydown trigger SHALL bind no closing event of its own.

#### Scenario: Enter after a pointer focus

- **WHEN** a trigger with `kbqTrigger="focus, keydown"` was focused by the pointer and the user presses Enter on it
- **THEN** the tooltip opens

### Requirement: Tooltips driven from code

A `kbqTrigger` that names none of `hover`, `focus`, `click` and `keydown`, such as `manual` or `none`, SHALL bind none of their events: hovering, focusing, clicking or pressing Enter or Space on its element MUST NOT open it, and it SHALL open only through `show()`, `kbqVisible` and the other programmatic APIs. Besides those APIs, Escape pressed on its trigger element, a touch end there, scrolling and its parent pop-up closing still close it.

#### Scenario: Manual tooltip

- **WHEN** a tooltip has `kbqTrigger="manual"` and code calls `show(0)`
- **THEN** the tooltip opens
- **AND** hovering or focusing its element changes nothing

### Requirement: Escape dismisses the tooltip

While a tooltip whose `kbqTrigger` has a user trigger is open, Escape pressed anywhere in the document SHALL close it without the leave delay, even when the trigger does not have focus. The tooltip SHALL mark the key event as handled (`defaultPrevented`) without stopping its propagation, so an enclosing modal stays open on that press and overlays underneath still receive the key.

#### Scenario: Hover tooltip and a focused field

- **WHEN** a hover tooltip is open, focus is in another element and the user presses Escape
- **THEN** the tooltip closes

#### Scenario: Tooltip inside a modal

- **WHEN** a tooltip inside a modal is open and the user presses Escape twice
- **THEN** the first press closes only the tooltip and the second closes the modal

#### Scenario: Overlay underneath

- **WHEN** another overlay subscribed to its key events is attached below an open tooltip and the user presses Escape
- **THEN** that overlay receives the key and the tooltip closes

### Requirement: Escape leaves pinned tooltips open

A tooltip whose `kbqTrigger` has no user trigger MUST NOT close on an Escape pressed outside its trigger element, and MUST NOT mark that key event as handled.

#### Scenario: Pinned tooltip inside a modal

- **WHEN** a `manual` tooltip in a modal is open, focus is in a field of the modal and the user presses Escape
- **THEN** the tooltip stays open and the modal closes

### Requirement: Scrolling closes the tooltip

By default an open tooltip SHALL close when the page or a registered scroll container scrolls. A factory provided through `KBQ_TOOLTIP_SCROLL_STRATEGY` SHALL replace that scroll strategy. A tooltip closed by its scroll strategy SHALL emit `kbqVisibleChange` with `false`, report `isOpen` as `false` and open again normally.

#### Scenario: Closed by the scroll strategy

- **WHEN** an open tooltip's overlay is detached by its scroll strategy
- **THEN** `kbqVisibleChange` emits `false` and `isOpen` is `false`
- **AND** a later `show(0)` opens the tooltip again

### Requirement: Touch end closes the tooltip

A touch that started on the trigger element SHALL close an open tooltip after the leave delay once it ends, wherever the finger is lifted: the end event of a touch goes to the element the touch started on.

#### Scenario: Lifting the finger

- **WHEN** a tooltip is open and the user lifts a finger from its trigger element
- **THEN** the tooltip closes

### Requirement: Parent pop-up closing closes the tooltip

A tooltip inside a pop-up that provides `KBQ_PARENT_POPUP`, such as the select and tree-select panels, SHALL close when that pop-up emits on its `closedStream`.

#### Scenario: Panel closes

- **WHEN** a tooltip inside such a pop-up is open and the pop-up closes
- **THEN** the tooltip closes

### Requirement: Nothing to show

A tooltip whose content is empty, `undefined` or unset MUST NOT open or attach an overlay, whether through a user trigger, `show()`, `showForElement()` or `showForMouseEvent()`. Once content is set, it SHALL open normally.

#### Scenario: Content arrives later

- **WHEN** the pointer hovers a trigger whose `kbqTooltip` is empty
- **THEN** no overlay is attached
- **AND** after the content is set to "FILLED", hovering again shows "FILLED"

#### Scenario: Content binding changed to undefined

- **WHEN** a bound `kbqTooltip` changes from a text to `undefined` and the pointer hovers the trigger
- **THEN** no tooltip is rendered

### Requirement: Width limit

The tooltip SHALL size to its content up to a maximum width of 300 px, set by the `--kbq-tooltip-size-max-width` custom property of `.kbq-tooltip`, which a consumer can override through a class given in `kbqTooltipClass`. Longer text SHALL wrap, breaking words that do not fit, and line breaks in string content SHALL be kept.

#### Scenario: Long text

- **WHEN** a string tooltip is longer than 300 px on one line
- **THEN** the tooltip is 300 px wide and its text wraps

#### Scenario: Wider tooltip on request

- **WHEN** `kbqTooltipClass` names a class that sets `--kbq-tooltip-size-max-width` to 454px
- **THEN** the tooltip grows up to 454 px

### Requirement: Color

`kbqTooltipColor` SHALL put the class `kbq-<color>` on the tooltip element; it SHALL default to `contrast`, and an empty value SHALL fall back to `contrast`. The stylesheet SHALL style `contrast`, `contrast-fade`, `theme`, `warning` and `error`. Reading `color` back SHALL return the assigned value, not its CSS class.

#### Scenario: Default color

- **WHEN** a tooltip without `kbqTooltipColor` opens
- **THEN** the tooltip element has the class `kbq-contrast`

#### Scenario: Error color

- **WHEN** `kbqTooltipColor` is `error` and the tooltip opens
- **THEN** the tooltip element has the class `kbq-error`

#### Scenario: Reading the color back

- **WHEN** `color` is set to `error` and the value read from it is written back
- **THEN** `color` reads `error` and the tooltip element has `kbq-error`

### Requirement: Arrow

`kbqTooltipArrow` SHALL default to `false`. With it set, the tooltip SHALL render an arrow pointing at the trigger, hidden from assistive technology with `aria-hidden="true"`; without it, the tooltip element SHALL carry the no-arrow modifier class of `.kbq-tooltip`, which the 4 px default gap is keyed to. Changing the input while the tooltip is open SHALL update the open tooltip.

#### Scenario: Without an arrow

- **WHEN** `kbqTooltipArrow` is `false` and the tooltip opens
- **THEN** the tooltip element has the no-arrow modifier class and no arrow element

#### Scenario: Arrow switched on while open

- **WHEN** the tooltip is open without an arrow and `kbqTooltipArrow` becomes `true`
- **THEN** the arrow is rendered in the open tooltip

### Requirement: Arrow alignment on small anchors

With the arrow on, when the anchor is narrower or shorter than twice the arrow's inset (34 px at the default arrow size), a placement aligned to an edge of the anchor SHALL be shifted so that the arrow still points at the anchor. Without the arrow, or for a larger anchor, the positions MUST NOT be shifted. When the tooltip is anchored to the caret, the caret is the anchor measured.

#### Scenario: Small trigger

- **WHEN** a tooltip with an arrow opens on a 33 px trigger
- **THEN** its positions carry an offset

#### Scenario: Large trigger or no arrow

- **WHEN** the trigger is 100 px wide and 100 px tall, or the arrow is off
- **THEN** no position carries an offset

### Requirement: Placement

`kbqPlacement` SHALL accept `top` (the default), `topLeft`, `topRight`, `right`, `rightTop`, `rightBottom`, `bottom`, `bottomLeft`, `bottomRight`, `left`, `leftTop` and `leftBottom`. The tooltip element SHALL carry the class `kbq-tooltip_placement-<placement>`, in kebab case, for the placement it is shown in. An unknown value SHALL log a console warning and fall back to `top`.

#### Scenario: Right placement

- **WHEN** `kbqPlacement` is `rightTop` and there is room on the right
- **THEN** the tooltip opens to the right of the trigger, aligned to its top, with the class `kbq-tooltip_placement-right-top`

#### Scenario: Unknown placement

- **WHEN** `kbqPlacement` is `middle`
- **THEN** the console shows "Unknown position: middle. Will used default position: top" and the placement is `top`

#### Scenario: Binding reset

- **WHEN** a bound `kbqPlacement` changes from `right` to `undefined`
- **THEN** `tooltipPlacement` reads `top`

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

### Requirement: Placement change event

`kbqPlacementChange` SHALL emit the name of the placement the tooltip is shown in each time its overlay applies a different position, including the first one and a fallback chosen for lack of room, and the placement class SHALL follow it.

#### Scenario: Fallback taken

- **WHEN** a tooltip with `kbqPlacement="top"` opens where only the bottom has room
- **THEN** `kbqPlacementChange` emits `bottom`

### Requirement: Positioning relative to the pointer

With `kbqRelativeToPointer` set and `kbqPlacement` `top` or `bottom`, a tooltip opened by hover SHALL be anchored at the horizontal position where the pointer entered the trigger, on the trigger's top or bottom edge, and MUST NOT follow later pointer movement. For other placements, or a tooltip opened another way, it SHALL be anchored to the trigger element.

#### Scenario: Long trigger

- **WHEN** the pointer enters a wide trigger near its right end
- **THEN** the tooltip opens above the trigger, centred on the pointer's horizontal position

#### Scenario: Side placement

- **WHEN** `kbqRelativeToPointer` is set and `kbqPlacement` is `right`
- **THEN** the tooltip is anchored to the trigger element

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

### Requirement: Vertical anchor at the caret

`kbqRelativeToCaretVertical` SHALL decide what a caret-anchored tooltip is vertically anchored to: `line`, the line the caret is on; `field`, the whole field, while it still follows the caret horizontally; `auto`, the default, `field` for an `input` and `line` for a `textarea` or `contenteditable` element.

#### Scenario: Default for an input

- **WHEN** a caret-anchored tooltip with the default anchor opens on an input
- **THEN** it is placed above the whole input, not over the text line

#### Scenario: Default for a textarea

- **WHEN** a caret-anchored tooltip with the default anchor opens on a textarea
- **THEN** it is placed next to the line the caret is on

#### Scenario: Field anchor for a textarea

- **WHEN** `kbqRelativeToCaretVertical` is `field` on a textarea
- **THEN** the tooltip is placed above or below the whole textarea

### Requirement: Following the caret

While a caret-anchored tooltip is open, it SHALL reposition after each `input`, `click`, `select` and `scroll` event of its field and each key released in it, and choose its placement again, so that it can flip near the edge of the viewport. Once the tooltip is closed, it SHALL stop following the caret.

#### Scenario: Typing moves the tooltip

- **WHEN** the user keeps typing in an input with an open caret-anchored tooltip
- **THEN** the tooltip moves along with the caret

#### Scenario: New line in a textarea

- **WHEN** the user presses Enter and types on the next line of a textarea
- **THEN** the tooltip moves down to that line

### Requirement: Caret anchoring takes precedence

`kbqRelativeToCaret` SHALL win over `kbqRelativeToPointer` when both are set. Switching `kbqRelativeToCaret` off while the tooltip is open SHALL anchor it to the trigger element again.

#### Scenario: Both inputs set

- **WHEN** a tooltip has both `kbqRelativeToCaret` and `kbqRelativeToPointer` set and opens
- **THEN** it is anchored to the caret, not to the pointer

#### Scenario: Switching caret mode off

- **WHEN** `kbqRelativeToCaret` becomes `false` while the tooltip is open
- **THEN** the tooltip is anchored to the trigger element's box

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

### Requirement: Enter delay

`kbqEnterDelay` SHALL set the time in milliseconds between a user trigger, a call to `show()` without an argument or `kbqVisible` becoming `true`, and the tooltip appearing. It SHALL default to 400 ms, also after a binding changes to `undefined`.

#### Scenario: Default delay

- **WHEN** the pointer enters a trigger and no tooltip was shown recently
- **THEN** the tooltip is closed after 399 ms and open after 401 ms

### Requirement: Instant show after a recent tooltip

A tooltip SHALL skip its enter delay, whatever delay it was asked to use, when another show started less than `KBQ_TOOLTIP_INSTANT_SHOW_WINDOW` milliseconds earlier anywhere in the application. The window SHALL default to `MIN_TIME_FOR_DELAY`, 2000 ms, and SHALL be measured from the moment the previous show started. Providing `0` SHALL make every tooltip wait its full enter delay.

#### Scenario: Moving to the next trigger

- **WHEN** a tooltip has just been shown and the pointer moves to another trigger
- **THEN** the second tooltip opens within 1 ms

#### Scenario: Window turned off

- **WHEN** `KBQ_TOOLTIP_INSTANT_SHOW_WINDOW` is provided as `0` and the pointer moves to another trigger right after a tooltip was shown
- **THEN** the second tooltip waits its full enter delay

### Requirement: Leave delay

`kbqLeaveDelay` SHALL set the time in milliseconds between the pointer leaving the trigger, or the trigger losing focus, and the tooltip closing, with or without `hideWithTimeout`. It SHALL default to 0, also after a binding changes to `undefined`.

#### Scenario: Pointer leaves

- **WHEN** `kbqLeaveDelay` is 1000 and the pointer leaves the trigger
- **THEN** the tooltip is open after 999 ms and closed after 1001 ms

#### Scenario: Focus leaves

- **WHEN** `kbqLeaveDelay` is 1000 and a keyboard-opened tooltip's trigger loses focus
- **THEN** the tooltip closes 1000 ms later

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

### Requirement: Moving onto the tooltip without hideWithTimeout

Without `hideWithTimeout`, the close scheduled when the pointer leaves the trigger SHALL run after `kbqLeaveDelay` even when the pointer has moved onto the tooltip in the meantime.

#### Scenario: Pointer reaches the tooltip

- **WHEN** `hideWithTimeout` is not set, `kbqLeaveDelay` is 1000 and the pointer moves from the trigger onto the tooltip
- **THEN** the tooltip closes 1000 ms after the pointer left the trigger

### Requirement: Pointer leaving the tooltip

For a tooltip opened by hover, the pointer leaving the tooltip element SHALL close it in the next task, without waiting for `kbqLeaveDelay`, also with `hideWithTimeout` set.

#### Scenario: Leaving the tooltip

- **WHEN** `hideWithTimeout` is set, `kbqLeaveDelay` is 1000 and the pointer moves off the tooltip to an unrelated area
- **THEN** the tooltip closes without waiting 1000 ms

### Requirement: One tooltip at a time

When a tooltip whose `kbqTrigger` has a user trigger becomes visible, the previously visible tooltip of that kind SHALL close at once, even while the pointer rests on it, emit `kbqVisibleChange` with `false` and report `isOpen` as `false`. This SHALL hold however either tooltip was opened, `showForMouseEvent()` included.

#### Scenario: Hover then keyboard focus

- **WHEN** a hover tooltip is open and the user tabs to another trigger
- **THEN** only the second tooltip is visible
- **AND** the first emits `kbqVisibleChange(false)`

#### Scenario: Click tooltip replaced

- **WHEN** a click-triggered tooltip is open and the pointer hovers another trigger
- **THEN** only the hover tooltip is visible

### Requirement: Opting out of the one-at-a-time rule

`kbqTooltipSingleInstance` set to `false` SHALL keep a tooltip out of the one-at-a-time rule. Its default SHALL come from `KBQ_TOOLTIP_SINGLE_INSTANCE_DEFAULT`, `true` unless provided otherwise. The value SHALL be read when the tooltip becomes visible: switching it off while the tooltip is open MUST NOT exempt it until it opens again.

#### Scenario: Per tooltip

- **WHEN** a hover tooltip is open and the pointer hovers a trigger with `kbqTooltipSingleInstance` set to `false`
- **THEN** both tooltips are visible

#### Scenario: Application-wide

- **WHEN** `KBQ_TOOLTIP_SINGLE_INSTANCE_DEFAULT` is provided as `false` and two tooltips are opened one after the other
- **THEN** both tooltips are visible

#### Scenario: Switched off while open

- **WHEN** a tooltip is open, its `kbqTooltipSingleInstance` becomes `false`, and another tooltip opens
- **THEN** the first tooltip closes

### Requirement: Pinned tooltips stay out of the rule

A tooltip whose `kbqTrigger` has no user trigger, such as `manual`, SHALL neither close another tooltip when it opens nor be closed when another one opens, whatever `kbqTooltipSingleInstance` is.

#### Scenario: Pinned tooltip first

- **WHEN** a `manual` tooltip is open and a hover tooltip opens
- **THEN** both are visible

#### Scenario: Pinned tooltip second

- **WHEN** a hover tooltip is open and a `manual` tooltip is shown from code
- **THEN** both are visible

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

### Requirement: Release after the pop-up closes

After a pop-up on the same element closes, the tooltip SHALL stay muted, also against the focus the pop-up restores to the trigger and the `mouseenter` replayed when its overlay goes away, until the pointer leaves the trigger, focus leaves it, or a pointer that left the trigger's box while the pop-up was open comes back. A tooltip whose `kbqTrigger` has no user trigger MUST NOT be muted.

#### Scenario: Focus restored by the pop-up

- **WHEN** the pop-up closes and returns keyboard focus to the trigger
- **THEN** the tooltip stays closed

#### Scenario: Pointer came back

- **WHEN** the pointer left the trigger's box while the pop-up was open, the pop-up closed, and the pointer enters the trigger again
- **THEN** the tooltip opens

#### Scenario: Pinned tooltip on the same element

- **WHEN** the pop-up is open and code shows a `manual` tooltip on the same element
- **THEN** the tooltip opens

### Requirement: Disabling the tooltip

`kbqTooltipDisabled` set to `true` SHALL keep the tooltip from opening by any trigger or method, and setting it while the tooltip is open SHALL close it; `false` SHALL allow it again. `undefined` SHALL leave the decision to `forDisabledComponent`, or enable the tooltip when that is not bound. Reading `disabled` SHALL return the effective state.

#### Scenario: Disabled tooltip

- **WHEN** `kbqTooltipDisabled` is `true` and code calls `show()`
- **THEN** no tooltip is rendered

#### Scenario: Enabled again

- **WHEN** `disabled` is set to `false` and code calls `show()`
- **THEN** the tooltip opens

#### Scenario: Anchoring a disabled tooltip

- **WHEN** code calls `showForElement()` on a disabled tooltip
- **THEN** nothing is thrown and no overlay is attached

### Requirement: Tooltip for a disabled control

`forDisabledComponent`, bound to a component that exposes a `disabledSignal`, SHALL enable the tooltip only while that component is disabled. Then the trigger element SHALL get `tabindex="0"`, `role="group"` and the class `kbq-tooltip-trigger_for-disabled`; otherwise it SHALL have `tabindex="-1"`, no `role` and no such class, and an open tooltip SHALL close.

#### Scenario: Control disabled

- **WHEN** a button wrapped by a trigger with `forDisabledComponent` becomes disabled
- **THEN** the wrapper has `tabindex="0"`, `role="group"` and `kbq-tooltip-trigger_for-disabled`
- **AND** the tooltip is enabled

#### Scenario: Control enabled

- **WHEN** the wrapped button is enabled
- **THEN** the wrapper has `tabindex="-1"` and no `role`, and the tooltip is disabled

#### Scenario: Control enabled while the tooltip is open

- **WHEN** the tooltip of a disabled control is open and the control becomes enabled
- **THEN** the tooltip closes

### Requirement: Explicit disabled state wins

An explicit `kbqTooltipDisabled` of `true` or `false` SHALL win over the state that `forDisabledComponent` derives, in both directions and whichever of the two is set first.

#### Scenario: Explicitly disabled

- **WHEN** `kbqTooltipDisabled` is `true` and the wrapped control becomes disabled
- **THEN** the tooltip stays disabled

#### Scenario: Explicitly enabled

- **WHEN** `kbqTooltipDisabled` is `false` and the wrapped control is enabled
- **THEN** the tooltip is enabled

#### Scenario: Explicit value removed

- **WHEN** a bound `kbqTooltipDisabled` changes from `true` to `undefined` while the wrapped control is disabled
- **THEN** the tooltip is enabled

### Requirement: Content

`kbqTooltip` SHALL take the content as a string, rendered as text, or a `TemplateRef`, rendered with `kbqTooltipContext` as its `$implicit` value. A context other than `null` or `undefined` SHALL be passed even when falsy, such as `0`. Changing the content or the context while the tooltip is open SHALL update the open tooltip.

#### Scenario: Template with a context

- **WHEN** `kbqTooltip` is a template that renders `ctx.content` and `kbqTooltipContext` is `{ content: 'TestContent' }`
- **THEN** the tooltip shows "TestContent"

#### Scenario: Falsy context

- **WHEN** `kbqTooltipContext` is `0` and the template renders its `$implicit` value
- **THEN** the tooltip shows "0"

### Requirement: Header

`kbqTooltipHeader`, a string or a `TemplateRef` rendered with the same context as the content, SHALL be shown above the content in an element with the class `kbq-tooltip__header`, whatever `kbqTooltipModifier` is. Changing it while the tooltip is open SHALL update the open tooltip, and an empty or `undefined` value SHALL remove the header.

#### Scenario: Header changed while open

- **WHEN** the tooltip is open with the header "initial header" and `kbqTooltipHeader` becomes "updated header"
- **THEN** the header shows "updated header"

#### Scenario: Header removed

- **WHEN** the tooltip is open with a header and `kbqTooltipHeader` changes to `undefined`
- **THEN** the tooltip has no `kbq-tooltip__header` element

### Requirement: Modifier

`kbqTooltipModifier` SHALL accept `default`, the default, `warning` and `extended`, and SHALL put the class `kbq-tooltip_<modifier>` on the tooltip element. Changing it while the tooltip is open SHALL update the class of the open tooltip.

#### Scenario: Modifier changed while open

- **WHEN** the tooltip is open with the default modifier and `kbqTooltipModifier` becomes `warning`
- **THEN** the tooltip element has the class `kbq-tooltip_warning`

### Requirement: Custom classes

`kbqTooltipClass` SHALL add its whitespace-separated class names to the tooltip element, next to the placement, color and modifier classes.

#### Scenario: Two classes

- **WHEN** `kbqTooltipClass` is `"wide dark"` and the tooltip opens
- **THEN** the tooltip element has the classes `wide` and `dark`

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

### Requirement: Showing for a mouse event

`showForMouseEvent(event)` SHALL anchor the tooltip to the event's `currentTarget`, from then on, and open it as if hovered, positioned at the pointer's horizontal position for the `top` and `bottom` placements. Re-anchoring an open tooltip SHALL move its `aria-describedby` entry to the new element. Without content it MUST NOT attach an overlay.

#### Scenario: Tooltip shared by table cells

- **WHEN** a tooltip shown for cell A is shown for cell B in the same pointer move
- **THEN** cell B lists the tooltip in `aria-describedby` and cell A no longer does

#### Scenario: Shared tooltip without content

- **WHEN** the shared tooltip has empty content and is shown for a cell
- **THEN** no tooltip is rendered, and once content is set it shows for the next cell

### Requirement: Tooltip semantics

The tooltip element SHALL have `role="tooltip"` and a unique `id`. With a tooltip open, neither the trigger nor the overlay SHALL have axe violations.

#### Scenario: Open tooltip

- **WHEN** a tooltip opens
- **THEN** its element has `role="tooltip"` and a non-empty `id`
- **AND** axe reports no violations for the page and the overlay container

### Requirement: Trigger described by the tooltip

While the tooltip is open, the trigger element SHALL list the tooltip's `id` in its `aria-describedby`, keeping the ids already there, and SHALL drop it when the tooltip closes or the directive is destroyed. A string tooltip whose trimmed text equals the trigger's own trimmed text MUST NOT be added.

#### Scenario: Open and close

- **WHEN** the tooltip opens and then closes
- **THEN** the trigger's `aria-describedby` is the tooltip's `id` while it is open and absent afterwards

#### Scenario: Existing description

- **WHEN** the trigger has `aria-describedby="external-hint"` and the tooltip opens
- **THEN** it reads `external-hint` followed by the tooltip's `id`, and `external-hint` again after the tooltip closes

#### Scenario: Tooltip repeating the label

- **WHEN** a trigger with the text "Self" has the tooltip "Self" and it opens
- **THEN** the trigger has no `aria-describedby`

### Requirement: Reduced motion

The tooltip SHALL animate in, and MUST NOT animate when the user prefers reduced motion or animations are turned off for the application through `KBQ_ANIMATIONS_CONFIG` or the noop animations module. Closing SHALL never animate.

#### Scenario: Reduced motion preferred

- **WHEN** the system prefers reduced motion and a tooltip opens
- **THEN** it appears without the entrance animation

### Requirement: Destroying the trigger

Destroying the directive while its tooltip is open or about to close SHALL remove the tooltip, cancel its pending show and hide, drop its entry from the trigger's `aria-describedby` and release its place in the one-at-a-time rule.

#### Scenario: Destroyed during the leave delay

- **WHEN** the pointer has left the trigger and the directive is destroyed 500 ms into a 1000 ms leave delay
- **THEN** no tooltip element remains after the pending timers run

#### Scenario: Destroyed while open

- **WHEN** the directive of an open tooltip is destroyed
- **THEN** the trigger element has no `aria-describedby` and no tooltip counts as visible
