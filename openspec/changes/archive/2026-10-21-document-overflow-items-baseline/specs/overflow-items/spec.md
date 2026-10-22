# Spec Delta

## Purpose

Describes what `kbqOverflowItems`, `kbqOverflowItem` and `kbqOverflowItemsResult` from `@koobiq/components/overflow-items` guarantee to consumers: which items of a row or column stay visible when the container is too small, how the hidden state shows in the DOM, how the set of hidden items is reported, and what makes the directives recalculate.

## ADDED Requirements

### Requirement: Directives and module

The entry point SHALL provide the standalone directives `kbqOverflowItems` (the container), `kbqOverflowItem` (an item that can be hidden) and `kbqOverflowItemsResult` (the element shown in place of hidden items), and `KbqOverflowItemsModule`, which SHALL import and re-export all three. Each directive SHALL be exported to templates under its selector name: `kbqOverflowItems`, `kbqOverflowItem` and `kbqOverflowItemsResult`.

#### Scenario: Reading the container from a template reference

- **WHEN** a template declares `#ref="kbqOverflowItems"` on the container and renders `and {{ ref.hiddenItemIDs().size }} more` in the result element
- **THEN** the result element shows the number of hidden items

#### Scenario: Using the module

- **WHEN** a component imports `KbqOverflowItemsModule` instead of the three directives
- **THEN** the container, its items and its result element work the same way

### Requirement: Item identifier

The value of `kbqOverflowItem` SHALL identify the item and SHALL be what the container reports for the item when it is hidden. A bound value SHALL be kept as is, whatever its type; a plain attribute SHALL give its string value.

#### Scenario: Plain attribute

- **WHEN** an item is declared as `kbqOverflowItem="item"` and is hidden
- **THEN** the container's set of hidden IDs contains the string `'item'`

#### Scenario: Identifier reported for a hidden item

- **WHEN** the item `[kbqOverflowItem]="'Item19'"` is hidden
- **THEN** the container's set of hidden IDs contains `'Item19'`

### Requirement: Which elements the container manages

The container SHALL manage the `kbqOverflowItem` elements that are its direct children, also when they are rendered through `<ng-container>` or control-flow blocks such as `@for` and `@if`. An item nested inside another element of the container MUST NOT be managed. The container SHALL use the first `kbqOverflowItemsResult` among its descendants as its result element; the result element is optional.

#### Scenario: Items rendered with a loop

- **WHEN** the items are rendered with `@for` directly inside the container
- **THEN** every rendered item is measured and can be hidden

#### Scenario: Container without a result element

- **WHEN** the container has items but no `kbqOverflowItemsResult`
- **THEN** recalculation runs without an error and reports the hidden items through `changes`

### Requirement: Host classes

The container SHALL have the class `kbq-overflow-items`, every item the class `kbq-overflow-item` and the result element the class `kbq-overflow-items-result`. An item whose `alwaysVisible` is `true` SHALL also have the class `kbq-overflow-item_always-visible`.

#### Scenario: Always-visible item

- **WHEN** one of twenty items has `alwaysVisible` set
- **THEN** only that item has the class `kbq-overflow-item_always-visible`

### Requirement: Container layout

The container SHALL set inline styles on its host: `display: flex`, `position: relative`, `overflow: hidden`, `flex-grow: 1`, `flex-direction` `row` for the horizontal and `column` for the vertical orientation, and `flex-wrap` equal to the `wrap` input, `'nowrap'` by default. The direction and wrap styles SHALL follow later changes of `orientation` and `wrap`.

#### Scenario: Default wrap

- **WHEN** a container is rendered without a `wrap` binding
- **THEN** its host has the inline style `flex-wrap: nowrap`

#### Scenario: Changing the wrap

- **WHEN** `wrap` changes to `'wrap'`
- **THEN** the host's inline `flex-wrap` becomes `wrap`

#### Scenario: Vertical container

- **WHEN** `orientation` is `'vertical'`
- **THEN** the host has the inline style `flex-direction: column`

### Requirement: Hiding overflowing items from the end

When the visible items do not fit along the main axis of the container, the container SHALL hide items one by one, starting from the last item in processing order, until the visible items and the shown result element fit. Items that fit SHALL stay visible.

#### Scenario: Twenty items in a narrow container

- **WHEN** twenty 50 px items and a 100 px result element are in a 500 px container
- **THEN** the first eight items stay visible and the other twelve are hidden

#### Scenario: Container wider than the items

- **WHEN** twenty 50 px items are in a 1000 px container
- **THEN** no item is hidden

### Requirement: Measuring the available space

Along the main axis, the space available to items SHALL be the rendered size of the container minus its padding on both sides. Each visible item SHALL take its rendered size plus its margins on both sides of the main axis, and the result element, while shown, SHALL take its size and margins the same way.

#### Scenario: Container padding

- **WHEN** a 500 px container has 25 px padding, holds twenty 50 px items and a 100 px result
- **THEN** thirteen items are hidden

#### Scenario: Item margins

- **WHEN** each 50 px item has a 10 px right margin, or a 10 px left margin, in a 500 px container with a 100 px result
- **THEN** fourteen items are hidden

### Requirement: Result element visibility

After a recalculation the result element SHALL be shown exactly when at least one item is hidden. While it is shown, its size SHALL be reserved when the container checks whether the remaining items fit.

#### Scenario: Some items hidden

- **WHEN** items overflow the container and some are hidden
- **THEN** the result element does not have the class `kbq-overflow-item-hidden`

#### Scenario: Everything fits

- **WHEN** all items fit in the container without the result element
- **THEN** the result element has the class `kbq-overflow-item-hidden`

### Requirement: Hidden state in the DOM

A hidden item or result element SHALL stay in the DOM and SHALL get the class `kbq-overflow-item-hidden`, `aria-hidden="true"` and the inline styles `visibility: hidden` and `position: absolute`. A shown one SHALL lose that class and those two inline styles and SHALL have `aria-hidden="false"`.

#### Scenario: Hiding an item

- **WHEN** an item is hidden
- **THEN** its element is still in the DOM with the class `kbq-overflow-item-hidden`, `aria-hidden="true"`, `visibility: hidden` and `position: absolute`

#### Scenario: Showing a hidden item again

- **WHEN** a hidden item is shown again
- **THEN** its inline `visibility` and `position` are removed
- **AND** it has `aria-hidden="false"`

### Requirement: Set of hidden item IDs

The container SHALL expose `hiddenItemIDs`, a signal holding a read-only set of the `kbqOverflowItem` values of the hidden items, listed in processing order. The signal SHALL hold an empty set until the first recalculation and afterwards the set last emitted by `changes`.

#### Scenario: Counter in the result element

- **WHEN** twelve items are hidden and the result element renders `and {{ ref.hiddenItemIDs().size }} more`
- **THEN** the result element reads "and 12 more"

#### Scenario: Before the first recalculation

- **WHEN** the container has rendered and no recalculation has run yet
- **THEN** `hiddenItemIDs()` is an empty set

#### Scenario: Value emitted by `changes`

- **WHEN** `changes` emits a set
- **THEN** `hiddenItemIDs()` returns that same set

### Requirement: Change notification

The `changes` output SHALL emit a new set of hidden item IDs after every recalculation, also when the hidden items are the same as before.

#### Scenario: Recalculation with nothing hidden

- **WHEN** the container is resized, nothing was hidden before and nothing is hidden after
- **THEN** `changes` emits a new empty set, not the previous set object

### Requirement: Reverse overflow order

With `reverseOverflowOrder` set to `true`, the container SHALL hide items starting from the first item in processing order instead of the last, so the last items stay visible. The input SHALL default to `false` and accept a boolean attribute. Changing it SHALL trigger a recalculation.

#### Scenario: Hiding from the start

- **WHEN** `reverseOverflowOrder` is set and twenty items overflow the container
- **THEN** the last visible item is the twentieth one

#### Scenario: Toggling the input

- **WHEN** `reverseOverflowOrder` changes from `false` to `true` after the first recalculation
- **THEN** the container recalculates once

### Requirement: Processing order of items

The processing order SHALL sort items by their `order` input in ascending order. An item without `order` SHALL take its index among the items as its order, and items with equal order SHALL keep their template order. `order` SHALL accept numbers and numeric strings and MUST NOT move the item in the DOM.

#### Scenario: Item kept until last

- **WHEN** twenty 50 px items are in a 200 px container with a 100 px result, each with `order` equal to its index except the sixth, whose `order` is `-Infinity`
- **THEN** exactly two items stay visible, the first and the sixth

#### Scenario: Item kept until last in reverse order

- **WHEN** the same items are used with `reverseOverflowOrder` set and the sixth item's `order` is `+Infinity`
- **THEN** exactly two items stay visible, and the sixth one is the first of them

#### Scenario: No room for any item

- **WHEN** the same items are in a 49 px container
- **THEN** every item is hidden, including the one with the lowest order

### Requirement: Always-visible items

An item with `alwaysVisible` set to `true` MUST NOT be hidden; the container SHALL skip it and hide the next item in the hiding direction instead. The input SHALL default to `false` and accept a boolean attribute.

#### Scenario: Always-visible item past the visible range

- **WHEN** the eighth of twenty 50 px items is always visible and the container is 250 px wide with a 100 px result
- **THEN** exactly three items stay visible, and the eighth item is the last of them

#### Scenario: Always-visible item in reverse order

- **WHEN** the same items are in a 200 px container with `reverseOverflowOrder` set
- **THEN** exactly two items stay visible, and the eighth item is the first of them

### Requirement: Nothing left to hide

When the content still overflows but every remaining visible item is always visible, the container SHALL stop hiding. The always-visible items SHALL stay visible and the result element SHALL stay shown if an item was hidden.

#### Scenario: Container smaller than one item

- **WHEN** the eighth of twenty 50 px items is always visible and the container is 49 px wide
- **THEN** only the eighth item is visible
- **AND** the result element is shown

### Requirement: Alignment does not affect hiding

The container SHALL honour a `justify-content` set by the consumer, and the alignment MUST NOT change which items are hidden or whether the result element is shown. Hidden items take no space in the alignment.

#### Scenario: Items aligned to the end

- **WHEN** the container has `justify-content: end` with twenty 50 px items, a 100 px result and a 500 px width
- **THEN** twelve items are hidden and the result reads "and 12 more", as with the default alignment

#### Scenario: Alignment and reverse order

- **WHEN** the container has `justify-content: end` and `reverseOverflowOrder` set
- **THEN** the twentieth item is the last visible one

### Requirement: Vertical orientation

With `orientation` set to `'vertical'`, the container SHALL measure heights instead of widths: its own height minus its top and bottom padding, and each item's and the result element's height plus their top and bottom margins. The input SHALL default to `'horizontal'`, and changing it SHALL trigger a recalculation.

#### Scenario: Vertical container

- **WHEN** a 500 px high vertical container holds twenty 50 px high items and a 50 px high result
- **THEN** eleven items are hidden and the result reads "and 11 more"

#### Scenario: Vertical padding and margins

- **WHEN** the same container has 25 px padding, or each item has a 10 px bottom margin instead
- **THEN** twelve or thirteen items are hidden respectively

#### Scenario: Changing the orientation

- **WHEN** `orientation` changes from `'horizontal'` to `'vertical'` after the first recalculation
- **THEN** the container recalculates once

### Requirement: Wrap mode

With `wrap` set to `'wrap'`, the items SHALL wrap onto several lines, and the container SHALL count as overflowing while its content is larger than its cross-axis size: taller than its height in the horizontal orientation, wider than its width in the vertical one. Items SHALL then be hidden in the same order until the content fits.

#### Scenario: Wrapped items that fit

- **WHEN** a 500 px wide horizontal container with `wrap="wrap"` and `max-height: 100px` holds twenty 50 px items that wrap into two rows within that height
- **THEN** no item is hidden

#### Scenario: Wrapped items that do not fit

- **WHEN** a 500 px wide horizontal container with `wrap="wrap"` and `max-height: 70px` holds twenty 50 px wide, 30 px high items with 10 px right margins and a 100 px wide, 30 px high result
- **THEN** six items are hidden, so that two rows hold the visible items and the result

#### Scenario: Vertical wrap

- **WHEN** a 500 px high vertical container with `wrap="wrap"` and `max-width: 122px` holds twenty 50 px wide items with 10 px bottom margins and a 50 px wide result
- **THEN** five items are hidden

### Requirement: Recalculation triggers

The container SHALL recalculate after its first render, when items are added or removed, when the container's own size changes, when an observed resize target changes size, and when `reverseOverflowOrder` or `orientation` changes. Every recalculation SHALL start from all items shown, so items hidden earlier SHALL reappear when there is room again.

#### Scenario: Container resized

- **WHEN** a container with twelve hidden items is widened to 600 px and then narrowed to 400 px
- **THEN** ten and then fourteen items are hidden

#### Scenario: Items removed

- **WHEN** a 100 px container with a 50 px result holds four 50 px items and the last one is removed, then two more
- **THEN** three, then two, then no items are hidden

### Requirement: Debounced recalculation

Every trigger SHALL be debounced by `debounceTime` milliseconds, `0` by default: the recalculation SHALL run once that time has passed since the last trigger, and never synchronously with the trigger. The input SHALL accept a number or a numeric string, and its current value SHALL be read at each trigger.

#### Scenario: Burst of resizes

- **WHEN** `debounceTime` is 100 and the container is resized twice, 50 ms apart
- **THEN** no recalculation runs until 100 ms after the second resize, and then exactly one runs

#### Scenario: Changing the delay

- **WHEN** `debounceTime` changes to 300 and the container is resized
- **THEN** the recalculation runs 300 ms after the resize, not earlier

### Requirement: Additional resize targets

Besides the container itself, the container SHALL observe the size of `additionalResizeObserverTargets`, a single element or an array of elements, `document.body` by default. A bound value SHALL replace the default, and when it changes, the old targets SHALL stop being observed and the new ones SHALL be observed.

#### Scenario: Default target

- **WHEN** no `additionalResizeObserverTargets` is bound
- **THEN** the container observes `document.body`

#### Scenario: Array of targets

- **WHEN** an array of two elements is bound
- **THEN** both elements are observed

#### Scenario: Replacing the targets

- **WHEN** the bound targets are replaced with other elements
- **THEN** the old targets are no longer observed and the new ones are

#### Scenario: Target resized

- **WHEN** an observed target element changes its width
- **THEN** the container recalculates which items are hidden

### Requirement: Manual hide and show

Items and the result element SHALL expose `hidden`, a signal of their hidden state, the methods `hide()` and `show()`, which apply the hidden or shown state, and their host `element`. `hide()` on an item with `alwaysVisible` set SHALL do nothing, and calling it inside an `effect()` MUST NOT make that effect depend on `alwaysVisible`. The next recalculation SHALL overwrite a manually set state.

#### Scenario: Hiding an item by hand

- **WHEN** code calls `hide()` on an item
- **THEN** `hidden()` returns `true` and the item has the hidden state in the DOM

#### Scenario: Hiding an always-visible item

- **WHEN** code calls `hide()` on an item with `alwaysVisible` set
- **THEN** `hidden()` stays `false` and the item has no inline `visibility`

#### Scenario: Hiding from an effect

- **WHEN** an effect calls `hide()` on an item and the item's `alwaysVisible` then changes
- **THEN** the effect does not run again

### Requirement: State before the first recalculation

Until the first recalculation, which runs asynchronously after the first render, every item and the result element SHALL be shown and `hiddenItemIDs` SHALL be an empty set.

#### Scenario: Right after the first render

- **WHEN** the container has just rendered and the debounce timer has not fired
- **THEN** no item is hidden, the result element is shown and `hiddenItemIDs()` is empty

### Requirement: Server rendering

On a platform other than the browser, the container MUST NOT observe sizes or recalculate. Every item and the result element SHALL render shown, and the container SHALL still set its inline layout styles.

#### Scenario: Server-rendered container

- **WHEN** a container with more items than fit is rendered on the server
- **THEN** the HTML has no item with the class `kbq-overflow-item-hidden`
- **AND** the container has the inline `display: flex` and `overflow: hidden`
