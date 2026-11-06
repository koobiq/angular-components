# Spec Delta

## MODIFIED Requirements

### Requirement: Status icon slot

A `kbq-icon` or `kbq-icon-item` placed as a direct child of the alert SHALL be projected into the status icon slot, in front of the content. The slot's wrapper, `kbq-alert__icon`, SHALL be rendered only while such an icon is projected or one sits directly inside a top-level `<ng-container>` or at the root of a control flow block with several root nodes, where it is tinted but rendered in the text. An icon nested inside another projected element MUST NOT be treated as the status icon.

#### Scenario: Alert without an icon

- **WHEN** the alert holds no `kbq-icon` or `kbq-icon-item`
- **THEN** no `kbq-alert__icon` element is rendered

#### Scenario: Icon projected

- **WHEN** an `<i kbq-icon>` is a direct child of the alert
- **THEN** a `kbq-alert__icon` element is rendered and holds that icon

#### Scenario: Icon inside the text

- **WHEN** a `kbq-icon` sits inside a `<p>` of the alert text and is the alert's only icon
- **THEN** no `kbq-alert__icon` element is rendered and the icon stays in the text

#### Scenario: Icon in a block with several root nodes

- **WHEN** an `@if` block holds an `<i kbq-icon>` followed by a line of text, and the alert holds no other icon
- **THEN** the icon is rendered inside `kbq-alert__text`
- **AND** an empty `kbq-alert__icon` element is rendered

### Requirement: Explicit icon color wins

A status icon that already has an explicit color when it is projected MUST keep that color, whatever status the alert has or changes to, unless that color equals the color the alert last assigned to a status icon. The alert compares colors, not who set them, so such an icon, for example one that replaced an icon the alert had tinted, SHALL be re-tinted on the next `alertColor` change.

#### Scenario: Icon colored differently from the status

- **WHEN** a `success` alert has a `kbq-icon` with `[color]` set to `error`
- **THEN** the icon has `kbq-error` and not `kbq-success`

#### Scenario: Replacement icon with the last assigned color

- **WHEN** the auto-tinted `kbq-icon` of an `error` alert is replaced by a `kbq-icon` with `[color]` set to `error`, and `alertColor` then changes to `success`
- **THEN** the new icon has `kbq-success` and no longer has `kbq-error`

### Requirement: Re-tint on status change

When `alertColor` changes, the status icon the alert tints SHALL be tinted again to the new status, and the color of the previous status SHALL be removed from it, as long as the icon still has the color the alert last assigned. An icon whose color has been changed to another color since, and an icon item the alert tinted before a `kbq-icon` was projected next to it, MUST keep their color.

#### Scenario: Error becomes success

- **WHEN** an `error` alert has an auto-tinted icon and `alertColor` changes to `success`
- **THEN** the icon has `kbq-success` and no longer has `kbq-error`

#### Scenario: Icon item joined by an icon

- **WHEN** an `error` alert has only a `kbq-icon-item` without a `color`, a `kbq-icon` without a `color` is then projected, and `alertColor` changes to `success`
- **THEN** the `kbq-icon` has `kbq-success`
- **AND** the icon item still has `kbq-error`

### Requirement: Close control slot

An element with the `kbq-alert-close-button` attribute placed as a direct child SHALL be projected after the content, at the end of the alert. Its wrapper, `kbq-alert__close-button`, SHALL be rendered only while a close control is projected or one sits directly inside a top-level `<ng-container>` or at the root of a control flow block with several root nodes; that control is rendered in the text, a click on it does not emit `closed`, and the wrapper stays empty.

#### Scenario: No close control

- **WHEN** the alert holds no `kbq-alert-close-button`
- **THEN** no `kbq-alert__close-button` element is rendered

#### Scenario: Close control projected

- **WHEN** a `<button kbq-alert-close-button kbq-icon-button>` is a direct child
- **THEN** a `kbq-alert__close-button` element is rendered after the content and holds the button

#### Scenario: Close control in a block with several root nodes

- **WHEN** an `@if` block holds a line of text followed by a `<button kbq-alert-close-button kbq-icon-button>`, and the alert holds no other close control
- **THEN** the button is rendered inside `kbq-alert__text` and an empty `kbq-alert__close-button` element is rendered
- **AND** a click on the button does not emit `closed`

### Requirement: Dismissible host class

While a close control is projected, or one sits directly inside a top-level `<ng-container>` or at the root of a control flow block with several root nodes, the host SHALL have the `kbq-alert_dismissible` class. Without one, it MUST NOT.

#### Scenario: Close control added

- **WHEN** an alert without a close control gets one
- **THEN** its host gains `kbq-alert_dismissible`

#### Scenario: Close control rendered in the text

- **WHEN** the only close control is wrapped in a top-level `<ng-container>`
- **THEN** the host has `kbq-alert_dismissible`, although the close control is rendered inside `kbq-alert__text`

### Requirement: Title layout modifiers

While a title is projected, or one sits directly inside a top-level `<ng-container>` or at the root of a control flow block with several root nodes, the content wrapper SHALL have the `kbq-alert__content_title` class and the status icon wrapper, when rendered, SHALL have `kbq-alert__icon_title`. Without a title, neither class SHALL be present.

#### Scenario: Title added

- **WHEN** an alert with a status icon gets a title
- **THEN** the content wrapper has `kbq-alert__content_title`
- **AND** the icon wrapper has `kbq-alert__icon_title`

#### Scenario: No title

- **WHEN** an alert has no title
- **THEN** no element has `kbq-alert__content_title`

#### Scenario: Title rendered in the text

- **WHEN** the only `<div kbq-alert-title>` is wrapped in a top-level `<ng-container>`
- **THEN** the title is rendered inside `kbq-alert__text`
- **AND** the content wrapper has `kbq-alert__content_title`

### Requirement: Action controls

Elements with the `kbq-alert-control` attribute placed as direct children SHALL be projected below the text into a button stack, `kbq-alert__button-stack`, which SHALL be rendered only while at least one control is projected or sits directly inside a top-level `<ng-container>` or at the root of a control flow block with several root nodes; such a control is rendered in the text. Each control, a link or a button alike, SHALL get the `kbq-alert-control` class.

#### Scenario: No controls

- **WHEN** the alert holds no `kbq-alert-control`
- **THEN** no `kbq-alert__button-stack` element is rendered

#### Scenario: Two buttons

- **WHEN** two `<button kbq-alert-control kbq-button>` elements are direct children
- **THEN** a `kbq-alert__button-stack` element is rendered after the text and holds both

#### Scenario: Controls in a block with several root nodes

- **WHEN** an `@if` block holds two `<button kbq-alert-control kbq-button>` elements and the alert holds no other control
- **THEN** both buttons are rendered inside `kbq-alert__text`
- **AND** an empty `kbq-alert__button-stack` element is rendered
