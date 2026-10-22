# alert Specification

## Purpose

Describes what `kbq-alert` from `@koobiq/components/alert` guarantees to consumers: how its size, style and status inputs show on the host, how it lays out and tints the content projected into its slots, how its close control reports a dismissal, and what it leaves to the consumer for accessibility.

## Requirements

### Requirement: Alert element

The component SHALL be used as the `kbq-alert` element, SHALL put the `kbq-alert` class on its host whatever its inputs are, and SHALL be reachable from a template reference as `kbqAlert`.

#### Scenario: Bare alert

- **WHEN** a `<kbq-alert />` is rendered without inputs or content
- **THEN** its host has the `kbq-alert` class

#### Scenario: Template reference

- **WHEN** a template declares `<kbq-alert #alert="kbqAlert">`
- **THEN** `alert` is the component instance, and `alert.alertColor()` reads its status

### Requirement: Alert size

The `compact` input SHALL default to `false`, which puts `kbq-alert_normal` on the host. When it is `true`, the host SHALL have `kbq-alert_compact` and MUST NOT have `kbq-alert_normal`. The input SHALL accept attribute values the way Angular's `booleanAttribute` does, so a bare `compact` attribute means `true`.

#### Scenario: Normal by default

- **WHEN** an alert is rendered without `compact`
- **THEN** its host has `kbq-alert_normal` and not `kbq-alert_compact`

#### Scenario: Compact alert

- **WHEN** `[compact]` is set to `true`
- **THEN** the host has `kbq-alert_compact` and not `kbq-alert_normal`

#### Scenario: Bare attribute

- **WHEN** the alert is written as `<kbq-alert compact>`
- **THEN** it is compact

### Requirement: Alert style

The `alertStyle` input SHALL default to `default` (`KbqAlertStyles.Default`), which puts `kbq-alert_default` on the host. When it is `colored` (`KbqAlertStyles.Colored`), the host SHALL have `kbq-alert_colored` instead. The host MUST carry exactly one of the two classes.

#### Scenario: Default style

- **WHEN** an alert is rendered without `alertStyle`
- **THEN** its host has `kbq-alert_default` and not `kbq-alert_colored`

#### Scenario: Colored style

- **WHEN** `alertStyle` is `colored`
- **THEN** the host has `kbq-alert_colored` and not `kbq-alert_default`

### Requirement: Alert status

The `alertColor` input SHALL take one of `error`, `warning`, `success` and `info` (`KbqAlertColors`), SHALL default to `info`, and SHALL put `kbq-alert_<status>` on the host. When the status changes, the class of the previous status SHALL be removed. Reading `alertColor()` SHALL return the status itself, not the class name.

#### Scenario: Info by default

- **WHEN** an alert is rendered without `alertColor`
- **THEN** its host has `kbq-alert_info`

#### Scenario: Error status

- **WHEN** `alertColor` changes from `info` to `error`
- **THEN** the host has `kbq-alert_error` and no longer has `kbq-alert_info`
- **AND** `alertColor()` returns `error`

### Requirement: Empty status falls back to info

An empty string, `null` or `undefined` given to `alertColor` SHALL be treated as `info`: the host SHALL get `kbq-alert_info` and `alertColor()` SHALL return `info`.

#### Scenario: Empty string

- **WHEN** `alertColor` is bound to an empty string
- **THEN** `alertColor()` returns `info` and the host has `kbq-alert_info`

#### Scenario: Null

- **WHEN** `alertColor` is bound to `null`
- **THEN** the alert behaves as an `info` alert

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

### Requirement: Icon buttons are not status icons

A `kbq-icon-button`, such as the close control, MUST NOT count as a status icon: on its own it SHALL NOT open the status icon slot, and the alert MUST NOT tint it.

#### Scenario: Close button alone

- **WHEN** the only icon-like element in the alert is a `kbq-icon-button` close control
- **THEN** no `kbq-alert__icon` element is rendered

#### Scenario: Close button keeps its color

- **WHEN** an `error` alert has a `kbq-icon-button` close control without a `color`
- **THEN** the close control does not get the `kbq-error` class

### Requirement: Status icon auto-tint

When the projected status icon has no color of its own (its `color` is unset, an empty value or `empty`), the alert SHALL set the icon's color to match the status: `error`, `warning` and `success` to the same color, and `info` to `contrast`. This SHALL apply to a `kbq-icon` and to a `kbq-icon-item` alike.

#### Scenario: Warning alert

- **WHEN** a `warning` alert has a `kbq-icon` without a `color`
- **THEN** the icon has the `kbq-warning` class

#### Scenario: Info alert

- **WHEN** an `info` alert has a `kbq-icon` without a `color`
- **THEN** the icon has the `kbq-contrast` class

#### Scenario: Icon item

- **WHEN** an `error` alert has a `kbq-icon-item` without a `color`
- **THEN** the icon item has the `kbq-error` class

#### Scenario: Empty color binding

- **WHEN** the icon's `[color]` is bound to an empty string
- **THEN** the icon is tinted as if no color were set

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

### Requirement: Only one status icon is tinted

The slot SHALL render every `kbq-icon` and `kbq-icon-item` projected as a direct child, but the alert SHALL tint only one of them: the first `kbq-icon` when there is one, otherwise the first `kbq-icon-item`. Every other icon MUST keep the color it was given.

#### Scenario: Icon and icon item together

- **WHEN** an `error` alert has a `kbq-icon-item` and a `kbq-icon`, neither with a `color`
- **THEN** both are rendered in the icon slot
- **AND** only the `kbq-icon` is tinted to `error`

### Requirement: Warning about two status icons

In dev mode, when both a `kbq-icon` and a `kbq-icon-item` are projected as direct children, the alert SHALL call `console.warn` once with a message that starts with "KbqAlert: both a `kbq-icon` and a `kbq-icon-item` are projected", ends with "Project a single status icon.", and is followed by the host element. It MUST warn at most once per alert, and MUST NOT warn in production mode or for a single icon.

#### Scenario: Both kinds projected

- **WHEN** an alert in dev mode has a `kbq-icon-item` and a `kbq-icon`
- **THEN** `console.warn` is called with the message and the alert's host element

#### Scenario: Icon removed and added again

- **WHEN** the `kbq-icon` of that alert is removed and then projected again
- **THEN** `console.warn` has still been called only once

#### Scenario: Single icon

- **WHEN** an alert has only a `kbq-icon`
- **THEN** `console.warn` is not called

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

### Requirement: Closed output

A click on the projected close control SHALL emit `closed` once, with no value. A click on the alert's icon, title, text or action controls MUST NOT emit it.

#### Scenario: Click on the close control

- **WHEN** the user clicks the close control
- **THEN** `closed` emits once

#### Scenario: Click on the text

- **WHEN** the user clicks the alert's text, title or an action control
- **THEN** `closed` does not emit

### Requirement: Closing from the keyboard

When the close control is a native `<button>`, activating it with Enter or Space SHALL emit `closed`, because the browser turns that activation into a click.

#### Scenario: Enter on the close button

- **WHEN** a native close button has focus and the user presses Enter
- **THEN** `closed` emits once

### Requirement: Alert does not dismiss itself

Emitting `closed` MUST NOT hide or remove the alert and MUST NOT move focus. Hiding the alert and placing focus afterwards SHALL be left to the consumer.

#### Scenario: Consumer ignores the output

- **WHEN** the user clicks the close control and the consumer does not handle `closed`
- **THEN** the alert stays rendered and the alert does not move focus

### Requirement: Title slot

An element with the `kbq-alert-title` attribute placed as a direct child SHALL be projected at the top of the content, above the text, and SHALL get the `kbq-alert__title` class.

#### Scenario: Title projected

- **WHEN** a `<div kbq-alert-title>` is a direct child
- **THEN** it is rendered first in the content and has the `kbq-alert__title` class

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

### Requirement: Text slot

Projected content that matches no named slot SHALL be rendered in the text area, `kbq-alert__text`, between the title and the controls, whether it is plain text, inline elements or several paragraphs.

#### Scenario: Text and paragraphs

- **WHEN** the alert holds plain text or several `<p>` elements and nothing else
- **THEN** they are rendered inside the `kbq-alert__text` element

### Requirement: Fixed slot order

The alert SHALL render its slots in a fixed order — status icon, then title, text and controls, then the close control — whatever order the consumer writes them in. Only direct children SHALL fill the named slots, the single root element of an `@if` block among them; a marked element nested inside another element stays with its parent.

#### Scenario: Title written after the text

- **WHEN** the consumer writes the text first and the `kbq-alert-title` element after it
- **THEN** the title is rendered above the text

#### Scenario: Close control written first

- **WHEN** the consumer writes the close control before the text
- **THEN** the close control is rendered at the end of the alert

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

### Requirement: Button stack modifier

When a control is a `kbq-button`, or wraps one, the button stack SHALL have the `kbq-alert__button-stack_has-button` class. When the controls are only links and the alert holds no `kbq-button` elsewhere, the class MUST NOT be present.

#### Scenario: Button control

- **WHEN** a `<button kbq-alert-control kbq-button>` is projected
- **THEN** the button stack has `kbq-alert__button-stack_has-button`

#### Scenario: Link controls only

- **WHEN** the only controls are `<a kbq-alert-control kbqLink>` links and the alert holds no `kbq-button`
- **THEN** the button stack does not have `kbq-alert__button-stack_has-button`

### Requirement: No ARIA of its own

The alert MUST NOT set a `role` or any `aria-*` attribute on its host. Attributes the consumer puts on the host, such as `role="alert"` or `aria-live`, SHALL be rendered as given, so announcing a dynamically shown alert is the consumer's choice.

#### Scenario: Static alert

- **WHEN** an alert is rendered without consumer attributes
- **THEN** its host has no `role` and no `aria-*` attribute

#### Scenario: Dynamically shown alert

- **WHEN** the consumer renders the alert with `role="alert"`
- **THEN** the host has `role="alert"`

### Requirement: No text of its own

The alert MUST NOT render any text or accessible name of its own, and it has no locale strings. The accessible name of the close control and the wording of the status SHALL come from the consumer's content.

#### Scenario: Close control name

- **WHEN** a close control with `aria-label="Close"` is projected
- **THEN** its accessible name is "Close", and the alert adds no other label to it

### Requirement: Marker directives

The `[kbq-alert-title]`, `[kbq-alert-control]` and `[kbq-alert-close-button]` attribute directives SHALL have no inputs or outputs, SHALL add the `kbq-alert__title`, `kbq-alert-control` and `kbq-alert-close-button` classes to their hosts, and SHALL be reachable from template references as `kbqAlertTitle`, `kbqAlertControl` and `kbqAlertCloseButton`.

#### Scenario: Close control class

- **WHEN** a `<button kbq-alert-close-button>` is projected
- **THEN** it has the `kbq-alert-close-button` class

#### Scenario: Template reference to a control

- **WHEN** a template declares `<button kbq-alert-control #control="kbqAlertControl">`
- **THEN** `control` is the directive instance

### Requirement: NgModule

`KbqAlertModule` SHALL import and export `KbqAlert`, `KbqAlertTitle`, `KbqAlertControl` and `KbqAlertCloseButton`, so an NgModule consumer gets the component and all three directives from one import.

#### Scenario: Module import

- **WHEN** a component imports only `KbqAlertModule`
- **THEN** `kbq-alert`, `kbq-alert-title`, `kbq-alert-control` and `kbq-alert-close-button` all work in its template
