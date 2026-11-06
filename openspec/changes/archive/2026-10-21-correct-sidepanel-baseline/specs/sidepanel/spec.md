# sidepanel Specification Delta

## MODIFIED Requirements

### Requirement: Header title truncation

By default (`truncateText` `true`) the header SHALL carry the class `kbq-sidepanel-header_truncate-text` and keep the title on one line, cut with an ellipsis. A title cut this way SHALL show its full text in a tooltip on hover. The title element cannot take keyboard focus, so a keyboard user gets no such tooltip. With `truncateText` `false` the title SHALL wrap.

#### Scenario: Long title

- **WHEN** the title is longer than the header and the user hovers it
- **THEN** the title stays on one line and a tooltip shows the full text

#### Scenario: Tabbing past a cut title

- **WHEN** the title is cut and the user moves through the sidepanel with Tab
- **THEN** focus never lands on the title and no tooltip opens

### Requirement: Open sidepanels list

`openedSidepanels` SHALL list the open sidepanels in the order they were opened. A closing sidepanel SHALL stay in the list until its exit transition ends. It SHALL be gone from the list when `afterClosed()` notifies a subscriber added after `open()` returned; a subscriber that the content added while it was being created, in a constructor or a field initializer, is notified first and still finds the sidepanel in the list.

#### Scenario: During the exit

- **WHEN** two sidepanels are open and `closeAll()` is called
- **THEN** `openedSidepanels` still holds both, in their original order, right after the call
- **AND** it is empty once the exit transitions have ended

#### Scenario: Subscriber added after open

- **WHEN** the application subscribes to `afterClosed()` of the ref `open()` returned and the sidepanel closes
- **THEN** the subscriber no longer finds the sidepanel in `openedSidepanels`

#### Scenario: Subscriber added by the content

- **WHEN** the content component subscribes to `afterClosed()` of its injected ref in its constructor and the sidepanel closes
- **THEN** that subscriber still finds the sidepanel in `openedSidepanels`

### Requirement: Page scroll under a sidepanel

By default, a sidepanel with a backdrop SHALL block the page scroll with the CDK block strategy, which engages only if the page overflows and is not blocked yet, and a sidepanel without one SHALL leave the page scrollable. The `scrollStrategy` option SHALL replace this default with the strategy its factory returns. When a sidepanel with a backdrop closes and none with a backdrop is left below it, the strategy of the lowest remaining sidepanel with a backdrop SHALL be applied again.

#### Scenario: Modal sidepanel

- **WHEN** a sidepanel with a backdrop is open over a page that overflows
- **THEN** the page cannot scroll

#### Scenario: Non-modal sidepanel

- **WHEN** a sidepanel with `hasBackdrop: false` is open
- **THEN** the page scroll is not blocked

#### Scenario: Lower sidepanel closes first

- **WHEN** two sidepanels with backdrops and the default strategy are open and the lower one closes
- **THEN** the page stays blocked

#### Scenario: Custom strategy in the middle

- **WHEN** three sidepanels with backdrops are open, the middle one with a `scrollStrategy` that does not block, and the lowest one closes
- **THEN** the page is no longer blocked, although the top sidepanel uses the default strategy

### Requirement: Escape closes the sidepanel

Escape pressed anywhere in the document SHALL close the topmost sidepanel and prevent the key's default action, unless `disableClose` is set, the key's default action was already prevented, for example by a control or a tooltip inside the panel, or an overlay that listens for keys, such as a dropdown or autocomplete panel, was attached after the sidepanel and takes the key instead. A sidepanel below the topmost one MUST NOT receive the key.

#### Scenario: Escape

- **WHEN** a sidepanel is open and the user presses Escape
- **THEN** the sidepanel closes and the key event's default action is prevented

#### Scenario: Tooltip inside the panel

- **WHEN** a tooltip inside the sidepanel is open and the user presses Escape twice
- **THEN** the first press closes only the tooltip and the second closes the sidepanel

#### Scenario: Key already handled

- **WHEN** a control inside the panel prevents the default action of Escape
- **THEN** the sidepanel stays open

#### Scenario: Dropdown open over the panel

- **WHEN** a dropdown opened from a button inside the sidepanel is open and the user presses Escape
- **THEN** the sidepanel does not receive the key and stays open

### Requirement: Clicking the strip closes the top panel

A click on the indent strip SHALL close the sidepanel that shows it, and a click on a sidepanel underneath at the same position SHALL close every sidepanel stacked above the clicked one at that position, in both cases except a sidepanel that has `disableClose`. A click on a sidepanel at another position MUST NOT close it.

#### Scenario: Indent click

- **WHEN** two sidepanels are stacked at the right edge and the user clicks the indent strip
- **THEN** the top sidepanel closes and no indent strip remains

#### Scenario: Top panel with disableClose

- **WHEN** the top sidepanel of a stack has `disableClose` and the user clicks its indent strip
- **THEN** both sidepanels stay open

#### Scenario: Panel at another position

- **WHEN** non-modal sidepanels are open at the right and the left edges and the user clicks the right one
- **THEN** both stay open

#### Scenario: Click on the lowest of three

- **WHEN** three non-modal sidepanels are stacked at the right edge and the user clicks the part of the lowest one that the others leave uncovered
- **THEN** the two sidepanels above it close and the lowest one stays open

### Requirement: Page hidden from assistive technology

When the first sidepanel that traps focus opens, every child of the overlay container's parent present at that moment, except the overlay container, `script` and `style` elements and elements with `aria-live`, SHALL get `aria-hidden="true"`. Elements added to the page while such a sidepanel stays open are not hidden. When the last such sidepanel is removed, each hidden element SHALL get back its previous `aria-hidden` value.

#### Scenario: Modal sidepanel open and closed

- **WHEN** a modal sidepanel opens and then closes
- **THEN** the page elements outside the overlay container have `aria-hidden="true"` while it is open
- **AND** none of them has `aria-hidden` after it closed

#### Scenario: Non-modal sidepanel

- **WHEN** only a sidepanel with `hasBackdrop: false` is open
- **THEN** no page element outside the overlay container has `aria-hidden`

#### Scenario: Component-level service destroyed

- **WHEN** a modal sidepanel opened through the root service is open and a component-level service is destroyed
- **THEN** the page stays hidden from assistive technology

#### Scenario: Element added while open

- **WHEN** an element is appended to the overlay container's parent while a modal sidepanel is open
- **THEN** that element has no `aria-hidden`

### Requirement: Size presets

The `size` option SHALL add the class `kbq-sidepanel_<size>` to the container. A sidepanel at the left or right edge SHALL take the full viewport height and be 400 px wide when `small`, 640 px when `medium` (the default) and 960 px when `large`, except that a `large` sidepanel is never wider than the viewport.

#### Scenario: Medium by default

- **WHEN** a sidepanel at the right edge is opened without a size
- **THEN** its container has the class `kbq-sidepanel_medium` and the panel is 640 px wide

#### Scenario: Large

- **WHEN** a sidepanel at the right edge is opened with size `large` on a viewport at least 960 px wide
- **THEN** the panel is 960 px wide

#### Scenario: Large on a narrow viewport

- **WHEN** a sidepanel at the right edge is opened with size `large` on a viewport 800 px wide
- **THEN** the panel is 800 px wide
