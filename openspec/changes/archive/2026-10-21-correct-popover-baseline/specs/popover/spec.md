# popover Specification Delta

## MODIFIED Requirements

### Requirement: Arrow alignment on small triggers

While `kbqPopoverArrow` is `true` and the anchor — the trigger, or the `kbqPopoverOrigin` when one is set — is narrower, or shorter, than twice the arrow's inset (34 px), a placement aligned to an edge of the anchor SHALL shift the panel so that the arrow still points at it. Larger anchors, and panels with `kbqPopoverArrow` set to `false`, MUST NOT be shifted. A panel stuck to a window edge draws no arrow but is still shifted.

#### Scenario: Small trigger

- **WHEN** the trigger is 33 px wide and high and the popover opens
- **THEN** the edge-aligned candidate positions carry an offset that moves the arrow onto the trigger

#### Scenario: Large trigger

- **WHEN** the trigger is 100 px wide and high
- **THEN** no candidate position carries an offset

### Requirement: Distance from the trigger

The panel SHALL keep a gap of `kbqPopoverOffset` pixels, 8 by default (`defaultOffsetYWithArrow`), on the side that faces the trigger. A custom offset is written for the placement the panel has each time it is shown; after the placement of an open panel changes, the side that now faces the trigger has the stylesheet's 8 px until the panel is shown again. The gap SHALL belong to the overlay pane, so that a pointer in it neither clicks through to the page nor counts as leaving a hover popover.

#### Scenario: Clicking in the gap

- **WHEN** the popover is open below its trigger and the user points at the middle of the gap
- **THEN** the point belongs to the overlay pane and not to the page or to the panel's content

#### Scenario: Pointer resting in the gap of a hover popover

- **WHEN** the pointer moves from the trigger of a hover popover into the gap and stays there longer than the leave delay
- **THEN** the popover stays open

### Requirement: Placement fallback

When the preferred placement does not fit, the panel SHALL take another placement from a fixed fallback list for that preference, and SHALL be pushed back into the viewport when none fits. `kbqPopoverPlacementPriority`, a placement or an array of placements, SHALL replace that list with the given placements in the given order, skipping unknown names; with no known name, opening fails with an error of the CDK position strategy. An empty value SHALL restore the default list.

#### Scenario: Placement priority list

- **WHEN** `kbqPopoverPlacementPriority` is `['bottom', 'top']` and the popover opens
- **THEN** only those two placements are tried, `bottom` first

### Requirement: Following the page scroll

By default an open popover SHALL stay open while the page or a `cdkScrollable` ancestor scrolls, and SHALL be repositioned to follow its trigger, unless one of the closing-on-scroll rules applies. The scroll of an ancestor that is not a `cdkScrollable` is not seen, so the panel does not follow it. A scroll inside the panel MUST NOT close it. The scroll strategy SHALL be replaceable through the `KBQ_POPOVER_SCROLL_STRATEGY` token.

#### Scenario: Page scroll

- **WHEN** a popover with default settings is open and the page scrolls
- **THEN** the popover stays open next to its trigger

### Requirement: Closing on scroll

With `kbqPopoverCloseOnScroll` set to `true`, a scroll of the page or of a `cdkScrollable` ancestor of the trigger SHALL close the popover, while a scroll inside the panel MUST NOT. The scroll of an ancestor that is not a `cdkScrollable` is not seen and does not close it.

#### Scenario: Page scroll

- **WHEN** `kbqPopoverCloseOnScroll` is `true` and the document scrolls while the popover is open
- **THEN** the popover closes

#### Scenario: Scrolling the panel's own content

- **WHEN** `kbqPopoverCloseOnScroll` is `true` and the user scrolls the content area of the open panel
- **THEN** the popover stays open

#### Scenario: Turned off

- **WHEN** `kbqPopoverCloseOnScroll` is `false` and the document scrolls while the popover is open
- **THEN** the popover stays open

### Requirement: Overlay layers

When the trigger is inside an element marked `kbqOverlayLayer`, the panel SHALL be rendered into the overlay layer of the innermost such element, so that it slides under sticky bars while the content scrolls. The panel SHALL stay in the application-wide overlay container when `kbqPopoverStickToWindow` is set, when the trigger is inside a `kbqOverlayLayerExclude` element (as in `kbq-top-bar`) or another overlay container within that element, or when that element is outside the fullscreen element.

#### Scenario: Trigger inside a layer

- **WHEN** a popover whose trigger is inside a `kbqOverlayLayer` element opens
- **THEN** its overlay is placed in that element's layer

#### Scenario: Popover stuck to a window edge

- **WHEN** the same popover has `kbqPopoverStickToWindow="top"` and opens
- **THEN** its overlay is placed in the application-wide overlay container

### Requirement: Sticking to a window edge

`kbqPopoverStickToWindow` set to `top`, `right`, `bottom` or `left` SHALL pin the panel to that edge of the window, or of the `kbqPopoverContainer` element when one is bound. The pin SHALL be re-applied after a window resize and whenever `kbqPopoverPlacementChange` emits; a scroll that only re-applies the last position puts the panel back at its connected position. A stuck panel MUST NOT draw the arrow, also after later input changes.

#### Scenario: Arrow of a stuck panel

- **WHEN** `kbqPopoverStickToWindow` is `right`, the popover opens and its content is changed afterwards
- **THEN** the panel has no arrow element, before and after the change

#### Scenario: Pinned to the window

- **WHEN** `kbqPopoverStickToWindow` is `right`, no container is bound, the trigger is at least 34 px wide and the popover opens
- **THEN** the overlay pane touches the right edge of the window

### Requirement: Confirming

Pressing the confirm button SHALL emit `confirm` exactly once and then close the popover after the leave delay, unless `kbqPopoverPreventClose` is set. While the pointer, having left the host of a hover-triggered confirmation popover, rests on its panel, the button only emits: the popover closes once the pointer leaves the panel. Inputs written while the panel is open MUST NOT make one press emit more than once.

#### Scenario: Confirming after an input change

- **WHEN** the confirmation popover is open, its `kbqPopoverConfirmText` binding changes, and the user clicks the confirm button
- **THEN** `confirm` is emitted once and the panel closes

### Requirement: Trigger events

`kbqTrigger` SHALL take a comma-separated list of `click`, `keydown`, `hover` and `focus`, and SHALL bind only the listeners for the names it contains. A value that names none of them, such as `manual`, SHALL bind none of these listeners, leaving the popover to be opened in code; Escape, a touch on the host and the close button still close it. The input is shared with `kbqTooltip`, so on an element that carries both it SHALL configure both.

#### Scenario: Manual popover

- **WHEN** `kbqTrigger` is `manual`
- **THEN** clicking, hovering or focusing the host does not open the popover, and `kbqPopoverVisible` does

### Requirement: Opening and closing in code

`kbqPopoverVisible` SHALL open the popover when it becomes `true` and close it when it becomes `false` or `undefined`. `show(delay?)` and `hide(delay?)` SHALL open and close it after the given delay, by default the enter and the leave delay respectively. While the pointer, having left the host of a hover popover, rests on its panel, `hide()` and `kbqPopoverVisible` set to `false` do nothing; `close()` closes it then.

#### Scenario: Visibility binding

- **WHEN** a manual popover's `kbqPopoverVisible` changes to `true` and later to `false`
- **THEN** the popover opens and then closes

#### Scenario: Visibility binding changed to undefined

- **WHEN** an open popover's `kbqPopoverVisible` binding changes to `undefined`
- **THEN** the popover closes

### Requirement: Outside click closes a click popover

When `kbqTrigger` includes `click`, a click outside the open panel and outside any overlay opened after it, including a click on its host, SHALL close the popover. When it does not, as with `hover`, `focus` or `manual`, the click itself MUST NOT close the popover; a `focus` popover still closes when the click takes focus away from its host.

#### Scenario: Click elsewhere on the page

- **WHEN** a click popover is open and the user clicks the page outside it
- **THEN** the popover closes

#### Scenario: Manual popover

- **WHEN** a manual popover is open and the user clicks the page outside it
- **THEN** the popover stays open

### Requirement: Escape on the trigger

While the popover is open, Escape pressed on its host SHALL close it and SHALL prevent the key's default action, so that an enclosing modal stays open. An Escape whose default action was already prevented, one pressed while `kbqPopoverPreventClose` is set, or one pressed while the pointer, having left the host of a hover popover, rests on its panel, MUST NOT close the popover and SHALL be left to the enclosing container.

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

### Requirement: Disabled popover

While `kbqPopoverDisabled` is set, the popover MUST NOT open, and setting it SHALL close a popover that is open, except while the pointer, having left the host of a hover popover, rests on its panel: the popover then closes once the pointer leaves the panel.

#### Scenario: Disabling an open popover

- **WHEN** the popover is open and `kbqPopoverDisabled` becomes `true`
- **THEN** the popover closes

#### Scenario: Clicking a disabled trigger

- **WHEN** `kbqPopoverDisabled` is set and the user clicks the host
- **THEN** the popover does not open

### Requirement: Focus returns to the trigger

When the popover closes while focus is inside its panel, focus SHALL return to the host. When focus is elsewhere, closing MUST NOT move it. An overlay detached directly by a scroll strategy provided through `KBQ_POPOVER_SCROLL_STRATEGY`, such as the CDK close strategy, takes the panel away without returning focus.

#### Scenario: Close button

- **WHEN** focus is on the close button and the user clicks it
- **THEN** the popover closes and the host has focus

#### Scenario: Focus already outside

- **WHEN** the user has moved focus to another element and then clicks outside the popover
- **THEN** the popover closes and focus stays on that element
