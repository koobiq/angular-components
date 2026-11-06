# actions-panel Specification Delta

## MODIFIED Requirements

### Requirement: Closing only once

Once `close()` of a panel's reference has run, directly or through `KbqActionsPanel.close()`, further close calls on its reference or its service MUST be ignored for that panel: `beforeClosed` MUST NOT emit again and the result of the first close SHALL be kept. A panel closed without that call, by history navigation or `Dialog.closeAll()`, does not count: a later `close()` on its reference still emits `beforeClosed`, after `afterClosed`.

#### Scenario: Closing twice

- **WHEN** the panel is closed through the service and then through its reference
- **THEN** `beforeClosed` has emitted exactly once

#### Scenario: Closing after history navigation

- **WHEN** a panel has been removed because the user went back in the browser history, and `close()` is then called on its reference
- **THEN** `beforeClosed` emits once, after `afterClosed` has emitted

### Requirement: Close button

Unless `disableClose` is set, the panel SHALL render a close button with the `kbq-actions-panel-container__close-button` class after its content, separated from it by a vertical divider. Clicking it SHALL call `close()` without a result on the `KbqActionsPanel` that the `injector` option resolves, or else on the opening instance, closing the panel with an `undefined` result. When the `injector` option resolves another instance, that instance's open panel, if any, closes instead.

#### Scenario: Clicking the close button

- **WHEN** the user clicks the close button of a panel opened without the `injector` option
- **THEN** the panel closes and `afterClosed` emits `undefined`

#### Scenario: Injector that resolves another instance

- **WHEN** a component that provides its own `KbqActionsPanel` opens a panel with an `injector` that resolves the root instance, which has no open panel, and the user clicks the close button
- **THEN** the panel stays open

### Requirement: Escape closes the panel

Unless `disableClose` is set or a control inside the panel has already prevented it, an Escape keydown without modifier keys inside the panel SHALL have its default action prevented and SHALL call `close()` on the `KbqActionsPanel` the close button uses: the panel closes with an `undefined` result, or another instance's panel does when the `injector` option resolves another instance. Escape pressed while focus is outside the panel MUST NOT close it.

#### Scenario: Escape inside the panel

- **WHEN** focus is inside a panel opened without the `injector` option and the user presses Escape
- **THEN** the panel closes

#### Scenario: Escape elsewhere on the page

- **WHEN** a panel is open, focus is outside it and the user presses Escape
- **THEN** the panel stays open

#### Scenario: Escape with a modifier key

- **WHEN** focus is inside the panel and the user presses Shift+Escape
- **THEN** the panel stays open

### Requirement: Pop-ups of the content are not scoped to the element

Overlays opened from inside the panel's content, such as a dropdown or a tooltip, MUST NOT be rendered into the element given as `overlayContainer`. They SHALL be rendered in the application-wide overlay container, so that the element does not clip them, also when a `kbqOverlayLayer` encloses the element: the layer takes the dropdown of a trigger placed elsewhere in it, but not the dropdown of a trigger inside the panel.

#### Scenario: Dropdown in a panel inside an element

- **WHEN** a dropdown trigger inside a panel rendered into an element is activated and no `kbqOverlayLayer` encloses the element
- **THEN** the dropdown panel is in the application-wide overlay container

#### Scenario: Dropdown in a panel inside an overlay layer

- **WHEN** a dropdown trigger inside a panel rendered into an element is activated and a `kbqOverlayLayer` encloses the element
- **THEN** the dropdown panel is in the application-wide overlay container and not in the layer

### Requirement: Size options

`width` SHALL set the overlay pane's CSS width. `minWidth` and `maxWidth` SHALL set its minimum and maximum width, with a number taken as pixels, in the application-wide container and inside an element alike. Without `maxWidth` the panel SHALL be no wider than the container it is rendered into, unless `minWidth` asks for more: a minimum width larger than the container wins over that cap.

#### Scenario: Numeric maxWidth

- **WHEN** a panel is opened with `maxWidth: 500`
- **THEN** the overlay pane has `max-width: 500px`

#### Scenario: Width and minWidth

- **WHEN** a panel is opened with `width: '500px'` and another with `minWidth: '50%'`
- **THEN** the panes have `width: 500px` and `min-width: 50%` respectively

#### Scenario: maxWidth inside an element

- **WHEN** a panel is opened into an element with `maxWidth: '999px'`
- **THEN** the overlay pane has `max-width: 999px`

### Requirement: Text direction

`direction: 'rtl'` SHALL add the `kbq-actions-panel-container_rtl` class to the panel element and set `dir="rtl"` on its overlay. With the built-in default configuration, `direction` SHALL default to `'ltr'`, whatever the direction of the application. When the merged configuration has no `direction`, as with a provided default configuration that leaves it out, the overlay SHALL take the application's direction from its root `Directionality` instead, without the RTL class.

#### Scenario: Right-to-left panel

- **WHEN** a panel is opened with `direction: 'rtl'`
- **THEN** the panel element has `kbq-actions-panel-container_rtl`

#### Scenario: Default direction

- **WHEN** a panel is opened without `direction`, with the built-in default configuration, in an application whose document is right-to-left
- **THEN** its overlay has `dir="ltr"`

#### Scenario: Provided default configuration without direction

- **WHEN** `kbqActionsPanelDefaultConfigProvider({ disableClose: true })` is provided and a panel is opened without `direction` in an application whose document is right-to-left
- **THEN** its overlay has `dir="rtl"`
- **AND** the panel element does not have `kbq-actions-panel-container_rtl`
