# clamped-text Specification

## Purpose

Describes what `@koobiq/components/clamped-text` guarantees to consumers: how `kbq-clamped-text` cuts projected text to a number of lines, how `[kbqClampedList]` shortens a list of items, and how users expand and collapse either of them through a `kbqClampedListTrigger` with a pointer, the keyboard or assistive technology.

## Requirements

### Requirement: Collapsed text shows at most the set number of lines

While `kbq-clamped-text` is collapsed, its projected content SHALL be cut to `rows` lines, 5 by default (the exported `kbqClampedTextDefaultMaxRows`), and the rest SHALL be clipped in both axes, so that a word wider than the box MUST NOT give the collapsed content a horizontal scrollbar. `rows` SHALL accept a number or a numeric string. While expanded, the content SHALL be shown in full.

#### Scenario: Custom number of lines

- **WHEN** `rows` is 2 and the text needs more than three lines
- **THEN** the collapsed content shows two lines and its scroll height is greater than its client height

#### Scenario: Word wider than the box

- **WHEN** the collapsed content holds words that cannot wrap and are wider than the box
- **THEN** the content element has a computed `overflow-x` of `hidden` and shows no horizontal scrollbar

#### Scenario: Expanded content

- **WHEN** the user expands collapsed text
- **THEN** the content's scroll height equals its client height

### Requirement: One hidden line is shown instead of a toggle

Once measured, `kbq-clamped-text` SHALL collapse and render its toggle only when its latest measurement found more than `rows` + 1 rendered lines. Content measured at `rows` + 1 lines or fewer SHALL be shown in full without a toggle, whatever `isCollapsed` requests. Only a resize of the content box is measured: a change of `rows` or of the content that keeps the box size leaves the toggle as last measured. The read-only `hasToggle` signal SHALL report whether the toggle is rendered.

#### Scenario: Content that fits

- **WHEN** `rows` is 5 and the content measures 3 lines
- **THEN** the content is not collapsed and no toggle is rendered

#### Scenario: Exactly one extra line

- **WHEN** `rows` is 19 and the content measures 20 lines
- **THEN** the full content is shown and no toggle is rendered

#### Scenario: Content that overflows

- **WHEN** `rows` is 5, `isCollapsed` is not set and the content measures 20 lines
- **THEN** the content is collapsed and the toggle is rendered

#### Scenario: Collapse requested for content that fits

- **WHEN** `isCollapsed` is `true` and the content measures 3 lines with `rows` at 5
- **THEN** the content is shown in full and no toggle is rendered

### Requirement: Rendering before the first measurement

Until its content has been measured for the first time, `kbq-clamped-text` SHALL apply the requested state as is — collapsed unless `isCollapsed` is `false` — and MUST NOT render the toggle. The content is measured only in the browser, so markup rendered on the server SHALL keep this state.

#### Scenario: First paint of long text

- **WHEN** the component has rendered and no measurement has arrived yet
- **THEN** the content has the class `kbq-clamped-text__content_collapsed`
- **AND** no toggle is rendered

#### Scenario: Server rendering

- **WHEN** the component is rendered on the server with `isCollapsed` not set
- **THEN** the markup has the collapsed content and no toggle

### Requirement: Re-measuring on resize

`kbq-clamped-text` SHALL measure its content again each time the size of the content box changes, `debounceTime` milliseconds (0 by default) after the last change, and SHALL render or remove the toggle from the new measurement. A re-measurement MUST NOT change the state the user or the parent requested. A new `debounceTime` SHALL apply from the next change on.

#### Scenario: Resize right after expanding

- **WHEN** the user expands the text and a resize of the content box arrives
- **THEN** the text stays expanded

#### Scenario: Container widens

- **WHEN** the user has expanded the text, its container is widened, and the content still exceeds `rows` + 1 lines
- **THEN** the text stays expanded

#### Scenario: Debounced measurement

- **WHEN** `debounceTime` is 300 and the content box is resized several times in quick succession
- **THEN** the content is measured once, 300 ms after the last resize

### Requirement: Toggle label and icon

The toggle of `kbq-clamped-text` SHALL be rendered after the content as a pseudo link with the class `kbq-clamped-text__toggle`. While the content is collapsed it SHALL read the locale's `openText` with a chevron-down icon, and while it is expanded the locale's `closeText` with a chevron-up icon.

#### Scenario: Default locale

- **WHEN** collapsed text with a toggle is rendered under the default `ru-RU` locale
- **THEN** the toggle reads "Развернуть" with a chevron-down icon
- **AND** after the user expands the text it reads "Свернуть" with a chevron-up icon

### Requirement: Toggle flips the clamped text

Activating the toggle of `kbq-clamped-text` SHALL flip the content between collapsed and expanded, adding or removing the class `kbq-clamped-text__content_collapsed` and updating the toggle's `aria-expanded`.

#### Scenario: Expanding through the toggle

- **WHEN** the text is collapsed, its toggle has `aria-expanded="false"`, and the user clicks the toggle
- **THEN** the content loses the class `kbq-clamped-text__content_collapsed`
- **AND** the toggle has `aria-expanded="true"`

### Requirement: Collapsed state of the clamped text

`isCollapsed` of `kbq-clamped-text` SHALL accept `true` (collapsed), `false` (expanded) and `undefined` (the default: collapsed whenever the latest measurement found the content overflowing), and SHALL support two-way binding with `[(isCollapsed)]`. A value the parent writes SHALL take effect at once.

#### Scenario: Initially expanded

- **WHEN** `isCollapsed` is `false` from the start and the content overflows
- **THEN** after the measurement the text is expanded and the toggle has `aria-expanded="true"`

#### Scenario: Parent expands the text

- **WHEN** the text is collapsed and the parent sets `isCollapsed` to `false`
- **THEN** the text is expanded

### Requirement: Collapsed state changes are reported for toggles only

`kbq-clamped-text` SHALL emit `isCollapsedChange` with the new state each time it is toggled, by the user through its toggle or by a call to `toggle()`. It MUST NOT emit for its own measurements or for a value the parent wrote.

#### Scenario: User expands the text

- **WHEN** the user clicks the toggle of collapsed text
- **THEN** `isCollapsedChange` emits `false`

#### Scenario: First measurement

- **WHEN** the content is measured for the first time and turns out to overflow
- **THEN** `isCollapsedChange` does not emit

#### Scenario: Parent write

- **WHEN** the parent sets `isCollapsed` to `false`
- **THEN** `isCollapsedChange` does not emit

### Requirement: Programmatic toggle of the clamped text

`toggle(event)` on `kbq-clamped-text` SHALL flip the requested state, treating `undefined` as collapsed, and SHALL stop the propagation of the event it is given. A call made from an `effect()` MUST NOT make that effect run again when the state changes.

#### Scenario: Toggle from an effect

- **WHEN** an effect calls `toggle()` once while the state is not set
- **THEN** the text is expanded
- **AND** after the user collapses it again the effect has still run only once

### Requirement: Scrolling back on collapse

When toggling collapses `kbq-clamped-text`, the component SHALL scroll its host into view with `block` and `inline` set to `nearest` after the next render. `scrollOnCollapse` set to `false` SHALL turn this off. Expanding MUST NOT scroll.

#### Scenario: Collapsing

- **WHEN** the user expands the text and then collapses it with the toggle
- **THEN** the host is scrolled into view with `{ block: 'nearest', inline: 'nearest' }`

#### Scenario: Scrolling turned off

- **WHEN** `scrollOnCollapse` is `false` and the user expands and collapses the text
- **THEN** nothing is scrolled

#### Scenario: Expanding

- **WHEN** the user expands collapsed text
- **THEN** nothing is scrolled

### Requirement: Controlled region of the clamped text

The content element of `kbq-clamped-text` SHALL carry a unique id, exposed as `contentId`, and the toggle's `aria-controls` SHALL point at that element.

#### Scenario: aria-controls resolves

- **WHEN** the toggle is rendered
- **THEN** the element whose id equals the toggle's `aria-controls` is the content element

### Requirement: Host and content classes of the clamped text

The host of `kbq-clamped-text` SHALL have the class `kbq-clamped-text` and MUST NOT carry a role or `aria-expanded`. The content element SHALL have the class `kbq-clamped-text__content`, plus `kbq-clamped-text__content_collapsed` while the content is collapsed.

#### Scenario: Host without disclosure state

- **WHEN** collapsed text with a toggle is rendered
- **THEN** the `kbq-clamped-text` host has no `aria-expanded` attribute

#### Scenario: Collapsed class

- **WHEN** the content is collapsed
- **THEN** the content element has the classes `kbq-clamped-text__content` and `kbq-clamped-text__content_collapsed`

### Requirement: Clamped list shows the first items while collapsed

`[kbqClampedList]` SHALL expose in `visibleItems` the first `collapsedVisibleCount` entries of `items` (10 by default) while it is collapsed and has a toggle, and all of `items` otherwise. `items` SHALL default to an empty array. The directive MUST NOT render items itself: the consumer renders `visibleItems()`.

#### Scenario: Collapsed list

- **WHEN** the list has 17 items and the default settings
- **THEN** `visibleItems()` holds the first 10 items

#### Scenario: Expanded list

- **WHEN** the user activates the trigger of that list
- **THEN** `visibleItems()` holds all 17 items

### Requirement: Clamped list toggle threshold

`[kbqClampedList]` SHALL report `hasToggle` as `true` when the number of items beyond `collapsedVisibleCount` is at least `hiddenThreshold` (6 by default), and as `false` otherwise. Without a toggle, all items SHALL be visible even while the list is collapsed.

#### Scenario: Enough hidden items

- **WHEN** the list has 17 items, so 7 would be hidden
- **THEN** `hasToggle()` is `true`

#### Scenario: Too few hidden items

- **WHEN** the list has 12 items, so 2 would be hidden
- **THEN** `hasToggle()` is `false` and all 12 items are visible

#### Scenario: List shorter than the limit

- **WHEN** the list has 9 items
- **THEN** `hasToggle()` is `false`

### Requirement: Hidden item count

`exceededItemCount` of `[kbqClampedList]` SHALL equal the number of items minus `collapsedVisibleCount`, which is negative for a list shorter than the limit. `showMoreCountText` SHALL be the locale's `showMoreText` with `{exceededItemCount}` replaced by that number.

#### Scenario: Count in the trigger label

- **WHEN** the list has 17 items with the default settings under the `en-US` strings
- **THEN** `exceededItemCount()` is 7 and `showMoreCountText()` is "Show 7 more"

#### Scenario: Short list

- **WHEN** the list has 5 items with the default settings
- **THEN** `exceededItemCount()` is -5

### Requirement: Collapsed state of the clamped list

`isCollapsed` of `[kbqClampedList]` SHALL default to `true` and SHALL support two-way binding with `[(isCollapsed)]`. `toggle(event)` SHALL flip it, emit `isCollapsedChange` with the new value, and stop the propagation of the event it is given.

#### Scenario: Expanding and collapsing again

- **WHEN** the user activates the trigger of a collapsed list twice
- **THEN** all items are visible after the first activation and the first `collapsedVisibleCount` items after the second

#### Scenario: Reporting the change

- **WHEN** the list is bound with `(isCollapsedChange)` and the user expands it
- **THEN** `isCollapsedChange` emits `false`

### Requirement: Clamped list host and id

The host of `[kbqClampedList]` SHALL have the class `kbq-clamped-list` and an `id`: the id it already carries when the directive is created, or a generated unique one. The id SHALL be exposed as `contentId`, and the trigger's `aria-controls` SHALL point at the host. The host MUST NOT carry `aria-expanded`.

#### Scenario: Generated id

- **WHEN** a list without an id has a trigger
- **THEN** the host has an id and the element the trigger's `aria-controls` points at is the host

#### Scenario: Existing id

- **WHEN** the host is written with `id="tags"`
- **THEN** the host keeps the id `tags` and the trigger has `aria-controls="tags"`

#### Scenario: Host without disclosure state

- **WHEN** a list with a trigger is rendered
- **THEN** the list host has no `aria-expanded` attribute

### Requirement: Trigger disclosure semantics

An element with `kbqClampedListTrigger` inside a clamped text or clamped list SHALL get `role="button"`, `tabindex="0"`, the class `kbq-clamped-list__trigger`, an `aria-controls` equal to the container's `contentId`, and an `aria-expanded` that is `"false"` while the container is collapsed and has a toggle, and `"true"` otherwise. The toggle of `kbq-clamped-text` SHALL be such a trigger.

#### Scenario: Collapsed list

- **WHEN** a collapsed list renders its trigger
- **THEN** the trigger has `role="button"`, `tabindex="0"` and `aria-expanded="false"`
- **AND** after the user clicks it, `aria-expanded="true"`

#### Scenario: Toggle of the clamped text

- **WHEN** clamped text renders its toggle
- **THEN** the toggle has `role="button"` and `tabindex="0"`

#### Scenario: Trigger of a container without a toggle

- **WHEN** a consumer renders a trigger in a list whose `hasToggle()` is `false`
- **THEN** the trigger has `aria-expanded="true"`

### Requirement: Written role and tab index win over the trigger defaults

A `role` or `tabindex` attribute written on a trigger element in the template SHALL take precedence over the `role="button"` and `tabindex="0"` the trigger supplies.

#### Scenario: Trigger taken out of the tab order

- **WHEN** a `<span kbqClampedListTrigger tabindex="-1">` is rendered in a list with a toggle
- **THEN** the span has `tabindex="-1"` and `role="button"`

### Requirement: Pointer activates the trigger

A click on a trigger SHALL toggle its container and MUST NOT propagate past the trigger.

#### Scenario: Clicking the list trigger

- **WHEN** the user clicks the trigger of a collapsed list
- **THEN** the list is expanded

#### Scenario: Trigger inside a clickable element

- **WHEN** the trigger sits inside an element with its own click handler and the user clicks the trigger
- **THEN** the container toggles and the outer handler is not called

### Requirement: Keyboard activates the trigger

A keydown of Enter or Space on a trigger SHALL toggle its container once and prevent the key's default action, so that Space does not scroll the page and a native button or a `kbqLink` on the same element does not toggle it a second time. The keydown MUST NOT propagate past the trigger.

#### Scenario: Space on the clamped-text toggle

- **WHEN** the toggle of collapsed text has focus and the user presses Space
- **THEN** the text is expanded and the keydown's default action is prevented

#### Scenario: Enter on the clamped-text toggle

- **WHEN** the toggle of collapsed text has focus and the user presses Enter
- **THEN** the text is expanded and the keydown's default action is prevented

#### Scenario: Space on a pseudo-link trigger

- **WHEN** the trigger of a collapsed list is an `<a kbqLink pseudo>` and the user presses Space on it
- **THEN** the trigger has `aria-expanded="true"` and the page has not scrolled

### Requirement: Trigger outside a clamped container

A `kbqClampedListTrigger` with no clamped text or clamped list around it SHALL keep `role="button"` and `tabindex="0"`, MUST NOT carry `aria-expanded` or `aria-controls`, and SHALL change nothing when activated, though Enter and Space still have their default action prevented.

#### Scenario: Stray trigger

- **WHEN** an element with `kbqClampedListTrigger` is rendered outside any clamped container and the user clicks it
- **THEN** it has `role="button"` and `tabindex="0"`, no `aria-expanded` and no `aria-controls`, and nothing toggles

### Requirement: Accessibility of both states

Clamped text with its toggle and a clamped list with its trigger SHALL pass the axe checks both while collapsed and while expanded.

#### Scenario: Clamped text

- **WHEN** axe runs on overflowing clamped text before and after the user expands it
- **THEN** it reports no violations either time

#### Scenario: Clamped list

- **WHEN** axe runs on a clamped list with its trigger before and after the user expands it
- **THEN** it reports no violations either time

### Requirement: Localized strings

The strings of the `clampedText` locale section — `openText` and `closeText` on the toggle of `kbq-clamped-text`, `showMoreText` in `showMoreCountText`, and `moreText` — SHALL follow the active locale, `ru-RU` by default, and SHALL be readable by the consumer through `localeConfiguration()` on both containers.

#### Scenario: Switching the locale

- **WHEN** the application switches the locale to `en-US`
- **THEN** the toggle of collapsed text reads "Expand", and "Collapse" once expanded

#### Scenario: Strings for a list trigger

- **WHEN** a consumer renders `localeConfiguration().closeText` in the trigger of an expanded list under `ru-RU`
- **THEN** the trigger reads "Свернуть"

### Requirement: Overriding the strings

`kbqClampedTextLocaleConfigurationProvider()` SHALL override the given strings for an injector scope, and `[localeOverrides]` on `kbq-clamped-text` or `[kbqClampedList]` SHALL override them for that container and its subtree. Keys left out SHALL keep following the active locale. Without a locale service, a provided `KBQ_CLAMPED_TEXT_LOCALE_CONFIGURATION` SHALL replace the default strings.

#### Scenario: Provider for a component scope

- **WHEN** a component provides `kbqClampedTextLocaleConfigurationProvider()` with the `en-US` strings
- **THEN** clamped text inside it reads "Expand" under the default `ru-RU` locale

#### Scenario: Override for one container

- **WHEN** one clamped text binds `[localeOverrides]` with its own `clampedText.openText`
- **THEN** only that toggle shows the overridden text while collapsed, and its `closeText` still follows the locale

### Requirement: Template reference names

`kbq-clamped-text`, `[kbqClampedList]` and `[kbqClampedListTrigger]` SHALL be exported to templates as `kbqClampedText`, `kbqClampedList` and `kbqClampedListTrigger`.

#### Scenario: Rendering a list through its reference

- **WHEN** a template declares `#list="kbqClampedList"` on the list host
- **THEN** it can render `list.visibleItems()` and show its trigger while `list.hasToggle()` is `true`

### Requirement: NgModule

`KbqClampedTextModule` SHALL import and re-export `KbqClampedText`, `KbqClampedList` and `KbqClampedListTrigger`, so that an NgModule that imports it can use all three.

#### Scenario: NgModule consumer

- **WHEN** an NgModule imports `KbqClampedTextModule`
- **THEN** its templates can use `kbq-clamped-text`, `[kbqClampedList]` and `[kbqClampedListTrigger]`
