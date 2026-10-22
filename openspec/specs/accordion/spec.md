# accordion Specification

## Purpose

Describes what `kbq-accordion` from `@koobiq/components/accordion` guarantees to consumers: how its items expand and collapse under pointer, keyboard and code, how the expanded state is bound, reported and persisted, and how the trigger, heading and content regions expose that state to styles and assistive technology.

## Requirements

### Requirement: Building blocks

The accordion SHALL be composed of `kbq-accordion`, `kbq-accordion-item`, an optional `kbq-accordion-header`, `kbq-accordion-trigger` and `kbq-accordion-content`, each usable as an element or as an attribute of the same name. Each part SHALL carry a host class equal to its selector, and `KbqAccordionModule` SHALL export all five. The trigger MAY sit directly in the item or inside the header.

#### Scenario: Host classes

- **WHEN** an accordion with one item, a header, a trigger and a content is rendered
- **THEN** the parts carry `kbq-accordion`, `kbq-accordion-item`, `kbq-accordion-header`, `kbq-accordion-trigger` and `kbq-accordion-content`

#### Scenario: Trigger without a header

- **WHEN** a `button[kbq-accordion-trigger]` is placed directly inside `kbq-accordion-item`
- **THEN** clicking it toggles the item

### Requirement: State attributes

The item, the header, the trigger and the content SHALL carry `data-state` (`open` or `closed`), `data-disabled` (`true` or `false`) and `data-orientation` (`vertical` or `horizontal`) that follow the item. The accordion host SHALL carry `data-orientation`.

#### Scenario: Item opens

- **WHEN** the user clicks the trigger of a closed item
- **THEN** the item, its header, its trigger and its content have `data-state="open"`

#### Scenario: Horizontal orientation

- **WHEN** `orientation` is `horizontal`
- **THEN** the accordion, the item, the trigger and the content have `data-orientation="horizontal"`

### Requirement: Trigger variants

The `variant` input SHALL accept `fill` (the default), `hug` and `hugSpaceBetween` and SHALL put `kbq-accordion-trigger_fill`, `kbq-accordion-trigger_hug` or `kbq-accordion-trigger_hug-space-between` on every trigger. The trigger SHALL render a chevron before its projected content: `kbq-chevron-down-s_16` in `hugSpaceBetween` and `kbq-chevron-right-s_16` otherwise. `fill` shows it before the title, `hug` right after it, `hugSpaceBetween` at the far end.

#### Scenario: Default variant

- **WHEN** `variant` is not set
- **THEN** the trigger has `kbq-accordion-trigger_fill` and a right-pointing chevron

#### Scenario: Switching to hugSpaceBetween

- **WHEN** `variant` changes to `hugSpaceBetween`
- **THEN** the trigger has `kbq-accordion-trigger_hug-space-between` and its chevron is `kbq-chevron-down-s_16`

### Requirement: Pointer toggles an item

A click on the trigger of an enabled item SHALL toggle that item and SHALL make the trigger the active header for keyboard navigation, moving focus to it.

#### Scenario: Click opens and closes

- **WHEN** the user clicks the trigger of a closed item and then clicks it again
- **THEN** the item opens and then closes

### Requirement: Single expansion by default

With `type` unset or `single`, at most one item SHALL be expanded: expanding an item SHALL collapse the item that was expanded before.

#### Scenario: Opening a second item

- **WHEN** the first item is expanded and the user clicks the trigger of the second item
- **THEN** the second item is expanded and the first is collapsed

#### Scenario: Two items expanded by the static attribute

- **WHEN** two items carry the static `expanded` attribute in a single-mode accordion
- **THEN** only the first of them is expanded after the first render

### Requirement: Multiple expansion

With `type` set to `multiple`, expanding an item MUST NOT collapse the other items, and `isMultiple` SHALL be `true`.

#### Scenario: Opening two items

- **WHEN** `type` is `multiple` and the user clicks the triggers of two items
- **THEN** both items are expanded

### Requirement: Non-collapsible accordion

With `collapsible` set to `false`, a click on the trigger of an expanded item SHALL leave the item expanded. `collapsible` defaults to `true`. In single mode, expanding another item SHALL still collapse the expanded one.

#### Scenario: Clicking the expanded item

- **WHEN** `collapsible` is `false`, an item is expanded and the user clicks its trigger
- **THEN** the item stays expanded

#### Scenario: Default collapsible

- **WHEN** `collapsible` is not set and the user clicks the trigger of an expanded item
- **THEN** the item collapses

### Requirement: Item value

An item SHALL be identified by its `value` input. Without one, or with an empty string, its value SHALL be `kbq-item-<index>`, where the index is its position among the items of its own accordion. Values SHALL be matched exactly, never by substring.

#### Scenario: Exact match

- **WHEN** the accordion's value is `item-10` and there are items with the values `item-1` and `item-10`
- **THEN** only the item `item-10` is expanded

#### Scenario: Positional value

- **WHEN** the second item has no `value`
- **THEN** its value is `kbq-item-1`

### Requirement: Default value

`defaultValue`, a string or an array of item values, SHALL expand the matching items when the accordion first renders and nothing else decides the state. In single mode only its first value SHALL be used. Empty strings SHALL be ignored, and later changes to `defaultValue` MUST NOT expand or collapse items.

#### Scenario: Expanded on init

- **WHEN** `defaultValue` is `item-1`
- **THEN** the item with the value `item-1` is expanded after the first render

#### Scenario: No default value

- **WHEN** `defaultValue` is not set
- **THEN** every item without its own `expanded` is collapsed

### Requirement: Controlled value

Binding `value` to a string or an array SHALL expand exactly the items whose values it contains and collapse the others, on the first render and on every later change of the binding; in single mode only its first non-empty value counts. `null` and `undefined` SHALL leave the accordion uncontrolled. The binding MUST NOT stop the user from toggling items; the bound value is applied again only when it changes or when `stateSavingKey` changes (see Changing the state saving key).

#### Scenario: Changing the bound value in multiple mode

- **WHEN** a multiple accordion's `value` changes from `['item-1']` to `['item-2']`
- **THEN** `item-1` collapses and `item-2` expands

#### Scenario: Bound array in multiple mode

- **WHEN** a multiple accordion's `value` is `['item-1', 'item-2']`
- **THEN** both items are expanded

### Requirement: Value signal shape

The accordion's `value` signal SHALL be an array in multiple mode and a string in single mode, an empty string when nothing is selected. It SHALL reflect the bound `value` or, while that is unbound, `defaultValue`; it MUST NOT follow toggles made by the user or by code unless the consumer writes them back through `[(value)]`.

#### Scenario: Unbound value in single mode

- **WHEN** neither `value` nor `defaultValue` is set and `type` is `single`
- **THEN** `value()` returns an empty string

#### Scenario: Empty array in single mode

- **WHEN** `value` is bound to `[]` in single mode
- **THEN** `value()` returns an empty string

#### Scenario: Unbound value in multiple mode

- **WHEN** neither `value` nor `defaultValue` is set and `type` is `multiple`
- **THEN** `value()` returns an empty array

### Requirement: Value change notification

The accordion SHALL emit `valueChange` each time one of its own items changes its expanded state, by user or by code, once per item that changes. The payload SHALL be the values of the expanded items, an array in multiple mode and the first expanded value, or an empty string, in single mode. Together with the `value` input this SHALL support `[(value)]`.

#### Scenario: Expanding the only item

- **WHEN** the user expands the only item of a single-mode accordion
- **THEN** `valueChange` fires once with that item's value

#### Scenario: Expanding in multiple mode

- **WHEN** `item-1` is expanded in a multiple accordion and the user expands `item-2`
- **THEN** `valueChange` fires once with `['item-1', 'item-2']`

### Requirement: Item expanded input

An item's `expanded` input SHALL set its state, both as a binding and as a static attribute. On the first render a bound `value`, a saved state or a non-empty `defaultValue` SHALL override it, the first two even when they expand nothing. A later change of the binding SHALL expand or collapse the item and report the change once.

#### Scenario: Bound expanded

- **WHEN** an item has `[expanded]="true"` and the accordion has no value, saved state or default value
- **THEN** the item is expanded after the first render in single and in multiple mode

#### Scenario: Default value wins over expanded

- **WHEN** the first item has `[expanded]="true"` and `defaultValue` names the second item
- **THEN** the first item is collapsed and the second is expanded

### Requirement: Item methods

An item SHALL expose `toggle()`, `open()` and `close()`, which change its state unless it is disabled, the `expanded` property, which sets the state even when it is disabled, and `focus()`, which moves focus to its trigger. Changes made through them SHALL behave like user toggles: siblings collapse in single mode and events fire.

#### Scenario: Opening from code

- **WHEN** code calls `open()` on a closed enabled item
- **THEN** the item expands and emits `opened`

#### Scenario: Disabled item ignores open

- **WHEN** code calls `open()` on a disabled item
- **THEN** the item stays collapsed

### Requirement: Item events

An item SHALL emit `expandedChange` with its new state, then `opened` or `closed`, each time its expanded state changes, including changes caused by a sibling, by the accordion's value or by code. Items expanded on the first render SHALL emit `opened` as well.

#### Scenario: Opening and closing

- **WHEN** the user opens and then closes an item
- **THEN** it emits `opened` with `expandedChange(true)` and then `closed` with `expandedChange(false)`

#### Scenario: Expanded by the static attribute

- **WHEN** two items carry the static `expanded` attribute in a multiple accordion
- **THEN** each of them emits `opened` once on the first render

### Requirement: Open and close all

`openAll()` SHALL expand every enabled item when `type` is `multiple` and SHALL do nothing in single mode. `closeAll()` SHALL collapse every enabled item in either mode. Disabled items SHALL keep their state.

#### Scenario: Open all in multiple mode

- **WHEN** `openAll()` is called on a multiple accordion
- **THEN** every enabled item is expanded

#### Scenario: Open all in single mode

- **WHEN** `openAll()` is called on a single-mode accordion with all items collapsed
- **THEN** every item stays collapsed

#### Scenario: Close all

- **WHEN** `closeAll()` is called after `openAll()`
- **THEN** every enabled item is collapsed

### Requirement: Safe to call from an effect

Calling `open()`, `toggle()`, `close()` on an item or `openAll()`, `closeAll()` and `clearSavedState()` on the accordion from inside a consumer's `effect()` MUST NOT make that effect depend on the accordion's state, so the effect does not run again when items expand, collapse or the accordion is disabled and re-enabled.

#### Scenario: Effect that opens an item

- **WHEN** an effect opens an item and the item is later closed
- **THEN** the effect has run once

#### Scenario: Effect that toggles an item

- **WHEN** an effect toggles an item
- **THEN** the item is expanded and the effect does not loop

### Requirement: Disabled item

An item with `disabled` set SHALL get `data-disabled="true"`, and its trigger SHALL get `aria-disabled="true"` without the HTML `disabled` attribute, so the trigger stays in the tab order. A click, Enter or Space on the trigger of a disabled item MUST NOT toggle it.

#### Scenario: Clicking a disabled item

- **WHEN** the user clicks the trigger of a disabled item
- **THEN** the item stays collapsed and the other items still respond to clicks

#### Scenario: Enter on a disabled item

- **WHEN** the trigger of a disabled item has focus and the user presses Enter
- **THEN** the item stays collapsed

#### Scenario: Disabling at runtime

- **WHEN** an item's `disabled` binding changes from `false` to `true`
- **THEN** its trigger's `aria-disabled` changes to `true`

### Requirement: Disabled accordion

The accordion's `disabled` input SHALL disable every one of its items. An item disabled on its own SHALL stay disabled when the accordion's `disabled` is `false`.

#### Scenario: Disabling the accordion

- **WHEN** the accordion's `disabled` is set to `true`
- **THEN** every item has `data-disabled="true"` and every trigger has `aria-disabled="true"`

#### Scenario: Accordion enabled, item disabled

- **WHEN** the accordion's `disabled` is `false` and an item's `disabled` is `true`
- **THEN** that item is disabled and a click on its trigger does not expand it

### Requirement: Value and state changes reach disabled items

Disabling SHALL block only toggles by the user and by `toggle()`, `open()`, `close()`, `openAll()` and `closeAll()`. A bound `value`, `defaultValue`, a restored state, the `expanded` input or property SHALL still expand or collapse a disabled item, and in single mode an expanded disabled item SHALL collapse when another item expands.

#### Scenario: Default value names a disabled item

- **WHEN** a multiple accordion's `defaultValue` includes the value of a disabled item
- **THEN** the disabled item is expanded after the first render

### Requirement: Header actions

Controls placed in the header next to the trigger, for example inside a `kbq-accordion-header__actions` container, SHALL keep their own keys and clicks: Enter or Space on them MUST NOT toggle the item or be prevented, and they SHALL stay focusable and clickable when the item is disabled.

#### Scenario: Enter on a header action

- **WHEN** a header action button has focus and the user presses Enter
- **THEN** the item does not toggle and the key's default action is not prevented

#### Scenario: Action on a disabled item

- **WHEN** an item is disabled and the user focuses and clicks its header action
- **THEN** the action receives focus and its click handler runs

### Requirement: Keys inside the content and the trigger

The accordion SHALL handle a key only when the trigger element itself is its target. Keys pressed in the expanded content, on the accordion host, or on a focusable element nested inside a trigger MUST NOT toggle an item, move focus between triggers or have their default action prevented.

#### Scenario: Space in a content input

- **WHEN** an item is expanded and the user presses Space in an input inside its content
- **THEN** the item stays expanded and the key's default action is not prevented

#### Scenario: Arrow keys in the content

- **WHEN** an input inside the content has focus and the user presses Down or Home
- **THEN** focus stays on the input

### Requirement: Collapsed content is hidden and inert

The content of every item SHALL stay in the DOM. While the item is collapsed its content SHALL carry the `hidden` and `inert` attributes, so nothing inside it can be focused; while expanded it SHALL carry neither.

#### Scenario: Toggling an item with a control in its content

- **WHEN** an item is collapsed, then expanded, then collapsed again
- **THEN** its content has `hidden` and `inert`, then neither, then both again

### Requirement: Content placement

A `kbq-accordion-content` declared inside a child component's template within the item SHALL follow the item's state, and an item without any content SHALL toggle without error.

#### Scenario: Content in a child component

- **WHEN** an item's content is rendered by a child component and the user expands the item
- **THEN** the content has neither `hidden` nor `inert`

#### Scenario: Item without content

- **WHEN** an item has a trigger but no content and the user clicks the trigger
- **THEN** no error is thrown

### Requirement: Enter and Space toggle the focused item

While a trigger has focus, Enter and Space SHALL toggle its item and prevent the key's default action.

#### Scenario: Enter collapses an expanded item

- **WHEN** an expanded item's trigger has focus and the user presses Enter
- **THEN** the item collapses

#### Scenario: Space expands a collapsed item

- **WHEN** a collapsed item's trigger has focus and the user presses Space
- **THEN** the item expands

### Requirement: Arrow keys move between triggers

In vertical orientation, Down and Up on a trigger SHALL move focus to the next or previous enabled trigger of the same accordion without wrapping, and Left and Right SHALL do nothing. Disabled items SHALL be skipped. An arrow key pressed with Alt, Ctrl, Meta or Shift SHALL be ignored. A handled key SHALL have its default action prevented.

#### Scenario: Down arrow

- **WHEN** the first trigger has focus and the user presses Down
- **THEN** the second trigger has focus

#### Scenario: Up arrow

- **WHEN** the second trigger has focus and the user presses Up
- **THEN** the first trigger has focus

### Requirement: Horizontal orientation

With `orientation` set to `horizontal`, Right and Left SHALL move focus to the next and previous trigger, mirrored in right-to-left layout, and Up and Down SHALL keep working. Orientation and direction SHALL be taken when the accordion's content initializes.

#### Scenario: Left-to-right

- **WHEN** the first trigger of a horizontal accordion has focus and the user presses Right, then Left
- **THEN** focus moves to the second trigger and back to the first

#### Scenario: Right-to-left

- **WHEN** the layout direction is right-to-left and the second trigger has focus and the user presses Right
- **THEN** the first trigger has focus

### Requirement: Home and End

Home and End on a trigger SHALL move focus to the first and the last enabled trigger of the same accordion.

#### Scenario: End then Home

- **WHEN** the first trigger has focus and the user presses End, then Home on the last trigger
- **THEN** focus moves to the last trigger and then to the first

### Requirement: Tab is not intercepted

Tab and Shift+Tab on a trigger MUST NOT be prevented, so focus moves through the triggers, the header actions and the expanded content in document order.

#### Scenario: Tab on a trigger

- **WHEN** a trigger has focus and the user presses Tab
- **THEN** the key's default action is not prevented

### Requirement: Keyboard focus indication

When focus enters the accordion from the keyboard, the accordion host SHALL carry `cdk-keyboard-focused`, and the item whose trigger has focus SHALL show a focus border. Focus on a header action or inside the content MUST NOT show the item's focus border.

#### Scenario: Tabbing onto the first trigger

- **WHEN** the user presses Tab and the first trigger receives focus
- **THEN** the accordion has `cdk-keyboard-focused` and the first item shows its focus border

### Requirement: Trigger semantics

Every trigger SHALL have `role="button"`, an `id` of the form `<item id>-trigger`, `aria-expanded` that follows the item, `aria-controls` pointing at its item's content and `aria-disabled` that follows the item. Item ids SHALL be unique on the page.

#### Scenario: Closed and open item

- **WHEN** an item is collapsed and then the user expands it
- **THEN** its trigger has `aria-expanded="false"` and then `aria-expanded="true"`

#### Scenario: Two items

- **WHEN** an accordion has two items
- **THEN** their triggers have different ids, and each trigger's `aria-controls` equals the id of its own content

### Requirement: Content region semantics

Every content SHALL have `role="region"`, an `id` of the form `<item id>-content` and `aria-labelledby` pointing at its item's trigger.

#### Scenario: Region named by its trigger

- **WHEN** an item with a trigger and a content is rendered
- **THEN** the content's `aria-labelledby` equals the trigger's `id`

### Requirement: Heading semantics

A `kbq-accordion-header` SHALL have `role="heading"` with `aria-level` equal to the accordion's `level` input, `2` by default, and SHALL be named by its trigger alone through `aria-labelledby`, so the labels of header actions are not part of the heading's name.

#### Scenario: Default level

- **WHEN** `level` is not set
- **THEN** every header has `aria-level="2"`

#### Scenario: Custom level

- **WHEN** `level` is `3`
- **THEN** every header has `aria-level="3"`

#### Scenario: Header with actions

- **WHEN** a header contains a trigger and labelled action buttons
- **THEN** the header's `aria-labelledby` equals the trigger's `id`

### Requirement: Decorative chevron

The chevron rendered by `kbq-accordion-trigger` SHALL be hidden from assistive technology, so the trigger's accessible name comes from its projected content.

#### Scenario: Trigger name

- **WHEN** a trigger with the text "Profile" is rendered
- **THEN** its chevron has `aria-hidden="true"` and the accessible name of the trigger is "Profile"

### Requirement: Nested accordions

An accordion placed inside an item's content SHALL own only its own items: the outer accordion's arrow keys MUST skip the nested triggers, toggling a nested item MUST NOT emit the outer `valueChange`, and each accordion SHALL persist its own items only.

#### Scenario: Arrow keys skip the nested accordion

- **WHEN** the first outer trigger has focus, a nested accordion sits in its content and the user presses Down
- **THEN** the second outer trigger has focus

#### Scenario: Toggling a nested item

- **WHEN** the user expands an item of the nested accordion
- **THEN** the outer accordion emits no `valueChange`

### Requirement: Expand and collapse motion

Expanding and collapsing SHALL animate the content's height and the chevron's rotation over 300 ms. When animations are disabled through `KBQ_ANIMATIONS_CONFIG`, the content and the chevron SHALL get the `kbq-animations-disabled` class and change without motion, and so SHALL they under `prefers-reduced-motion: reduce`.

#### Scenario: Animations enabled

- **WHEN** `KBQ_ANIMATIONS_CONFIG` is not provided
- **THEN** neither the content nor the chevron has `kbq-animations-disabled`

#### Scenario: Animations disabled

- **WHEN** `KBQ_ANIMATIONS_CONFIG` disables animations
- **THEN** the content and the chevron have `kbq-animations-disabled`

### Requirement: Expanded content follows its natural height

Expanded content SHALL end at the natural height of what it holds once its transition ends, is cancelled or never starts, so it follows later changes of its size. Content expanded while it had no box, for example in a closed panel, SHALL show at its full height once displayed. Collapsing SHALL animate from the current height.

#### Scenario: Expanded while the container was closed

- **WHEN** an item is expanded on init inside a closed content panel and the panel opens
- **THEN** the content is exactly as tall as its body

#### Scenario: Container gets narrower

- **WHEN** an expanded item's container is narrowed so its text wraps onto more lines
- **THEN** the content grows to its new natural height

#### Scenario: Content rendered by expanding

- **WHEN** content that renders only once the item is expanded appears during the expand
- **THEN** the expand ends at the height of that content

### Requirement: No motion on the first render

Items expanded on the first render SHALL appear expanded, with the chevron already turned, without an expand animation.

#### Scenario: Default value on page load

- **WHEN** the page loads with `defaultValue` naming an item
- **THEN** the item is shown expanded without its height or chevron animating

### Requirement: State saving is on by default

The accordion SHALL persist the values of its expanded items and restore them on the next render. `useStateSaving` SHALL default to `true`, or to the value provided as `KBQ_STATE_SAVING_ENABLED`, and `[useStateSaving]="false"` MUST stop reading and writing. Nothing SHALL be read or written while `KbqStateSavingService` is disabled.

#### Scenario: Accordion without configuration

- **WHEN** an accordion without any state-saving input is rendered and the user expands an item
- **THEN** one entry is written to the state store

#### Scenario: State saving turned off

- **WHEN** `useStateSaving` is `false` and the user expands an item
- **THEN** nothing is written to the state store

### Requirement: Persisted payload and key

The accordion SHALL write the array of expanded item values, positional values included, under `stateSavingKey`, or under a key derived from its position in the document when that input is empty, on every change. It SHALL register with `KbqStateSavingService` while it exists, and MUST NOT write on init when the stored state already matches.

#### Scenario: Toggle is persisted

- **WHEN** `stateSavingKey` is `accordion-key` and the user expands `item-1`
- **THEN** the store holds `['item-1']` under `accordion-key`

#### Scenario: Derived key

- **WHEN** `stateSavingKey` is empty and the user expands an item
- **THEN** the store holds one entry whose key ends with `kbq-accordion`

#### Scenario: Item without a value

- **WHEN** the user expands the second item, which has no `value`
- **THEN** the store holds `['kbq-item-1']`

### Requirement: Restore precedence

On the first render the accordion SHALL take its state from the bound `value` first, then from the saved state, then from a non-empty `defaultValue`, and only then from the items' own `expanded`. A saved empty array SHALL keep every item collapsed and override `defaultValue`.

#### Scenario: Saved state applied

- **WHEN** the store holds `['item-1']`
- **THEN** `item-1` is expanded after the first render

#### Scenario: Controlled value wins

- **WHEN** the store holds `['item-1']` and `value` is bound to `item-2`
- **THEN** only `item-2` is expanded

#### Scenario: Empty saved state

- **WHEN** the store holds `[]` and `defaultValue` is `item-1`
- **THEN** every item is collapsed

#### Scenario: Nothing saved

- **WHEN** the store holds nothing and `defaultValue` is `item-2`
- **THEN** `item-2` is expanded

### Requirement: Restoring in single mode

In single mode, restoring SHALL expand only the first saved value that still names an item and SHALL rewrite the store to that one value. In multiple mode every saved value SHALL be restored.

#### Scenario: Several values saved

- **WHEN** the store holds `['item-1', 'item-2']` in single mode
- **THEN** only `item-1` is expanded and the store is rewritten to `['item-1']`

#### Scenario: Stale first value

- **WHEN** the store holds `['removed-item', 'item-2']` in single mode
- **THEN** `item-2` is expanded and the store is rewritten to `['item-2']`

### Requirement: Reconciling the saved state

When items are rendered at restore time, the accordion SHALL drop saved values that match no item from the store. When no item is rendered yet, it MUST keep the saved state untouched, and items rendered later MUST NOT be expanded from it. An item rendered later with `expanded` set SHALL be persisted.

#### Scenario: Removed item

- **WHEN** the store holds `['item-1', 'removed-item']` in multiple mode
- **THEN** the store is rewritten to `['item-1']`

#### Scenario: Items arrive after initialization

- **WHEN** the store holds `['item-1']`, the accordion initializes without items and the items render later
- **THEN** the items are collapsed and the store still holds `['item-1']`

### Requirement: Unusable saved payloads

A saved payload SHALL be ignored as if nothing were saved, so `defaultValue` applies, unless it is an empty array, an array holding at least one string, or an object in the previous `{ [itemId]: { expanded, value } }` format with at least one entry whose `expanded` is a boolean and whose `value` is a string. Other entries SHALL be dropped from an accepted payload. A payload in the previous format SHALL be read as the values of its expanded entries and reconciled like any saved state.

#### Scenario: Unrelated payload

- **WHEN** the store holds a string, a number, an unrelated object or an array of non-strings and `defaultValue` is `item-2`
- **THEN** `item-2` is expanded and no error is thrown

#### Scenario: Previous format

- **WHEN** a single-mode store entry maps three item ids to `{ expanded: true, value: 'item-1' }`, `{ expanded: false, value: 'item-2' }` and `{ expanded: true, value: 'removed-item' }`
- **THEN** only `item-1` is expanded and the store is rewritten to `['item-1']`

### Requirement: Controlled value is not persisted

While `value` is bound to anything other than `null` or `undefined`, the accordion MUST NOT write to the store, even when the user toggles items. A `null` value SHALL count as unbound.

#### Scenario: Toggling a controlled accordion

- **WHEN** the store holds `['item-1']`, `value` is `item-2` and the user toggles an item
- **THEN** the store still holds `['item-1']`

#### Scenario: Null value

- **WHEN** the store holds `['item-1']` and `value` is bound to `null`
- **THEN** `item-1` is expanded and later toggles are persisted

### Requirement: Changing the state saving key

When `stateSavingKey` changes after the first render, the accordion SHALL restore the state saved under the new key once the items rendered in the same pass are bound. When nothing is saved under the new key, the items SHALL keep their current state. While `value` is bound to anything other than `null` or `undefined`, the key change SHALL instead apply the bound value again, whatever the new key holds.

#### Scenario: State under the new key

- **WHEN** the store holds `['item-2']` under `another-key` and `stateSavingKey` changes to `another-key`
- **THEN** only `item-2` is expanded

#### Scenario: Nothing under the new key

- **WHEN** the user has expanded `item-1` and `stateSavingKey` changes to a key with nothing saved
- **THEN** `item-1` stays expanded

### Requirement: Clearing the saved state

`clearSavedState()` SHALL remove the entry persisted for the accordion while leaving persistence on, so the next change is written again. `hasSavedState` SHALL be `true` while a state is restored or written, and `false` after `clearSavedState()` or while `useStateSaving` is off.

#### Scenario: Clearing

- **WHEN** the store holds `['item-1']` and `clearSavedState()` is called
- **THEN** the store holds nothing for the accordion's key and `hasSavedState` is `false`
