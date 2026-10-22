# Spec Delta

## Purpose

Describes what `kbq-sidebar` from `@koobiq/components/sidebar` guarantees to consumers: how its opened and closed states are set and reported, which content and width each state renders, how the `[` and `]` shortcut toggles it, and how it remembers its state across reloads.

## ADDED Requirements

### Requirement: Sidebar building blocks

The entry point SHALL provide the `kbq-sidebar` component, exported as `kbqSidebar`, and the `[kbq-sidebar-opened]` and `[kbq-sidebar-closed]` content directives, exported as `kbqSidebarOpened` and `kbqSidebarClosed`. All three SHALL be standalone and re-exported by `KbqSidebarModule`. The host SHALL carry the class `kbq-sidebar`, and the content elements the classes `kbq-sidebar-opened` and `kbq-sidebar-closed`.

#### Scenario: Module import

- **WHEN** a template that imports `KbqSidebarModule` renders `<kbq-sidebar>` with a `kbq-sidebar-opened` and a `kbq-sidebar-closed` child
- **THEN** the sidebar host has the class `kbq-sidebar`
- **AND** both children are picked up as the content of the two states

### Requirement: Open by default

A sidebar whose `opened` input is not bound SHALL start opened, unless state saving restores another state.

#### Scenario: No binding

- **WHEN** a sidebar is rendered without an `opened` binding and with nothing persisted for it
- **THEN** its `opened` property is `true` and the opened content is rendered

### Requirement: Opened input

A bound `opened` input SHALL set the state each time the bound value changes. A bound `undefined` SHALL be applied as `false`, so it closes the sidebar even though an unbound sidebar starts opened.

#### Scenario: Binding changes

- **WHEN** the bound value changes from `true` to `false` and back
- **THEN** the sidebar closes and then opens again

#### Scenario: Bound value turns undefined

- **WHEN** the bound value changes to `undefined`
- **THEN** the sidebar closes, loses the class `kbq-sidebar_opened` and takes its closed width

### Requirement: Opened property

The `opened` property SHALL return the current state. Assigning it from code SHALL change the state at once and render the new state like any other change.

#### Scenario: Closing from code

- **WHEN** code assigns `false` to the `opened` property of an opened sidebar
- **THEN** `opened` reads `false` immediately
- **AND** once rendered, the host has no class `kbq-sidebar_opened`, its width is the closed width and the closed content is shown

### Requirement: Toggle method

`toggle()` SHALL switch the sidebar to the opposite state, whether or not `opened` is bound.

#### Scenario: Toggling twice

- **WHEN** `toggle()` is called on an opened sidebar, and then again
- **THEN** the sidebar closes and then opens again

### Requirement: No two-way binding of the opened state

A change made by `toggle()`, the shortcut or the `opened` property SHALL NOT update the value bound to `opened`; the sidebar has no `openedChange` output. A later change of the bound value SHALL be applied as an assignment of that value.

#### Scenario: Binding and toggle disagree

- **WHEN** `opened` is bound to `true`, `toggle()` closes the sidebar, and the bound value then changes to `false`
- **THEN** the sidebar stays closed and no `stateChanged` is emitted for that change

### Requirement: Opened host class

The host SHALL have the class `kbq-sidebar_opened` exactly while the opened state is `true`. The class SHALL follow the state as soon as it is rendered, without waiting for the width transition.

#### Scenario: Closing

- **WHEN** an opened sidebar is closed
- **THEN** the host loses the class `kbq-sidebar_opened` on the next render

### Requirement: Content of the current state

The sidebar SHALL render the `[kbq-sidebar-opened]` content in the opened state and the `[kbq-sidebar-closed]` content in the closed state, and only that one: the other content MUST NOT be in the sidebar's DOM. When the directive of a state is absent, nothing SHALL be rendered in that state.

#### Scenario: Closed sidebar

- **WHEN** the sidebar is closed and its change has been rendered
- **THEN** the sidebar contains the closed content and not the opened content

### Requirement: Content switch timing

When the sidebar opens, the opened content SHALL replace the closed content at once, while the sidebar widens. When it closes, the opened content SHALL stay until the narrowing transition has ended, and only then be replaced by the closed content.

#### Scenario: Opening

- **WHEN** a closed sidebar is opened
- **THEN** the opened content is rendered while the width is still transitioning

#### Scenario: Closing

- **WHEN** an opened sidebar is closed
- **THEN** the opened content stays rendered until the width transition ends
- **AND** the closed content is rendered after it

### Requirement: Content is kept across state changes

The elements of both content directives SHALL be created with the sidebar, whichever state is shown first, and SHALL be moved in and out of the sidebar on a state change rather than recreated.

#### Scenario: Closed content while opened

- **WHEN** an opened sidebar has both content directives
- **THEN** both directive instances exist, although only the opened content is rendered

### Requirement: Opened width bounds

In the opened state the host's inline `min-width`, `width` and `max-width` SHALL be the `minWidth`, `width` and `maxWidth` inputs of `[kbq-sidebar-opened]`, used as given as CSS values. An input that is unset or empty, or a missing directive, SHALL give `inherit`.

#### Scenario: Declared bounds

- **WHEN** the opened content declares `minWidth="170px"`, `width="170px"` and `maxWidth="50%"`
- **THEN** the opened sidebar has `min-width: 170px`, `width: 170px` and `max-width: 50%`

#### Scenario: Nothing declared

- **WHEN** the opened content declares no width
- **THEN** the opened sidebar has `inherit` as its `min-width`, `width` and `max-width`

### Requirement: Closed width

In the closed state the host's inline `min-width`, `width` and `max-width` SHALL all equal the `width` input of `[kbq-sidebar-closed]`, or `32px` when it is unset, empty or the directive is missing.

#### Scenario: Default closed width

- **WHEN** the closed content declares no width and the sidebar closes
- **THEN** the host's `width` is `32px`

#### Scenario: Declared closed width

- **WHEN** the closed content declares `width="44px"` and the sidebar closes
- **THEN** the host's `min-width`, `width` and `max-width` are `44px`

### Requirement: Widths are read once

The sidebar SHALL read the width inputs of both content directives once, when its content is initialized. A later change of those inputs, or content added later, MUST NOT change the widths the sidebar applies.

#### Scenario: Width bound to a changing value

- **WHEN** `[width]` of the opened content is bound and its value changes after the sidebar was rendered
- **THEN** the opened sidebar keeps the width read at initialization

### Requirement: Width remembered on close

When an opened sidebar that is not in the middle of a state transition is closed, it SHALL take its current rendered width in whole pixels as its opened width, so it reopens at the width it was left at, such as one set by a splitter. A sidebar closed while it still widens SHALL keep its previous opened width.

#### Scenario: Resized, closed and reopened

- **WHEN** an opened sidebar is 200 px wide, is closed and is opened again
- **THEN** its inline `width` is `200px`

#### Scenario: Closed while widening

- **WHEN** the sidebar was 200 px wide when last closed, is opened, and is closed again while its width is still transitioning
- **THEN** it reopens at `200px`, not at the width it had reached

### Requirement: Width transition only between states

The host SHALL carry the class `kbq-sidebar_toggling` from a change of state until its width transition has ended, or until the next render when nothing animates, and the width SHALL be transitioned only while it does. The first render and a width written on the host from outside SHALL apply at once.

#### Scenario: Toggling

- **WHEN** the sidebar is rendered and then toggled while its width transition runs
- **THEN** the host has no `kbq-sidebar_toggling` after the first render
- **AND** it has the class while the transition runs and loses it once the transition ends

### Requirement: Motion turned off

When animations are disabled through `KBQ_ANIMATIONS_CONFIG`, `provideNoopAnimations()` or the user's reduced-motion setting, the host SHALL carry the class `kbq-animations-disabled` and the width SHALL change without a transition. Under reduced motion the transition SHALL also be off through the media query.

#### Scenario: Reduced motion

- **WHEN** the user prefers reduced motion and the sidebar is toggled
- **THEN** the width changes at once and the content of the new state is rendered right after the next render

### Requirement: State change event

After a change of state, the sidebar SHALL emit `stateChanged` with the new `opened` value once the change is rendered and the width transition has ended, or right after the render when nothing animates.

#### Scenario: Toggle reported

- **WHEN** an opened sidebar is toggled
- **THEN** `stateChanged` emits `false` once the change is rendered

### Requirement: Initial state reported

After the first render, the sidebar SHALL emit `stateChanged` once with its initial state, whether that state is the default, bound or restored.

#### Scenario: First render

- **WHEN** a sidebar starts opened and is rendered for the first time
- **THEN** `stateChanged` emits `true` without any user action

### Requirement: No event for an unchanged state

Assigning the state the sidebar already has, through the `opened` input or property, MUST NOT emit `stateChanged`.

#### Scenario: Assigning the current state

- **WHEN** code assigns `true` to the `opened` property of an opened sidebar
- **THEN** `stateChanged` is not emitted

### Requirement: Rapid changes reported once

When the state changes again before the previous change has been reported, the sidebar SHALL emit `stateChanged` only once, with the latest state.

#### Scenario: Toggled twice before the transition ends

- **WHEN** an opened sidebar is toggled twice before its width transition ends
- **THEN** `stateChanged` emits once, with `true`

### Requirement: State saving on by default

The sidebar SHALL persist its state through `KBQ_STATE_STORE` (`localStorage` by default) unless `useStateSaving` is `false`. `useStateSaving` SHALL default to `true`, or to the value provided for `KBQ_STATE_SAVING_ENABLED`.

#### Scenario: Turned off on one sidebar

- **WHEN** a sidebar has `[useStateSaving]="false"` and is toggled
- **THEN** nothing is written to the store

### Requirement: State restored on initialization

When its content is initialized, a persisting sidebar SHALL read its entry once and apply its `opened` value and, when present, its `width` as the opened width. The restored state SHALL be rendered at once, with the content of that state and without a width transition.

#### Scenario: Restored closed

- **WHEN** the store holds `{ opened: false }` for the sidebar's key and the sidebar is rendered
- **THEN** `opened` is `false` and the closed content is rendered on the first render

#### Scenario: Restored width

- **WHEN** the store holds `{ opened: true, width: '333px' }` for the sidebar's key
- **THEN** the opened width of the sidebar is `333px`

### Requirement: Controlled sidebar does not persist

A sidebar whose `opened` input is bound SHALL neither restore nor write its state, whatever `useStateSaving` says.

#### Scenario: Bound sidebar with a stored entry

- **WHEN** the store holds `{ opened: false }` for the key of a sidebar with `[opened]="true"`, and the sidebar is then toggled
- **THEN** the sidebar renders opened, and the stored entry is left unchanged

### Requirement: State written on every change

A persisting sidebar SHALL write its whole state, `{ opened, width }`, to its key each time `opened` is assigned, through the property, `toggle()` or the shortcut, including an assignment of the state it already has.

#### Scenario: Toggle persisted

- **WHEN** a persisting sidebar with the opened width `200px` is 200 px wide and is toggled closed
- **THEN** its key holds `{ opened: false, width: '200px' }`

### Requirement: Width in the persisted state

The persisted state SHALL contain the opened width when it is a declared or captured value, and SHALL leave `width` out while the opened width is `inherit`.

#### Scenario: Declared width

- **WHEN** the opened content declares `width="200px"` and the state is written
- **THEN** the written state is `{ opened: true, width: '200px' }`

#### Scenario: Inherited width

- **WHEN** the opened content declares no width and the state is written before the sidebar was ever closed
- **THEN** the written state is `{ opened: true }`

### Requirement: Unusable persisted state ignored

The sidebar SHALL restore only an object whose `opened` is a boolean. Any other payload SHALL be ignored, leaving the sidebar in its default state. A `width` that is not a string SHALL be dropped while `opened` is still restored.

#### Scenario: Malformed payloads

- **WHEN** the stored payload is `"nonsense"`, `42`, `[]`, `{ opened: 'yes' }` or `{ width: '10px' }`
- **THEN** the sidebar renders opened, as without a stored entry

### Requirement: Storage key

The sidebar SHALL persist under `stateSavingKey` when it is set. While it is empty, the key SHALL be derived from where the sidebar sits in the document, through `KBQ_STATE_SAVING_KEY_RESOLVER`.

#### Scenario: No key given

- **WHEN** a sidebar with an empty `stateSavingKey` inside an element with the id `root1` is toggled
- **THEN** its state is written under the key `#root1/kbq-sidebar`

### Requirement: Key change moves the state

When `stateSavingKey` changes after the state was read, a persisting sidebar SHALL restore from the entry under the new key and write there from then on. When the restored `opened` differs from the current one, the change SHALL be animated and reported through `stateChanged` once.

#### Scenario: Switching to another key

- **WHEN** the sidebar restored opened from `sidebar-key`, and `stateSavingKey` changes to `other-key`, which holds `{ opened: false }`
- **THEN** the sidebar closes and `stateChanged` emits `false` exactly once

### Requirement: Detached sidebar does not persist

A sidebar that is not in the document when its content is initialized, such as one projected into an overlay, SHALL neither restore nor write its state, and MUST NOT log a warning about it.

#### Scenario: Initialized outside the document

- **WHEN** the store holds `{ opened: false }` for the sidebar's key and the sidebar initializes while detached from the document
- **THEN** the sidebar renders opened and no warning is logged

### Requirement: Saving on request

`saveState()` SHALL write the current state of a persisting sidebar at once, and SHALL do nothing for a sidebar that does not persist.

#### Scenario: Explicit save

- **WHEN** `saveState()` is called on an opened, persisting sidebar whose opened content declares `width="200px"`
- **THEN** its key holds `{ opened: true, width: '200px' }`

### Requirement: Clearing the saved state

`clearSavedState()` SHALL remove the entry stored for the sidebar and leave persistence on, so the next change of state is written again.

#### Scenario: Clear and toggle

- **WHEN** a sidebar restored from a stored entry calls `clearSavedState()` and is then toggled
- **THEN** the entry is gone after the call
- **AND** an entry is written again by the toggle

### Requirement: Saved state indicator

`hasSavedState` SHALL be `true` while state is persisted for the sidebar, restored on initialization or written since, and SHALL be `false` after `clearSavedState()` and while `useStateSaving` is `false`.

#### Scenario: Restored, then cleared

- **WHEN** a sidebar restored its state and `clearSavedState()` is then called
- **THEN** `hasSavedState` is `true` before the call and `false` after it

### Requirement: Registration with the state saving service

Each sidebar SHALL register with `KbqStateSavingService` under the name `kbq-sidebar`, with the key it read its state from and its `useStateSaving` value, and SHALL unregister when it is destroyed.

#### Scenario: Listed while alive

- **WHEN** a persisting sidebar with the key `sidebar-key` is rendered and then destroyed
- **THEN** the service lists `{ name: 'kbq-sidebar', key: 'sidebar-key', enabled: true }` while it is rendered
- **AND** lists nothing after it is destroyed

### Requirement: Calls from effects

Assigning `opened` and calling `toggle()`, `saveState()` or `clearSavedState()` inside an `effect()` MUST NOT make that effect depend on the sidebar's state or on its state saving inputs.

#### Scenario: Effect that clears the saved state

- **WHEN** an effect calls `clearSavedState()` and `useStateSaving` is then turned off and on again
- **THEN** the effect does not run again

### Requirement: Bracket shortcut

A `keypress` of the physical key `[` (`BracketLeft`) anywhere in the document SHALL toggle a sidebar whose `position` is `SidebarPositions.Left`, and `]` (`BracketRight`) one whose `position` is `SidebarPositions.Right`. The key SHALL be matched by its physical position, whatever the keyboard layout. A bound `opened` MUST NOT stop it.

#### Scenario: Left sidebar

- **WHEN** a left sidebar is rendered and the user presses `[` outside a text field
- **THEN** the sidebar toggles

#### Scenario: Key of the other side

- **WHEN** a left sidebar is rendered and the user presses `]`
- **THEN** the sidebar does not toggle

### Requirement: Shortcut ignored while typing

The shortcut MUST NOT toggle the sidebar when the key event comes from an `input` or `textarea` element, or while the Meta key is held.

#### Scenario: Typing a bracket

- **WHEN** the user types `[` in a text input while a left sidebar is rendered
- **THEN** the sidebar does not toggle

### Requirement: Position only selects the shortcut

`position` SHALL have no default value and SHALL only select which bracket key toggles the sidebar; it MUST NOT change where or how the sidebar is laid out. A sidebar without `position` SHALL ignore both keys.

#### Scenario: No position

- **WHEN** a sidebar has no `position` and the user presses `[` or `]`
- **THEN** the sidebar does not toggle

### Requirement: Shortcut reaches every matching sidebar

Every rendered sidebar SHALL listen to the document on its own, so one key press SHALL toggle all sidebars with the matching `position` at once.

#### Scenario: Two left sidebars

- **WHEN** two sidebars with `position` left are rendered and the user presses `[`
- **THEN** both sidebars toggle

### Requirement: Shortcut lifetime

The sidebar SHALL start listening for the shortcut after its first render in the browser and SHALL stop when it is destroyed. On the server the shortcut SHALL NOT be registered.

#### Scenario: Destroyed sidebar

- **WHEN** a left sidebar has been destroyed and the user presses `[`
- **THEN** nothing is toggled and no error is thrown

### Requirement: No accessibility semantics of its own

The sidebar SHALL add no role and no ARIA attribute to its host or content, and SHALL expose its state to assistive technology only through the content it renders. Content of the state not shown is out of the DOM and therefore out of the accessibility tree.

#### Scenario: Opened sidebar

- **WHEN** an opened sidebar is rendered
- **THEN** its host has no `role` and no `aria-*` attribute
