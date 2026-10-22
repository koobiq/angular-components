## MODIFIED Requirements

### Requirement: Hiding overflowing items from the end

During a recalculation in which `wrap` is not `'wrap'`, when the visible items do not fit along the main axis of the container, the container SHALL hide items one by one, starting from the last item in processing order, until the visible items and the shown result element fit. Items that fit SHALL stay visible. With `wrap` set to `'wrap'`, the total size of the items along the main axis SHALL NOT decide what is hidden; only the cross-axis rule of the wrap mode applies.

#### Scenario: Twenty items in a narrow container

- **WHEN** twenty 50 px items and a 100 px result element are in a 500 px container
- **THEN** the first eight items stay visible and the other twelve are hidden

#### Scenario: Container wider than the items

- **WHEN** twenty 50 px items are in a 1000 px container
- **THEN** no item is hidden

### Requirement: Always-visible items

A recalculation MUST NOT hide an item whose `alwaysVisible` is `true` when the recalculation runs; the container SHALL skip it and hide the next item in the hiding direction instead. The input SHALL default to `false` and accept a boolean attribute.

#### Scenario: Always-visible item past the visible range

- **WHEN** the eighth of twenty 50 px items is always visible and the container is 250 px wide with a 100 px result
- **THEN** exactly three items stay visible, and the eighth item is the last of them

#### Scenario: Always-visible item in reverse order

- **WHEN** the same items are in a 200 px container with `reverseOverflowOrder` set
- **THEN** exactly two items stay visible, and the eighth item is the first of them

### Requirement: Vertical orientation

With `orientation` set to `'vertical'` and `wrap` not set to `'wrap'`, the container SHALL measure heights instead of widths: its own height minus its top and bottom padding, and each item's and the result element's height plus their top and bottom margins. With `wrap` set to `'wrap'`, it SHALL compare the width of its content with its own width instead. The input SHALL default to `'horizontal'`, and changing it SHALL trigger a recalculation.

#### Scenario: Vertical container

- **WHEN** a 500 px high vertical container holds twenty 50 px high items and a 50 px high result
- **THEN** eleven items are hidden and the result reads "and 11 more"

#### Scenario: Vertical padding and margins

- **WHEN** the same container has 25 px padding, or each item has a 10 px bottom margin instead
- **THEN** twelve or thirteen items are hidden respectively

#### Scenario: Changing the orientation

- **WHEN** `orientation` changes from `'horizontal'` to `'vertical'` after the first recalculation
- **THEN** the container recalculates once
