# content-panel Specification Delta

## MODIFIED Requirements

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

### Requirement: Key changes

When `stateSavingKey` changes after the state was read, the container SHALL restore from the new key under the same rules, and later writes SHALL go to the new key. This holds only while state saving is on and the container is in the document when the key changes: otherwise the new key is not read, and the container MUST NOT write anything, even once state saving is back on, until `stateSavingKey` changes again.

#### Scenario: Switching to a key with saved state

- **WHEN** `stateSavingKey` changes to a key under which `{ opened: true, width: 500 }` is stored and `opened` is not bound
- **THEN** the panel opens at 500 px

#### Scenario: Key changed while state saving is off

- **WHEN** `useStateSaving` is set to `false`, `stateSavingKey` changes to `other-key`, `useStateSaving` is set back to `true` and the panel is toggled
- **THEN** nothing is written to the state store, neither under `other-key` nor under the previous key

### Requirement: Registration with the state saving service

The container SHALL register with `KbqStateSavingService` under the name `kbq-content-panel-container`, with the key it read its state from, empty until it has read, and with its own `useStateSaving` value as `enabled`, and SHALL unregister when it is destroyed. `enabled` SHALL NOT tell whether the container persists: a detached container, or one under `KbqStateSavingService.setEnabled(false)`, is listed with `enabled: true`.

#### Scenario: Listing and destroying

- **WHEN** a container with `stateSavingKey="content-panel-key"` renders and is later destroyed
- **THEN** the service lists `{ name: 'kbq-content-panel-container', key: 'content-panel-key', enabled: true }` while it lives
- **AND** lists nothing after it is destroyed

#### Scenario: Detached container

- **WHEN** a container with `stateSavingKey="content-panel-key"` initializes while its element is detached from the document
- **THEN** the service lists `{ name: 'kbq-content-panel-container', key: '', enabled: true }`

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
