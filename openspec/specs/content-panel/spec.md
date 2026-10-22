# content-panel Specification

## Purpose

Describes what `kbq-content-panel-container` and its parts from `@koobiq/components/content-panel` guarantee to consumers: how the slide-out panel is laid out next to the main content, how it opens, closes and is resized, how it remembers its state across reloads, and how it behaves for keyboard and assistive technology users.

## Requirements

### Requirement: Parts of the panel

`kbq-content-panel-container` SHALL render its content other than `kbq-content-panel` as the main content and a `kbq-content-panel` placed in it as the panel. The panel SHALL render its `kbq-content-panel-aside`, `kbq-content-panel-header`, `kbq-content-panel-body` and `kbq-content-panel-footer` in that order, whatever their order in the markup, and MUST NOT render any other content placed directly in it.

#### Scenario: Parts written out of order

- **WHEN** the footer is written before the header inside `kbq-content-panel`
- **THEN** the open panel shows the header first and the footer last

#### Scenario: Aside next to the column

- **WHEN** the panel has an aside, a header, a body and a footer
- **THEN** the aside is rendered first, beside the column formed by the header, the body and the footer

#### Scenario: Loose content in the panel

- **WHEN** a paragraph is placed directly inside `kbq-content-panel`, outside any of its parts
- **THEN** the paragraph is not rendered

### Requirement: Header layout

`kbq-content-panel-header` SHALL render the element marked `kbqContentPanelHeaderTitle` and the element marked `kbqContentPanelHeaderActions` in one row, the title first and the actions followed by the close button at the end of the row. The rest of the header's content SHALL be rendered below that row.

#### Scenario: Caption under the title

- **WHEN** the header contains a title, actions and a caption that carries neither attribute
- **THEN** the title, the actions and the close button share the first row
- **AND** the caption is rendered below that row

### Requirement: Main content makes room for the panel

The open panel SHALL sit at the right edge of the container and take its full height. While it is open, the main content SHALL leave a space on its right equal to the width the container holds plus 16 px: the `width` input, or a width dragged or restored since. That width is not held between `minWidth` and `maxWidth`, so outside them the space does not match the panel. While it is closed, the main content SHALL use the full width. The main content SHALL scroll inside the container.

#### Scenario: Opening a panel of the default width

- **WHEN** the panel opens with the default width of 640 px
- **THEN** the main content has a right margin of 656 px

#### Scenario: Closed panel

- **WHEN** the panel is closed
- **THEN** the main content has no right margin

#### Scenario: Width above the maximum

- **WHEN** the container has `width` 1000 with the default `maxWidth` of 800 and the panel opens
- **THEN** the panel is 800 px wide
- **AND** the main content has a right margin of 1016 px

### Requirement: Panel content exists while closed

The content of `kbq-content-panel` SHALL be created together with the container and SHALL stay alive while the panel is closed. Closing SHALL only take that content out of the document, and opening SHALL put the same content back without creating it again.

#### Scenario: Component in a panel that was never opened

- **WHEN** the panel has not been opened yet
- **THEN** the components inside `kbq-content-panel` already exist and have been initialized
- **AND** their elements are not in the document

#### Scenario: Reopening the panel

- **WHEN** a component inside the panel changes its state, and the panel is closed and opened again
- **THEN** the same component instance is shown with the state it had

### Requirement: Host classes

Each part SHALL carry its class on its host element: `kbq-content-panel-container`, `kbq-content-panel`, `kbq-content-panel-aside`, `kbq-content-panel-header`, `kbq-content-panel-header-title`, `kbq-content-panel-header-actions`, `kbq-content-panel-body` and `kbq-content-panel-footer`. The container SHALL also carry `kbq-content-panel-container__opened` while the panel is open.

#### Scenario: Open container

- **WHEN** the panel is open
- **THEN** the container element has the classes `kbq-content-panel-container` and `kbq-content-panel-container__opened`

#### Scenario: Closed container

- **WHEN** the panel is closed
- **THEN** the container element does not have `kbq-content-panel-container__opened`

### Requirement: Template references

The container SHALL be exported to templates as `kbqContentPanelContainer`, the aside as `kbqContentPanelAside`, the body as `kbqContentPanelBody`, and the title and actions directives as `kbqContentPanelHeaderTitle` and `kbqContentPanelHeaderActions`. `kbq-content-panel`, the header and the footer SHALL have no export name.

#### Scenario: Toggling from a template reference

- **WHEN** the container is referenced as `#panel="kbqContentPanelContainer"` and a button calls `panel.toggle()` on click
- **THEN** each click on the button opens or closes the panel

### Requirement: Parts need their containers

`kbq-content-panel-header` MUST be placed inside both a `kbq-content-panel-container` and a `kbq-content-panel`, and `kbq-content-panel-footer` MUST be placed inside a `kbq-content-panel`. Creating either of them elsewhere SHALL fail with Angular's no-provider error (`NG0201`).

#### Scenario: Header outside a container

- **WHEN** a `kbq-content-panel-header` is rendered without an enclosing `kbq-content-panel-container`
- **THEN** creating it throws Angular's no-provider error for `KbqContentPanelContainer`

### Requirement: Closed by default

When `opened` is not bound and no saved state is restored, the panel SHALL start closed: `isOpened()` SHALL return `false` and the panel MUST NOT be rendered. An `opened` bound to `null` or `undefined` SHALL count as not bound.

#### Scenario: Fresh container

- **WHEN** a container without an `opened` binding renders with state saving off
- **THEN** `isOpened()` returns `false` and no panel is rendered

### Requirement: Opened input

The `opened` input SHALL open the panel when `true` and close it when `false`, on initialization and whenever the bound value changes. It SHALL accept boolean attribute values, so a bare `opened` attribute opens the panel. Together with `openedChange`, it SHALL support two-way binding with `[(opened)]`.

#### Scenario: Opened on first render

- **WHEN** the container renders with `[opened]="true"`
- **THEN** the panel is open on the first render

#### Scenario: Two-way binding follows the user

- **WHEN** the container binds `[(opened)]="isOpen"` with `isOpen` set to `true`, and the user clicks the close button
- **THEN** the panel closes and `isOpen` becomes `false`

### Requirement: Opening and closing methods

`open()` SHALL open a closed panel, `close()` SHALL close an open panel, and `toggle()` SHALL switch between the two. `open()` on an open panel and `close()` on a closed panel SHALL change nothing.

#### Scenario: Toggling twice

- **WHEN** `toggle()` is called on a closed panel and then called again
- **THEN** the panel is open after the first call and closed after the second

#### Scenario: Closing a closed panel

- **WHEN** `close()` is called on a closed panel
- **THEN** the panel stays closed and nothing is emitted

### Requirement: Opened-state output

`openedChange` SHALL emit the new state synchronously whenever the panel opens or closes through `open()`, `close()`, `toggle()`, the close button or Escape. It MUST NOT emit when the state does not change, when the state comes from the `opened` input, or when it is restored from saved state.

#### Scenario: Closing with the close button

- **WHEN** the user clicks the close button of an open panel
- **THEN** `openedChange` emits `false`

#### Scenario: State driven by the input

- **WHEN** the application changes the value bound to `[opened]` from `false` to `true`
- **THEN** the panel opens and `openedChange` does not emit

#### Scenario: Restored state

- **WHEN** the panel opens because the saved state says it was open
- **THEN** `openedChange` does not emit

### Requirement: Opened-state signal

`isOpened` SHALL be a read-only signal that reports whether the panel is open, whether the state came from the `opened` input, a method, the close button, Escape or restored state.

#### Scenario: Reading the state after a method call

- **WHEN** `open()` is called
- **THEN** `isOpened()` returns `true`

### Requirement: Local changes outlast an unchanged binding

When `opened` is bound one-way and the panel is opened or closed by the user or by a method, the panel SHALL keep that state until the bound value changes. Assigning the value the binding already holds MUST NOT reset the panel.

#### Scenario: Re-assigning the same value

- **WHEN** the container binds `[opened]="isOpen"` with `isOpen` set to `true`, the user closes the panel, and the application sets `isOpen` to `true` again
- **THEN** the panel stays closed

#### Scenario: The bound value changes

- **WHEN** the application then sets `isOpen` to `false`, lets the view update, and sets it back to `true`
- **THEN** the panel opens

### Requirement: Close button

`kbq-content-panel-header` SHALL render a close button with `type="button"` after the header actions, and a click on it SHALL close the panel. A panel without a header SHALL have no close button.

#### Scenario: Clicking the close button

- **WHEN** the panel is open and the user clicks the close button
- **THEN** the panel closes

#### Scenario: Panel without a header

- **WHEN** the panel has a body but no `kbq-content-panel-header`
- **THEN** no close button is rendered

### Requirement: Disabling close

With `disableClose` set, the header MUST NOT render the close button and Escape MUST NOT close the panel. `disableClose` SHALL NOT stop `close()`, `toggle()` or the `opened` input from closing the panel. It defaults to `false`.

#### Scenario: Close button hidden

- **WHEN** `disableClose` is set and the panel is open
- **THEN** the header has no close button

#### Scenario: Closing from code

- **WHEN** `disableClose` is set, the panel is open and `close()` is called
- **THEN** the panel closes

### Requirement: Calls from an effect

`open()`, `close()`, `toggle()`, `saveState()` and `clearSavedState()` SHALL NOT make a calling `effect()` depend on the state of the panel, so an effect that opens or toggles the panel MUST NOT run again when the panel later opens or closes.

#### Scenario: Effect that opens the panel

- **WHEN** an effect calls `open()` once and the panel is later closed with `close()`
- **THEN** the panel is closed and the effect has run only once

#### Scenario: Effect that toggles the panel

- **WHEN** an effect calls `toggle()` once and the panel is later closed with `close()`
- **THEN** the effect has run only once

### Requirement: Focus is left in place

Opening the panel SHALL NOT move focus into it, and closing it SHALL NOT move focus anywhere, including back to the element that opened it.

#### Scenario: Opening from a button

- **WHEN** a button in the main content has focus and opens the panel
- **THEN** the button keeps focus

#### Scenario: Closing with the close button

- **WHEN** the user closes the panel with its close button
- **THEN** the container does not move focus to another element

### Requirement: Width inputs

`minWidth`, `width` and `maxWidth` SHALL set the minimum, starting and maximum width of the panel in pixels, defaulting to 480, 640 and 800, and SHALL accept numeric strings. The open panel SHALL carry them as inline `min-width`, `width` and `max-width` styles.

#### Scenario: Custom widths

- **WHEN** the container binds `minWidth` 222, `width` 333 and `maxWidth` 444 and the panel opens
- **THEN** the panel element has the inline styles `min-width: 222px`, `width: 333px` and `max-width: 444px`

#### Scenario: Attribute strings

- **WHEN** the container is written as `<kbq-content-panel-container width="400" minWidth="300" maxWidth="500">`
- **THEN** the open panel is 400 px wide, with a minimum of 300 px and a maximum of 500 px

### Requirement: Changing the width input

A change of `width` after initialization SHALL replace the current width of the panel, including a width the user dragged or one that was restored from saved state.

#### Scenario: Narrowing a resized panel

- **WHEN** the user has dragged the panel to 600 px and the application changes `width` to 500
- **THEN** the panel is 500 px wide

### Requirement: Drag resizing

Unless `disableResizer` is set, the open panel SHALL have a resize handle on its left edge with a horizontal resize cursor. Dragging the handle left SHALL widen the panel and dragging it right SHALL narrow it, between `minWidth` and `maxWidth`, and the main content SHALL follow the new width at once. With `disableResizer` set, the handle MUST NOT be rendered. No output SHALL report the dragged width.

#### Scenario: Dragging past the maximum

- **WHEN** the user drags the handle left beyond the width given by `maxWidth`
- **THEN** the panel stops growing at `maxWidth`

#### Scenario: Resizing turned off

- **WHEN** `disableResizer` is set and the panel is open
- **THEN** the panel has no resize handle

### Requirement: Resetting the width

A double click on the resize handle SHALL set the panel back to the width given by the `width` input and SHALL prevent the double click's default action.

#### Scenario: Double click after a drag

- **WHEN** the user has dragged the panel to 700 px with `width` 640 and double-clicks the handle
- **THEN** the panel is 640 px wide again

### Requirement: Resizing is pointer-only

The resize handle SHALL NOT be focusable and SHALL have no role and no keyboard interaction. The width can be changed by the user only with a pointer.

#### Scenario: Tabbing through the open panel

- **WHEN** the user tabs through the container while the panel is open
- **THEN** focus never lands on the resize handle

### Requirement: State saving is on by default

The container SHALL persist its state only while `useStateSaving` is `true` and `KbqStateSavingService.setEnabled(false)` has not turned persistence off for the application. `useStateSaving` SHALL default to the value provided for `KBQ_STATE_SAVING_ENABLED`, `true` unless the application provides otherwise. While either switch is off, the container MUST NOT read or write saved state, and a container that did not read on initialization SHALL NOT start persisting when the switch is turned on.

#### Scenario: State saving turned off

- **WHEN** the container has `[useStateSaving]="false"` and the panel is toggled
- **THEN** nothing is written to the state store

#### Scenario: State saving turned off for the application

- **WHEN** `KbqStateSavingService.setEnabled(false)` has been called and a container with `useStateSaving` on is toggled
- **THEN** nothing is written to the state store

#### Scenario: State saving turned on after initialization

- **WHEN** a container renders with `[useStateSaving]="false"`, the binding later changes to `true`, and the panel is toggled
- **THEN** nothing is written to the state store

### Requirement: Storage key

The state SHALL be stored in the store provided as `KBQ_STATE_STORE` (`localStorage` by default) under the `stateSavingKey`. Without a `stateSavingKey`, the key SHALL be derived from the position of the container in the document by the rules shared by every component that saves state.

#### Scenario: Explicit key

- **WHEN** the container has `stateSavingKey="content-panel-key"` and the panel is opened
- **THEN** the state is stored under `content-panel-key`

#### Scenario: Derived key

- **WHEN** the container has no `stateSavingKey`, sits directly in an element with `id="root0"`, and the panel is toggled
- **THEN** the state is stored under the key `#root0/kbq-content-panel-container`

### Requirement: Saved payload

The saved state SHALL be a `KbqContentPanelState` object `{ opened, width }`: whether the panel is open, and its current width in pixels.

#### Scenario: Opening with the default width

- **WHEN** state saving is on and the panel is opened with the default width
- **THEN** the stored state is `{ opened: true, width: 640 }`

### Requirement: When the state is written

The container SHALL write its state at once when the panel is opened or closed through a method, the close button or Escape, and when a double click resets the width. After a drag, it SHALL write once the resizing has paused for 300 ms. `saveState()` SHALL write the current state on demand.

#### Scenario: Closing an open panel

- **WHEN** state saving is on and an open panel is closed with `close()`
- **THEN** the stored state immediately says `opened: false`

#### Scenario: Dragging the handle

- **WHEN** the user drags the handle and stops moving
- **THEN** the new width is written 300 ms after the last move, once

### Requirement: Input changes are not written

A change of the `opened` or `width` input MUST NOT write the state by itself. The next write SHALL carry the state the inputs left.

#### Scenario: Opening through the input

- **WHEN** state saving is on and the application changes the value bound to `[opened]` to `true`
- **THEN** the stored state is not updated until the next open, close, resize or `saveState()` call

### Requirement: Restoring on initialization

On initialization the container SHALL read the saved state, open or close the panel to match it, and set the panel to the saved width held between the current `minWidth` and `maxWidth`.

#### Scenario: Restoring an open panel

- **WHEN** the stored state is `{ opened: true, width: 420 }`, `opened` is not bound and the container renders
- **THEN** the panel is open and 420 px wide

#### Scenario: Saved width above the maximum

- **WHEN** the stored width is 5000 and `maxWidth` is 500
- **THEN** the restored panel is 500 px wide

#### Scenario: Saved width below the minimum

- **WHEN** the stored width is 100 and `minWidth` is 300
- **THEN** the restored panel is 300 px wide

### Requirement: A bound opened state wins

While `opened` is bound to a value other than `null` or `undefined`, restoring SHALL apply only the saved width and MUST leave the opened state to the binding.

#### Scenario: Application drives the panel

- **WHEN** the stored state is `{ opened: true, width: 420 }` and the container binds `[(opened)]` to `false`
- **THEN** the panel stays closed
- **AND** it is 420 px wide once it is opened

### Requirement: Unusable saved state is ignored

A saved value that is not an object with a boolean `opened` and a finite number `width` SHALL be ignored, leaving the panel in the state its inputs give it.

#### Scenario: Malformed payloads

- **WHEN** the stored value is `"nonsense"`, `42`, `[]`, `{ opened: true }` or `{ opened: true, width: "wide" }`
- **THEN** the panel starts closed, as if nothing were stored

### Requirement: Clearing the saved state

`clearSavedState()` SHALL remove the saved state of the container from the store and leave the panel as it is, and the next change SHALL be written again. While `useStateSaving` is `false`, it SHALL do nothing.

#### Scenario: Clearing and closing

- **WHEN** a restored state `{ opened: true, width: 420 }` is cleared with `clearSavedState()` and the panel is then closed
- **THEN** the entry is gone after the clear
- **AND** the store holds `{ opened: false, width: 420 }` after the close

### Requirement: Whether state is saved

`hasSavedState` SHALL be `true` once a usable state has been restored or a state has been written, `false` after `clearSavedState()`, and always `false` while `useStateSaving` is `false`.

#### Scenario: After a restore and a clear

- **WHEN** a usable state is restored on initialization and `clearSavedState()` is then called
- **THEN** `hasSavedState` is `true` before the call and `false` after it

### Requirement: Key changes

When `stateSavingKey` changes after the state was read, the container SHALL restore from the new key under the same rules, and later writes SHALL go to the new key. This holds only while state saving is on and the container is in the document when the key changes: otherwise the new key is not read, and the container MUST NOT write anything, even once state saving is back on, until `stateSavingKey` changes again.

#### Scenario: Switching to a key with saved state

- **WHEN** `stateSavingKey` changes to a key under which `{ opened: true, width: 500 }` is stored and `opened` is not bound
- **THEN** the panel opens at 500 px

#### Scenario: Key changed while state saving is off

- **WHEN** `useStateSaving` is set to `false`, `stateSavingKey` changes to `other-key`, `useStateSaving` is set back to `true` and the panel is toggled
- **THEN** nothing is written to the state store, neither under `other-key` nor under the previous key

### Requirement: Containers outside the document

A container that is not attached to the document when it initializes SHALL neither restore nor write its state, even with a `stateSavingKey`.

#### Scenario: Container rendered before it is attached

- **WHEN** a container initializes while its element is detached from the document and is attached later
- **THEN** no saved state is applied and opening or closing the panel writes nothing

### Requirement: Registration with the state saving service

The container SHALL register with `KbqStateSavingService` under the name `kbq-content-panel-container`, with the key it read its state from, empty until it has read, and with its own `useStateSaving` value as `enabled`, and SHALL unregister when it is destroyed. `enabled` SHALL NOT tell whether the container persists: a detached container, or one under `KbqStateSavingService.setEnabled(false)`, is listed with `enabled: true`.

#### Scenario: Listing and destroying

- **WHEN** a container with `stateSavingKey="content-panel-key"` renders and is later destroyed
- **THEN** the service lists `{ name: 'kbq-content-panel-container', key: 'content-panel-key', enabled: true }` while it lives
- **AND** lists nothing after it is destroyed

#### Scenario: Detached container

- **WHEN** a container with `stateSavingKey="content-panel-key"` initializes while its element is detached from the document
- **THEN** the service lists `{ name: 'kbq-content-panel-container', key: '', enabled: true }`

### Requirement: Escape closes the panel

While the panel is open and focus is inside the container, in the main content or in the panel, Escape SHALL close the panel, prevent the key's default action and stop its propagation. While the panel is closed, Escape SHALL be left to propagate untouched.

#### Scenario: Escape in the panel

- **WHEN** the panel is open and the user presses Escape inside it
- **THEN** the panel closes

#### Scenario: Escape in the main content

- **WHEN** the panel is open and the user presses Escape on an input in the main content
- **THEN** the panel closes
- **AND** a keydown listener on an ancestor of the container does not receive the event

### Requirement: Escape handled by the content

An Escape whose default action was already prevented by an element inside the container, such as an autocomplete closing its own panel, MUST NOT close the content panel.

#### Scenario: Autocomplete inside the container

- **WHEN** an autocomplete panel is open in the main content and the user presses Escape
- **THEN** only the autocomplete panel closes and the content panel stays open
- **AND** a second Escape closes the content panel

### Requirement: Disabling Escape

With `disableCloseByEscape` or `disableClose` set, Escape MUST NOT close the panel and SHALL propagate untouched. `disableCloseByEscape` defaults to `false` and does not hide the close button.

#### Scenario: Escape turned off

- **WHEN** `disableCloseByEscape` is set, the panel is open and the user presses Escape in the container
- **THEN** the panel stays open

#### Scenario: Close turned off

- **WHEN** `disableClose` is set, the panel is open and the user presses Escape in the container
- **THEN** the panel stays open

### Requirement: Scrolling body

`kbq-content-panel-body` SHALL fill the height the header and the footer leave and scroll its content with the library scrollbar, while the header and the footer stay in place.

#### Scenario: Long body

- **WHEN** the body content is taller than the space between the header and the footer
- **THEN** the body scrolls and the header and footer stay visible

### Requirement: Overflow shadows

While the body is scrolled away from its top, the header SHALL show `--kbq-content-panel-header-overflow-box-shadow` as its inline `box-shadow`. While body content remains below the visible area, the footer SHALL show `--kbq-content-panel-footer-overflow-box-shadow`. Otherwise neither SHALL have an inline `box-shadow`. Both SHALL be measured after the first render and then only when the body scrolls or its visible area changes size.

#### Scenario: Overflowing body on first render

- **WHEN** the panel opens with a body taller than its visible area, scrolled to the top
- **THEN** the footer shows its shadow and the header does not

#### Scenario: Body scrolled to the middle

- **WHEN** the body is scrolled halfway down
- **THEN** both the header and the footer show their shadows

#### Scenario: Content added to a body scrolled to its end

- **WHEN** a body taller than its visible area is scrolled to its end, so the footer has no shadow, and more content is added at its end
- **THEN** the footer stays without its shadow until the body scrolls or its visible area changes size

### Requirement: Opening and closing motion

The panel SHALL slide in from the right edge when it opens and slide out when it closes, and the main content SHALL move with it; a resize SHALL move the main content without motion. When animations are turned off through `KBQ_ANIMATIONS_CONFIG`, `provideNoopAnimations()` or `prefers-reduced-motion: reduce`, the panel SHALL open and close without motion.

#### Scenario: Reduced motion

- **WHEN** the user prefers reduced motion and opens the panel
- **THEN** the panel and the main content take their final positions without a slide

### Requirement: Accessible name of the close button

The close button SHALL be named through `aria-label` by the `a11y.close` string of the active locale, `ru-RU` by default. `[localeOverrides]` on `kbq-content-panel-header` SHALL override it for that header, while keys left out keep following the locale.

#### Scenario: English locale

- **WHEN** the application switches the locale to `en-US`
- **THEN** the close button has `aria-label="Close"`

#### Scenario: Overriding one header

- **WHEN** a header binds `[localeOverrides]` with its own `a11y.close`
- **THEN** only the close button of that header uses the overridden name
