# Spec Delta

## Purpose

Describes what `kbqPopover` and `kbqPopoverConfirm` from `@koobiq/components/popover` guarantee to consumers: how the panel is filled, sized and positioned next to its trigger, which events open and close it, and how it behaves for pointer, keyboard and assistive-technology users.

## ADDED Requirements

### Requirement: Popover trigger directive

The `kbqPopover` attribute directive SHALL turn its host element into a popover trigger that opens a panel in an overlay next to the host. The directive SHALL be standalone, SHALL also be available through `KbqPopoverModule`, and SHALL be exported as `kbqPopover` for template references.

#### Scenario: Closing from inside the panel through a template reference

- **WHEN** a button carries `kbqPopover` and `#popover="kbqPopover"`, and a footer button calls `popover.hide(0)`
- **THEN** clicking the footer button closes the popover

### Requirement: Header, content and footer

The panel SHALL render `kbqPopoverHeader`, `kbqPopoverContent` and `kbqPopoverFooter`, each a string or a `TemplateRef`, from top to bottom in the elements `.kbq-popover__header`, `.kbq-popover__content` and `.kbq-popover__footer`. A part whose value is empty MUST NOT be rendered.

#### Scenario: String parts

- **WHEN** the three inputs are strings and the popover opens
- **THEN** the header, content and footer elements show those strings

#### Scenario: Part left empty

- **WHEN** only `kbqPopoverContent` is set and the popover opens
- **THEN** the panel has no header and no footer element

### Requirement: Template context

A part given as a template SHALL be rendered with `kbqPopoverContext` as its `$implicit` value. Falsy contexts such as `0`, `''` and `false` SHALL be passed as they are; a `null` or `undefined` context SHALL leave the templates without one.

#### Scenario: Object context

- **WHEN** the header, content and footer are templates reading `ctx.header`, `ctx.content` and `ctx.footer` from `let-ctx`, and `kbqPopoverContext` is an object with those keys
- **THEN** each part shows its value from the context

#### Scenario: Falsy context

- **WHEN** `kbqPopoverContext` is `0`
- **THEN** the templates receive `0` as `$implicit`

### Requirement: Inputs changed while open

Changing the header, content, footer, context, accessible name or close-button input of an open popover SHALL update the open panel without closing it, and SHALL re-apply the panel's position.

#### Scenario: Header removed while open

- **WHEN** the popover is open with a string header and the header binding changes to `undefined`
- **THEN** the header element is removed and the panel stays open

### Requirement: Preset sizes

`kbqPopoverSize` SHALL accept `small`, `medium`, `large` and `custom`, `medium` by default, and SHALL put the class `kbq-popover_<size>` on the panel. The first three SHALL set preset widths (200, 400 and 640 px by default); `custom` SHALL leave the width to the consumer. An unknown value SHALL log a console warning and fall back to `medium`.

#### Scenario: Large size

- **WHEN** `kbqPopoverSize` is `large` and the popover opens
- **THEN** the panel has the class `kbq-popover_large`

#### Scenario: Unknown size

- **WHEN** `kbqPopoverSize` is `huge`
- **THEN** a warning is logged and the open panel has the class `kbq-popover_medium`

### Requirement: Long content scrolls

The panel SHALL be limited to a maximum height (480 px by default) and SHALL scroll only its content area, keeping the header and the footer in place. While content is hidden above the visible part, the header SHALL show an overflow shadow; while content is hidden below it, the footer SHALL.

#### Scenario: Content overflows on open

- **WHEN** a popover with a header, a footer and long content opens
- **THEN** the footer shows an overflow shadow

#### Scenario: Content scrolled to the middle

- **WHEN** the content is scrolled halfway down
- **THEN** both the header and the footer show an overflow shadow

### Requirement: Custom scrollbar in the content

The content area SHALL hide the native scrollbar and use the library's custom scrollbar. When the panel has opened with overflowing content, the scrollbar track SHALL flash once and fade out; content that fits SHALL show no scrollbar.

#### Scenario: Overflowing content

- **WHEN** a popover with long content opens
- **THEN** the track is shown and then fades out
- **AND** hovering the content shows the track again

#### Scenario: Short content

- **WHEN** a popover with content that fits opens
- **THEN** no scrollbar is shown

### Requirement: Default paddings

The header, content and footer SHALL have default paddings while `kbqPopoverDefaultPaddings` is `true`, the default. Setting it to `false` SHALL remove them, so that the consumer sets padding inside their own templates.

#### Scenario: Paddings turned off

- **WHEN** `[kbqPopoverDefaultPaddings]="false"` is bound and the popover opens
- **THEN** the content element does not have the class `kbq-popover__content_default-paddings`

### Requirement: Arrow

The panel SHALL draw an arrow pointing at the trigger by default. With `kbqPopoverArrow` set to `false`, the panel MUST NOT render the arrow element `.kbq-popover__arrow`. Hiding the arrow MUST NOT change the distance between the trigger and the panel.

#### Scenario: Arrow hidden

- **WHEN** `[kbqPopoverArrow]="false"` is bound and the popover opens
- **THEN** the panel has no `.kbq-popover__arrow` element

### Requirement: Arrow alignment on small triggers

While the arrow is shown and the trigger is narrower, or shorter, than twice the arrow's inset (34 px), a placement aligned to an edge of the trigger SHALL shift the panel so that the arrow still points at the trigger. Larger triggers, and panels without an arrow, MUST NOT be shifted.

#### Scenario: Small trigger

- **WHEN** the trigger is 33 px wide and high and the popover opens
- **THEN** the edge-aligned candidate positions carry an offset that moves the arrow onto the trigger

#### Scenario: Large trigger

- **WHEN** the trigger is 100 px wide and high
- **THEN** no candidate position carries an offset

### Requirement: Distance from the trigger

The panel SHALL keep a gap of `kbqPopoverOffset` pixels, 8 by default (`defaultOffsetYWithArrow`), on the side that faces the trigger. The gap SHALL belong to the overlay pane, so that a pointer in it neither clicks through to the page nor counts as leaving a hover popover.

#### Scenario: Clicking in the gap

- **WHEN** the popover is open below its trigger and the user points at the middle of the gap
- **THEN** the point belongs to the overlay pane and not to the page or to the panel's content

#### Scenario: Pointer resting in the gap of a hover popover

- **WHEN** the pointer moves from the trigger of a hover popover into the gap and stays there longer than the leave delay
- **THEN** the popover stays open

### Requirement: Placement

`kbqPopoverPlacement` SHALL accept `top`, `topLeft`, `topRight`, `right`, `rightTop`, `rightBottom`, `bottom`, `bottomLeft`, `bottomRight`, `left`, `leftTop` and `leftBottom`, `top` by default. The panel SHALL have the class `kbq-popover_placement-<placement>` for the placement in effect, in kebab case. An unknown value SHALL log a console warning and fall back to `top`.

#### Scenario: Each placement

- **WHEN** the popover opens with each of the twelve placements in turn
- **THEN** the panel has the matching class, for example `kbq-popover_placement-right-top` for `rightTop`

#### Scenario: Unknown placement

- **WHEN** `kbqPopoverPlacement` is `nowhere`
- **THEN** a warning is logged and the open panel has the class `kbq-popover_placement-top`

### Requirement: Placement fallback

When the preferred placement does not fit, the panel SHALL take another placement from a fixed fallback list for that preference, and SHALL be pushed back into the viewport when none fits. `kbqPopoverPlacementPriority`, a placement or an array of placements, SHALL replace that list with the given placements in the given order, ignoring unknown names; an empty value SHALL restore the default list.

#### Scenario: Placement priority list

- **WHEN** `kbqPopoverPlacementPriority` is `['bottom', 'top']` and the popover opens
- **THEN** only those two placements are tried, `bottom` first

### Requirement: Placement change event

`kbqPopoverPlacementChange` SHALL emit the placement the panel actually took each time its position is resolved, and the panel's placement class SHALL follow it.

#### Scenario: Panel flips to another placement

- **WHEN** the position strategy resolves the open panel to the right of the trigger, aligned to its top
- **THEN** `kbqPopoverPlacementChange` emits `rightTop` and the panel has the class `kbq-popover_placement-right-top`

### Requirement: Following the page scroll

By default an open popover SHALL stay open while the page or a scrollable ancestor scrolls, and SHALL be repositioned to follow its trigger, unless one of the closing-on-scroll rules applies. A scroll inside the panel MUST NOT close it. The scroll strategy SHALL be replaceable through the `KBQ_POPOVER_SCROLL_STRATEGY` token.

#### Scenario: Page scroll

- **WHEN** a popover with default settings is open and the page scrolls
- **THEN** the popover stays open next to its trigger

### Requirement: Closing on scroll

With `kbqPopoverCloseOnScroll` set to `true`, a scroll of the page or of any scrollable ancestor of the trigger SHALL close the popover, while a scroll inside the panel MUST NOT.

#### Scenario: Page scroll

- **WHEN** `kbqPopoverCloseOnScroll` is `true` and the document scrolls while the popover is open
- **THEN** the popover closes

#### Scenario: Scrolling the panel's own content

- **WHEN** `kbqPopoverCloseOnScroll` is `true` and the user scrolls the content area of the open panel
- **THEN** the popover stays open

#### Scenario: Turned off

- **WHEN** `kbqPopoverCloseOnScroll` is `false` and the document scrolls while the popover is open
- **THEN** the popover stays open

### Requirement: Nested-popup containers

While `kbqPopoverCloseOnScroll` is left unbound, a scroll of a `cdkScrollable` container with the class `kbq-hide-nested-popup` SHALL close the popover once its trigger is entirely above or below that container. Once `kbqPopoverCloseOnScroll` is bound, to any value, this rule MUST NOT apply.

#### Scenario: Trigger scrolled out of a marked container

- **WHEN** the trigger of an open popover is inside a scrollable `kbq-hide-nested-popup` container and that container scrolls the trigger out of view
- **THEN** the popover closes

#### Scenario: Bound to false

- **WHEN** `[kbqPopoverCloseOnScroll]="false"` is bound and the same scroll happens
- **THEN** this rule does not close the popover

### Requirement: Closing when the trigger leaves its scroll container

While `kbqPopoverHideIfNotInViewPort` is `true`, the default, a scroll of the nearest `cdkScrollable` ancestor of the trigger SHALL close the popover once the trigger no longer intersects that ancestor's box. With `false` the popover SHALL stay open; a bound `null` or `undefined` SHALL restore `true`. The rule SHALL apply whatever `kbqPopoverCloseOnScroll` is.

#### Scenario: Trigger scrolled out of its container

- **WHEN** the trigger sits in a `cdkScrollable` container and the container scrolls it fully out of its box while the popover is open
- **THEN** the popover closes

#### Scenario: Rule turned off

- **WHEN** `[kbqPopoverHideIfNotInViewPort]="false"` is bound and the same scroll happens
- **THEN** the popover stays open and follows its trigger

### Requirement: Overlay layers

When the trigger is inside an element marked `kbqOverlayLayer`, the panel SHALL be rendered into that element's overlay layer, so that it slides under sticky bars while the content scrolls. A popover with `kbqPopoverStickToWindow` set SHALL stay in the application-wide overlay container.

#### Scenario: Trigger inside a layer

- **WHEN** a popover whose trigger is inside a `kbqOverlayLayer` element opens
- **THEN** its overlay is placed in that element's layer

#### Scenario: Popover stuck to a window edge

- **WHEN** the same popover has `kbqPopoverStickToWindow="top"` and opens
- **THEN** its overlay is placed in the application-wide overlay container

### Requirement: Sticking to a window edge

`kbqPopoverStickToWindow` set to `top`, `right`, `bottom` or `left` SHALL pin the panel to that edge of the window, or of the `kbqPopoverContainer` element when one is bound, and SHALL re-apply the pin after scrolling and resizing. A stuck panel MUST NOT draw the arrow, also after later input changes.

#### Scenario: Arrow of a stuck panel

- **WHEN** `kbqPopoverStickToWindow` is `right`, the popover opens and its content is changed afterwards
- **THEN** the panel has no arrow element, before and after the change

#### Scenario: Pinned to the window

- **WHEN** `kbqPopoverStickToWindow` is `right` and no container is bound
- **THEN** the overlay pane touches the right edge of the window

### Requirement: Close button

With `kbqPopoverHasCloseButton` set, the panel SHALL render an icon-only close button in its top corner, named by `a11y.close` of the active locale. Activating it SHALL close the popover at once, also while the pointer rests on the panel of a hover popover, unless `kbqPopoverPreventClose` is set.

#### Scenario: Clicking the close button

- **WHEN** a popover with a close button is open and the user clicks the close button
- **THEN** the popover closes

#### Scenario: Close button of a hover popover

- **WHEN** a hover popover with a close button is open, the pointer has moved onto the panel and the user clicks the close button
- **THEN** the popover closes

### Requirement: Confirmation popover

The `kbqPopoverConfirm` directive, exported as `kbqPopoverConfirm`, SHALL open a panel with a question and a single confirm button, and SHALL accept every input and output of `kbqPopover`. Its panel SHALL have the classes `kbq-popover` and `kbq-popover-confirm`, and MUST NOT render a header, a footer, `kbqPopoverContent` or a close button.

#### Scenario: Opening a confirmation popover

- **WHEN** the user clicks a button with `kbqPopoverConfirm`
- **THEN** a `.kbq-popover-confirm` panel opens with the question and one button

#### Scenario: Other trigger events

- **WHEN** a `kbqPopoverConfirm` host has `kbqTrigger="hover"` and the pointer moves onto it
- **THEN** the confirmation panel opens without an error

### Requirement: Confirmation texts

The question SHALL come from `kbqPopoverConfirmText`, else from the `KBQ_POPOVER_CONFIRM_TEXT` token, else from `popoverConfirm.confirmText` of the active locale. The button caption SHALL come from `kbqPopoverConfirmButtonText`, `KBQ_POPOVER_CONFIRM_BUTTON_TEXT` and `popoverConfirm.confirmButtonText` in the same order. A binding changed to `undefined` SHALL fall back again.

#### Scenario: Locale defaults

- **WHEN** neither input nor token is set and the locale is `ru-RU`
- **THEN** the panel shows the `ru-RU` question and button caption

#### Scenario: Provided texts

- **WHEN** both tokens are provided and the inputs are not bound
- **THEN** the panel shows the provided texts

#### Scenario: Input wins

- **WHEN** `kbqPopoverConfirmText="new confirm text"` is set
- **THEN** the panel shows "new confirm text"

#### Scenario: Binding back to undefined

- **WHEN** both inputs are bound to custom texts and then to `undefined`
- **THEN** the panel shows the locale texts

### Requirement: Confirmation texts follow the locale

Texts that come from the locale SHALL follow a switch of the active locale, also while the panel is open.

#### Scenario: Switching the locale while open

- **WHEN** a confirmation popover is open with the `ru-RU` texts and the application switches to `en-US`
- **THEN** the open panel shows the `en-US` question and button caption

### Requirement: Confirming

Pressing the confirm button SHALL emit `confirm` exactly once and then close the popover, unless `kbqPopoverPreventClose` is set. Inputs written while the panel is open MUST NOT make one press emit more than once.

#### Scenario: Confirming after an input change

- **WHEN** the confirmation popover is open, its `kbqPopoverConfirmText` binding changes, and the user clicks the confirm button
- **THEN** `confirm` is emitted once and the panel closes

### Requirement: Custom origin

`kbqPopoverOrigin` SHALL position the panel against the given element, or against a rectangle in viewport coordinates such as one made by `kbqCreateCaretOrigin`, instead of the trigger; `null` SHALL anchor it back to the trigger. A new origin SHALL move an open panel at once, and one written while the popover is closed SHALL be used by its next open.

#### Scenario: Opening against a rectangle

- **WHEN** `kbqPopoverOrigin` is `{ x: 40, y: 80, width: 0, height: 16 }` and the popover opens
- **THEN** the panel is positioned against that rectangle

#### Scenario: Origin cleared

- **WHEN** the origin of an open popover changes to `null`
- **THEN** the panel is positioned against the trigger again

#### Scenario: Origin changed between two opens

- **WHEN** the popover has been opened and closed, and the origin changes while it is closed
- **THEN** the next open uses the new origin

### Requirement: Repositioning on request

`updatePosition(true)` SHALL re-apply the position of an open panel after the current task, for example after the anchor it follows has moved. A reposition requested in the same task as an outside click MUST NOT cancel the close that click caused.

#### Scenario: Reposition during an outside click

- **WHEN** a click popover is open, the user clicks outside it, and `updatePosition(true)` is called before the close has run
- **THEN** the popover still closes

### Requirement: Default trigger events

While `kbqTrigger` is unbound or empty, the popover SHALL open on a click on its host and on Enter or Space pressed on it, the value `click, keydown`. The keyboard SHALL open it on any focusable host, not only on buttons.

#### Scenario: Keyboard on a button

- **WHEN** a closed popover's button host has focus and the user presses Enter or Space
- **THEN** the popover opens

#### Scenario: Keyboard on another element

- **WHEN** the host is a `div` with `tabindex="0"` and the user presses Enter or Space on it
- **THEN** the popover opens

### Requirement: Trigger events

`kbqTrigger` SHALL take a comma-separated list of `click`, `keydown`, `hover` and `focus`, and SHALL bind only the listeners for the names it contains. A value that names none of them, such as `manual`, SHALL bind no listener, leaving the popover to be opened and closed in code. The input is shared with `kbqTooltip`, so on an element that carries both it SHALL configure both.

#### Scenario: Manual popover

- **WHEN** `kbqTrigger` is `manual`
- **THEN** clicking, hovering or focusing the host does not open the popover, and `kbqPopoverVisible` does

### Requirement: Hover trigger

With `hover` in `kbqTrigger`, moving the pointer onto the host SHALL open the popover. When the pointer leaves the host, the popover SHALL close after the leave delay unless the pointer has moved onto the panel or back onto the host. While the pointer rests on the panel it SHALL stay open, and it SHALL close once the pointer has left the panel too.

#### Scenario: Pointer leaves the host

- **WHEN** a hover popover is open and the pointer leaves the host without reaching the panel
- **THEN** the popover is still open 1 ms before the leave delay has passed, and closes after it

#### Scenario: Pointer moves onto the panel

- **WHEN** the pointer leaves the host and enters the panel
- **THEN** the popover stays open for as long as the pointer rests on the panel

### Requirement: Focus trigger

With `focus` in `kbqTrigger`, focusing the host SHALL open the popover and blurring the host SHALL close it.

#### Scenario: Focus and blur

- **WHEN** the host of a focus popover gains focus and then loses it
- **THEN** the popover opens and then closes

### Requirement: Enter and leave delays

`kbqEnterDelay` and `kbqLeaveDelay` SHALL set the delays before opening and before closing in milliseconds, and SHALL accept numbers and numeric strings. Both SHALL default to `0`, except that a popover whose `kbqTrigger` includes `hover` SHALL use a leave delay of 500 ms (`defaultHoverLeaveDelay`) while `kbqLeaveDelay` is not bound. An explicit `0` SHALL be honoured.

#### Scenario: Static attribute

- **WHEN** `kbqLeaveDelay="0"` is written as a static attribute
- **THEN** the leave delay is the number `0`

#### Scenario: Hover popover with a zero leave delay

- **WHEN** a hover popover has `kbqLeaveDelay="0"` and the pointer leaves its host
- **THEN** the popover closes without waiting 500 ms

### Requirement: Opening and closing in code

`kbqPopoverVisible` SHALL open the popover when it becomes `true` and close it when it becomes `false` or `undefined`. `show(delay?)` and `hide(delay?)` SHALL open and close it after the given delay, by default the enter and the leave delay respectively.

#### Scenario: Visibility binding

- **WHEN** a manual popover's `kbqPopoverVisible` changes to `true` and later to `false`
- **THEN** the popover opens and then closes

#### Scenario: Visibility binding changed to undefined

- **WHEN** an open popover's `kbqPopoverVisible` binding changes to `undefined`
- **THEN** the popover closes

### Requirement: Visibility events

`kbqPopoverVisibleChange` SHALL emit `true` when the panel has become visible and `false` when it has closed, exactly once per change, over any number of open and close cycles. The trigger's `isOpen` SHALL follow the same state.

#### Scenario: Three open and close cycles

- **WHEN** the user opens the popover and closes it with an outside click three times
- **THEN** `kbqPopoverVisibleChange` emits `true`, `false`, `true`, `false`, `true`, `false`

### Requirement: Outside click closes a click popover

When `kbqTrigger` includes `click`, a click outside the open panel and outside any overlay opened after it, including a click on its host, SHALL close the popover. When it does not, as with `hover`, `focus` or `manual`, a click outside MUST NOT close the popover.

#### Scenario: Click elsewhere on the page

- **WHEN** a click popover is open and the user clicks the page outside it
- **THEN** the popover closes

#### Scenario: Manual popover

- **WHEN** a manual popover is open and the user clicks the page outside it
- **THEN** the popover stays open

### Requirement: Escape on the trigger

While the popover is open, Escape pressed on its host SHALL close it and SHALL prevent the key's default action, so that an enclosing modal stays open. An Escape whose default action was already prevented, or one pressed while `kbqPopoverPreventClose` is set, MUST NOT close the popover and SHALL be left to the enclosing container.

#### Scenario: Escape after opening with the keyboard

- **WHEN** the popover was opened with Enter and the user presses Escape on its host
- **THEN** the popover closes

#### Scenario: Inside a modal

- **WHEN** a focus popover inside a modal is open and the user presses Escape on its host
- **THEN** the popover closes and the modal stays open
- **AND** a second Escape closes the modal

#### Scenario: Close prevented inside a modal

- **WHEN** the same popover has `kbqPopoverPreventClose` set and the user presses Escape on its host
- **THEN** the modal starts closing

### Requirement: Escape inside the panel

Escape pressed inside the open panel SHALL close the popover at once, also while the pointer rests on the panel of a hover popover, and SHALL prevent the key's default action, so that an enclosing modal stays open. An Escape already spent by a control inside the panel, or one pressed while `kbqPopoverPreventClose` is set, MUST NOT close it.

#### Scenario: Pointer on the panel of a hover popover

- **WHEN** the pointer rests on the panel of a hover popover and the user presses Escape inside the panel
- **THEN** the popover closes

#### Scenario: Panel in an overlay layer of a modal

- **WHEN** a popover inside a modal is open and the user presses Escape inside its panel
- **THEN** the popover closes and the modal stays open

### Requirement: Backdrop

With `kbqPopoverHasBackdrop` set, the popover SHALL render a backdrop behind the panel with the class given by `kbqPopoverBackdropClass`, `cdk-overlay-transparent-backdrop` by default. When `kbqTrigger` includes `click`, a click on the backdrop SHALL close the popover. A backdrop setting changed while the popover is closed SHALL apply from its next open.

#### Scenario: Clicking the backdrop

- **WHEN** a click popover with `kbqPopoverHasBackdrop` and `kbqPopoverBackdropClass="test-backdrop"` is open and the user clicks the backdrop
- **THEN** the backdrop had the class `test-backdrop` and the popover closes

#### Scenario: Backdrop enabled after the first open

- **WHEN** the popover has been opened and closed once without a backdrop, `kbqPopoverHasBackdrop` is then set, and it opens again
- **THEN** a backdrop is rendered

### Requirement: Preventing the close

While `kbqPopoverPreventClose` is set, an outside click, Escape on the host or in the panel, the close button, the confirm button, `close()`, `hide()`, `kbqPopoverVisible` set to `false`, a touch on the host, a closing scroll and disabling the popover MUST NOT close an open popover.

#### Scenario: Outside click and Escape

- **WHEN** `kbqPopoverPreventClose` is set on an open popover and the user clicks outside it and then presses Escape in the panel
- **THEN** the popover stays open

### Requirement: Disabled popover

While `kbqPopoverDisabled` is set, the popover MUST NOT open, and setting it SHALL close a popover that is open.

#### Scenario: Disabling an open popover

- **WHEN** the popover is open and `kbqPopoverDisabled` becomes `true`
- **THEN** the popover closes

#### Scenario: Clicking a disabled trigger

- **WHEN** `kbqPopoverDisabled` is set and the user clicks the host
- **THEN** the popover does not open

### Requirement: Touch on the trigger

A touch that ends on the host SHALL close an open popover.

#### Scenario: Touch ends on the host

- **WHEN** the popover is open and a touch on its host ends
- **THEN** the popover closes

### Requirement: Deliberate close

`close()` SHALL close the popover at once, without the leave delay and also while the pointer rests on the panel of a hover popover, unless `kbqPopoverPreventClose` is set.

#### Scenario: Closing a hover popover in code

- **WHEN** the pointer rests on the panel of an open hover popover and `close()` is called
- **THEN** the popover closes without waiting for the leave delay

### Requirement: Clean-up on destroy

Destroying the trigger while its popover is open SHALL remove the panel and leave nothing in the overlay container.

#### Scenario: Host destroyed while open

- **WHEN** the component holding an open popover is destroyed
- **THEN** the overlay container is empty

### Requirement: Coexisting with a tooltip

When the host also carries `kbqTooltip`, opening the popover SHALL hide the tooltip, and the tooltip MUST NOT reappear while the popover is open, nor because the closing popover returns focus to the host. After the popover has closed, by Escape or by an outside click, the pointer leaving and re-entering the host SHALL show the tooltip again.

#### Scenario: Popover opened over a tooltip

- **WHEN** the tooltip is shown on hover and the user clicks the host
- **THEN** the popover opens and the tooltip is hidden

#### Scenario: Closing with Escape

- **WHEN** the popover is closed with Escape and focus returns to the host
- **THEN** the tooltip does not reappear, even after its enter delay

#### Scenario: Pointer comes back

- **WHEN** after the popover has closed the pointer leaves the host and enters it again
- **THEN** the tooltip is shown

### Requirement: Use from signal effects

Opening the popover, closing it or writing one of its inputs from inside an Angular `effect()` MUST NOT make that effect run again when the popover opens or closes, or when the active locale changes.

#### Scenario: Popover opened by an effect

- **WHEN** an effect calls `show(0)` and the popover is later closed with `hide(0)`
- **THEN** the effect has run once

#### Scenario: Confirmation content written by an effect

- **WHEN** an effect writes the content of an open confirmation popover and the locale changes afterwards
- **THEN** the effect does not run again

### Requirement: Trigger semantics for click popovers

When `kbqTrigger` includes `click`, the host SHALL have `aria-haspopup="dialog"` and an `aria-expanded` that follows the popover, and SHALL have an `aria-controls` equal to the panel's id only while the popover is open. Without `click`, the host MUST NOT get any of these attributes.

#### Scenario: Opening and closing

- **WHEN** a click popover is closed, then opened, then closed again
- **THEN** the host has `aria-expanded="false"` and no `aria-controls`, then `aria-expanded="true"` and `aria-controls` equal to the panel's id, then `aria-expanded="false"` and no `aria-controls`

#### Scenario: Manual popover

- **WHEN** `kbqTrigger` is `manual`
- **THEN** the host has neither `aria-haspopup` nor `aria-expanded`

### Requirement: Accessible name of the panel

The panel SHALL have a unique id. With a string header it SHALL have `role="dialog"` and be named by the header text through `aria-labelledby`. Otherwise `kbqPopoverAriaLabel` SHALL name it through `aria-label`, also when the header is a template. A panel with no name MUST NOT have a `role`.

#### Scenario: String header

- **WHEN** the popover with a string header opens
- **THEN** the panel has `role="dialog"` and an `aria-labelledby` equal to the id of the header text

#### Scenario: Template header with an accessible name

- **WHEN** the header is a template and `kbqPopoverAriaLabel` is "ARIA LABEL"
- **THEN** the panel has `aria-label="ARIA LABEL"` and no `aria-labelledby`

#### Scenario: Nothing names the panel

- **WHEN** the popover has no header and no `kbqPopoverAriaLabel`
- **THEN** the panel has no `role` attribute

### Requirement: Confirmation panel semantics

The confirmation panel SHALL always have `role="dialog"` and SHALL be named by its question through `aria-label`.

#### Scenario: Confirmation panel

- **WHEN** a confirmation popover opens with the question "Delete the report?"
- **THEN** its panel has `role="dialog"` and `aria-label="Delete the report?"`

### Requirement: Focus moves into the panel

When the popover is opened by a click, by the keyboard or in code and `kbqPopoverAutoFocus` is `true`, the default, focus SHALL move to the first tabbable element of the panel, if it has one. A popover opened by hover or focus MUST NOT move focus, unless its `kbqTrigger` also includes `click`. With `kbqPopoverAutoFocus` set to `false`, opening MUST NOT move focus.

#### Scenario: Opened in code

- **WHEN** a manual popover whose content holds a button is opened through `kbqPopoverVisible`
- **THEN** focus moves to that button

#### Scenario: Opened by hover

- **WHEN** focus is on another element and the pointer opens a hover popover
- **THEN** focus stays on that element

#### Scenario: Keyboard after a hover

- **WHEN** a popover with `kbqTrigger="hover, keydown"` was opened and closed by the pointer, and is then opened with Enter
- **THEN** opening moves focus into the panel

#### Scenario: Auto focus turned off

- **WHEN** `[kbqPopoverAutoFocus]="false"` is bound and the popover opens in code
- **THEN** focus is not moved

### Requirement: Focus stays in the panel

While the popover is open and focus is in the panel, Tab and Shift+Tab SHALL cycle through the tabbable elements of the panel instead of leaving it, unless `kbqTrigger` is exactly `focus`.

#### Scenario: Tabbing past the last element

- **WHEN** focus is on the last tabbable element of an open click popover and the user presses Tab
- **THEN** focus moves to the first tabbable element of the panel

### Requirement: Focus returns to the trigger

When the popover closes, by any path, while focus is inside its panel, focus SHALL return to the host. When focus is elsewhere, closing MUST NOT move it.

#### Scenario: Close button

- **WHEN** focus is on the close button and the user clicks it
- **THEN** the popover closes and the host has focus

#### Scenario: Focus already outside

- **WHEN** the user has moved focus to another element and then clicks outside the popover
- **THEN** the popover closes and focus stays on that element

### Requirement: Scrollable content region

When the content area overflows, it SHALL be a tab stop (`tabindex="0"`) so that keyboard users can scroll it, and, with a string header, a `region` named by the header. Content that fits MUST NOT add a tab stop.

#### Scenario: Overflowing content with a header

- **WHEN** a popover with a string header and long content opens
- **THEN** the content area has `tabindex="0"`, `role="region"` and an `aria-labelledby` equal to the id of the header text

#### Scenario: Short content

- **WHEN** the content fits in the panel
- **THEN** the content area has no `tabindex`

### Requirement: Accessibility checks

An open popover with a close button, whether or not it has a name, and an open confirmation popover SHALL pass the axe checks that do not need rendering.

#### Scenario: Unnamed popover

- **WHEN** a popover without a header and without `kbqPopoverAriaLabel` is open with a close button
- **THEN** axe reports no violations for the overlay container

### Requirement: Trigger host classes

The host SHALL have the class `kbq-popover_open` while its popover is open. When `kbqTrigger` includes `click`, it SHALL also have the class `kbq-active` while the popover is open; otherwise it MUST NOT.

#### Scenario: Click popover

- **WHEN** a click popover opens and then closes
- **THEN** the host has `kbq-active` while it is open and loses it after it closes

#### Scenario: Hover popover

- **WHEN** a hover popover has opened and closed
- **THEN** the host does not have `kbq-active`

### Requirement: Panel classes

The panel element SHALL have the class `kbq-popover`, the placement and size classes, and each class of the whitespace-separated `kbqPopoverClass`. The overlay pane holding it SHALL have the class `kbq-popover__panel`.

#### Scenario: Custom class

- **WHEN** `kbqPopoverClass` is `_TEST7` and the popover opens
- **THEN** the panel element has the class `_TEST7`

### Requirement: Localized strings

The strings the popover renders itself — the name of the close button (`a11y.close`) and the confirmation question and button caption (`popoverConfirm.confirmText`, `popoverConfirm.confirmButtonText`) — SHALL follow the active locale, `ru-RU` by default.

#### Scenario: Close button in English

- **WHEN** the application locale is `en-US` and a popover with a close button opens
- **THEN** the close button is named "Close"

### Requirement: Panel rendered without a trigger

`KbqPopoverComponent` rendered on its own, without a trigger, SHALL hide itself on Escape and MUST NOT throw.

#### Scenario: Escape on a stand-alone panel

- **WHEN** a `kbq-popover-component` is created without a trigger and receives Escape
- **THEN** no error is thrown

### Requirement: Bindings changed to undefined

A non-boolean input whose binding changes to `undefined` SHALL get its default back: `click, keydown` for `kbqTrigger`, `top` for the placement, `medium` for the size, 8 for the offset, `cdk-overlay-transparent-backdrop` for the backdrop class, `0` for the delays (500 ms leave delay with `hover`), and nothing for the header, content, footer, context, class, origin, placement priority, accessible name and window edge.

#### Scenario: Size binding reset

- **WHEN** `kbqPopoverSize` is bound to `large` and then to `undefined`
- **THEN** the size is `medium`

#### Scenario: Offset bound to null

- **WHEN** `kbqPopoverOffset` is bound to 20 and then to `null`
- **THEN** the offset is 8

### Requirement: Boolean inputs

`kbqPopoverArrow`, `kbqPopoverAutoFocus`, `kbqPopoverCloseOnScroll`, `kbqPopoverDefaultPaddings`, `kbqPopoverDisabled`, `kbqPopoverHasBackdrop`, `kbqPopoverHasCloseButton` and `kbqPopoverPreventClose` SHALL read a bare attribute as `true` and the string `"false"` as `false`. A bound `null` or `undefined` SHALL count as `false`, not as the input's default.

#### Scenario: Attribute written as a string

- **WHEN** a host has `kbqPopoverHasCloseButton="false"` and the popover opens
- **THEN** the panel has no close button

#### Scenario: Bare attributes

- **WHEN** a host has bare `kbqPopoverHasCloseButton` and `kbqPopoverHasBackdrop` attributes and the popover opens
- **THEN** the panel has a close button and a backdrop is rendered

#### Scenario: Arrow bound to undefined

- **WHEN** `[kbqPopoverArrow]="undefined"` is bound
- **THEN** the panel has no arrow
