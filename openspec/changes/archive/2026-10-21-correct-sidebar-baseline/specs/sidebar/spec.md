# Spec Delta

## MODIFIED Requirements

### Requirement: Content switch timing

When the sidebar opens, the opened content SHALL replace the closed content at once, while the sidebar widens. When it closes through the `opened` input or property, `toggle()` or the shortcut, the opened content SHALL stay until the narrowing transition has ended, and only then be replaced by the closed content. A state restored from a new `stateSavingKey` SHALL switch the content at once in either direction, while the width transitions.

#### Scenario: Opening

- **WHEN** a closed sidebar is opened
- **THEN** the opened content is rendered while the width is still transitioning

#### Scenario: Closing

- **WHEN** an opened sidebar is closed through `toggle()`
- **THEN** the opened content stays rendered until the width transition ends
- **AND** the closed content is rendered after it

#### Scenario: Closed by a key change

- **WHEN** the `stateSavingKey` of an opened, persisting sidebar changes to a key that holds `{ opened: false }`
- **THEN** the closed content is rendered while the width is still transitioning

### Requirement: Opened width bounds

In the opened state the host's inline `min-width` and `max-width` SHALL be the `minWidth` and `maxWidth` inputs of `[kbq-sidebar-opened]`, and its `width` SHALL start as the `width` input, all used as given as CSS values, until a width captured on close or restored from state saving replaces the `width`. An input that is unset or empty, or a missing directive, SHALL give `inherit`.

#### Scenario: Declared bounds

- **WHEN** the opened content declares `minWidth="170px"`, `width="170px"` and `maxWidth="50%"`, nothing was restored and the sidebar has not been closed yet
- **THEN** the opened sidebar has `min-width: 170px`, `width: 170px` and `max-width: 50%`

#### Scenario: Nothing declared

- **WHEN** the opened content declares no width, nothing was restored and the sidebar has not been closed yet
- **THEN** the opened sidebar has `inherit` as its `min-width`, `width` and `max-width`

#### Scenario: Declared percentage width after a close

- **WHEN** the opened content declares `width="50%"`, the sidebar is rendered 300 px wide, and it is closed and opened again
- **THEN** its inline `width` is `300px`, not `50%`

### Requirement: State saving on by default

The sidebar SHALL persist its state through `KBQ_STATE_STORE` (`localStorage` by default) unless `useStateSaving` is `false` or `KbqStateSavingService.setEnabled(false)` has turned persistence off for the application; a bound `opened` and a detached sidebar are excluded by their own requirements. `useStateSaving` SHALL default to `true`, or to the value provided for `KBQ_STATE_SAVING_ENABLED`.

#### Scenario: Turned off on one sidebar

- **WHEN** a sidebar has `[useStateSaving]="false"` and is toggled
- **THEN** nothing is written to the store

#### Scenario: Turned off for the application

- **WHEN** `KbqStateSavingService.setEnabled(false)` has been called and a sidebar with `useStateSaving` on is toggled
- **THEN** nothing is written to the store

### Requirement: Clearing the saved state

`clearSavedState()` SHALL remove the entry stored under the sidebar's key and leave persistence on, so the next change of state is written again. While `useStateSaving` is `false` it SHALL do nothing, and an entry already stored under the key SHALL stay.

#### Scenario: Clear and toggle

- **WHEN** a sidebar restored from a stored entry calls `clearSavedState()` and is then toggled
- **THEN** the entry is gone after the call
- **AND** an entry is written again by the toggle

#### Scenario: Saving turned off

- **WHEN** a sidebar with `[useStateSaving]="false"` has an entry stored under its key and calls `clearSavedState()`
- **THEN** the entry is still in the store
