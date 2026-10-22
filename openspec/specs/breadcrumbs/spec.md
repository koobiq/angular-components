# breadcrumbs Specification

## Purpose

Describes what `kbq-breadcrumbs` from `@koobiq/components/breadcrumbs` guarantees to consumers: how it renders and routes its items, how it collapses them behind the expand button when space or `max` runs out, how the items can be customized, and how users reach them with a pointer, the keyboard or assistive technology.

## Requirements

### Requirement: Items render in declaration order

`kbq-breadcrumbs`, used as an element or as the `kbq-breadcrumbs` attribute (usually on `<nav>`), SHALL render one entry per `kbq-breadcrumb-item` child, in declaration order, and SHALL re-render when items are added or removed. Without a custom template an entry SHALL be an `<a kbq-button kbqBreadcrumb>` showing the item's `text`.

#### Scenario: Three items

- **WHEN** a trail declares three `kbq-breadcrumb-item` elements with the texts "Home", "Library" and "Data"
- **THEN** the trail renders three entries with those texts, in that order

#### Scenario: Item added later

- **WHEN** the consumer adds a fourth item to the list the trail iterates over
- **THEN** the trail renders four entries

### Requirement: Item content outside a template is not shown

The trail SHALL show for each item only its `text` or its `kbqBreadcrumbView` template. Content projected into a `kbq-breadcrumb-item` outside such a template MUST NOT be displayed.

#### Scenario: Plain child content

- **WHEN** a `kbq-breadcrumb-item` with `text="Home"` contains a `<span>` that is not inside a `kbqBreadcrumbView` template
- **THEN** the trail shows "Home" and the `<span>` is not visible

### Requirement: Routing through the item

A `routerLink` placed on a `kbq-breadcrumb-item` SHALL become the destination of the item's default entry and of its row in the expand dropdown, as the URL tree it builds from its commands, `queryParams`, `fragment`, `queryParamsHandling`, `preserveFragment` and `relativeTo`. The item's `target`, `state`, `info`, `replaceUrl` and `skipLocationChange` are not carried over. An item without a `routerLink` SHALL render an entry without a destination.

#### Scenario: Link with query parameters

- **WHEN** an item has `routerLink="/main"`, `[queryParams]="{ q: '1' }"` and `fragment="top"`
- **THEN** its entry links to `/main?q=1#top`

#### Scenario: Navigation options on the item

- **WHEN** an item has `routerLink="/main"` and `target="_blank"`
- **THEN** its entry links to `/main` and has no `target` attribute
- **AND** a click on the entry navigates in the current tab

### Requirement: Separators between entries

Between two consecutive entries the trail SHALL render a separator, by default an `<i class="kbq-breadcrumb__separator">` reading " / " with `aria-hidden="true"`. No separator SHALL follow the last entry.

#### Scenario: Default separators

- **WHEN** a trail renders three items without a custom separator
- **THEN** a "/" separator stands between the first and second and between the second and third entry
- **AND** every separator has `aria-hidden="true"`

### Requirement: Disabled item

An item with `disabled` set SHALL render its default entry with `aria-disabled="true"`, the `kbq-disabled` class and `tabindex="-1"`. The entry MUST NOT navigate when clicked and SHALL be skipped by the arrow keys.

#### Scenario: One disabled item

- **WHEN** the middle item of three has `disabled` set
- **THEN** its entry has `aria-disabled="true"`, `kbq-disabled` and `tabindex="-1"`
- **AND** a click on it does not navigate

### Requirement: Sizes

The `size` input SHALL accept `compact`, `normal` and `big`, default to the configured size (`normal` unless configured otherwise), and SHALL put the matching `kbq-breadcrumbs_compact`, `kbq-breadcrumbs_normal` or `kbq-breadcrumbs_big` class on the host.

#### Scenario: Default size

- **WHEN** a trail is rendered without `size` and without a configuration provider
- **THEN** the host has the class `kbq-breadcrumbs_normal`

#### Scenario: Big trail

- **WHEN** `size` is `big`
- **THEN** the host has `kbq-breadcrumbs_big` and neither of the other size classes

### Requirement: ArrowDown is left to the item

The trail MUST NOT consume Up or Down arrow keys, so an entry that is a dropdown trigger (a custom `kbqBreadcrumb` button with `kbqDropdownTriggerFor`) SHALL open its dropdown on ArrowDown as it does outside a trail.

#### Scenario: Siblings dropdown on an item

- **WHEN** the last item is a custom `<button kbq-button kbqBreadcrumb [kbqDropdownTriggerFor]>` with focus and the user presses ArrowDown
- **THEN** its dropdown opens, opened by the keyboard

### Requirement: Custom item template

A template marked with `*kbqBreadcrumbView` inside a `kbq-breadcrumb-item` SHALL replace that item's default entry and SHALL be rendered as authored. The trail's handling of the default entry — `text`, the item's `disabled` and `current`, the trail's `disabled`, and the current-page state of the last item — MUST NOT be applied to it.

#### Scenario: Every item with a template

- **WHEN** each of four items has a `*kbqBreadcrumbView` template rendering `<a class="custom-breadcrumb">`
- **THEN** the trail renders four `.custom-breadcrumb` elements and no default entry

#### Scenario: Last item with a template

- **WHEN** the last item has a `*kbqBreadcrumbView` template without `aria-current`
- **THEN** the rendered template has no `aria-current` and is not disabled by the trail

### Requirement: Custom separator

An `<ng-template kbqBreadcrumbsSeparator>` inside the trail SHALL replace every separator of that trail. The template SHALL be rendered as authored; the trail MUST NOT add `aria-hidden` to it.

#### Scenario: Separator template

- **WHEN** a trail of four items declares a separator template rendering `<div class="custom-separator">`
- **THEN** each of the first three item entries is followed by a `.custom-separator` and the last one is not

### Requirement: Breadcrumb button directive

`kbqBreadcrumb` on a `kbq-button` host SHALL add the `kbq-breadcrumb-item` class, join the trail's arrow-key navigation, and apply the transparent button style with the contrast color. A `kbqStyle` or `color` the consumer binds on the button SHALL win over those defaults.

#### Scenario: Consumer color

- **WHEN** a custom template renders `<a kbq-button kbqBreadcrumb color="theme">`
- **THEN** the button has `kbq-theme` and not `kbq-contrast`

#### Scenario: No color bound

- **WHEN** a custom template renders `<a kbq-button kbqBreadcrumb>` without `color` or `kbqStyle`
- **THEN** the button has the transparent style and the contrast color

### Requirement: Breadcrumb buttons never submit a form

On a `<button>` host `kbqBreadcrumb` SHALL set `type="button"`, overriding a static `type` such as `submit`, so that neither a click nor Enter in a field of a surrounding form submits it. On an `<a>` host it MUST NOT set a `type`.

#### Scenario: Static submit type

- **WHEN** a custom template renders `<button kbq-button kbqBreadcrumb type="submit">` inside a `<form>` and the user clicks it
- **THEN** the button's `type` is `button` and the form is not submitted

#### Scenario: Enter in a form field

- **WHEN** a trail with an expand button sits in a form with two text fields and the user presses Enter in the first field
- **THEN** the form is not submitted, no dropdown opens and the URL does not change

#### Scenario: Anchor host

- **WHEN** a trail renders default entries
- **THEN** none of the `<a class="kbq-breadcrumb-item">` elements has a `type` attribute

### Requirement: Focusable input of a breadcrumb button

The `focusable` input of `kbqBreadcrumb`, `true` by default, SHALL decide whether the entry takes part in the trail's keyboard navigation. Turning it off SHALL remove the entry from arrow-key navigation, and turning it back on SHALL restore it in document order.

#### Scenario: Toggling the first item

- **WHEN** the first of two custom entries sets `focusable` to `false` and then back to `true`
- **THEN** the arrow keys skip it while it is off
- **AND** afterwards it is again the first entry the arrow keys reach

### Requirement: Collapsing by width

With `wrapMode` `auto` and at least two items, entries that do not fit the trail's width SHALL be collapsed behind an expand button: first the middle items, starting with the one after the first item, then the first item. The last item MUST NOT collapse. The list item of a collapsed entry SHALL stay in the DOM, invisible and with `aria-hidden="true"`.

#### Scenario: Narrow container

- **WHEN** a trail of five items with `max` set to `null` is 300 px wide and the items do not fit
- **THEN** the expand button is visible and the leading middle items are collapsed
- **AND** the last item stays visible

### Requirement: Maximum number of visible items

In `auto` mode, `max` SHALL cap the trail at `max - 1` visible entries plus the expand button, collapsing extra entries in the same order as collapsing by width. It SHALL default to the configured value, `4` unless configured otherwise. Width collapsing SHALL still apply on top of the cap.

#### Scenario: Five items with max 4

- **WHEN** a trail of five items has `max` set to 4 and enough width
- **THEN** three entries and the expand button are visible
- **AND** the second and third items are collapsed

#### Scenario: Six items with max 4

- **WHEN** a trail of six items has `max` set to 4
- **THEN** three items are collapsed

### Requirement: Max without a cap

A `max` of `null`, a `max` equal to or greater than the number of items, and a `max` below 2 SHALL apply no cap. Changing `max` at runtime SHALL re-apply the cap: raising or removing it restores collapsed entries, lowering it collapses more.

#### Scenario: Removing the cap

- **WHEN** six items are capped by `max` 4 and `max` changes to `null`
- **THEN** no item is collapsed and the expand button is hidden

#### Scenario: Raising the cap

- **WHEN** six items are capped by `max` 4 and `max` changes to 5
- **THEN** two items are collapsed

#### Scenario: Cap at or above the item count

- **WHEN** six items are capped by `max` 4 and `max` changes to 6
- **THEN** no item is collapsed and the expand button is hidden

### Requirement: Expand button visibility

The expand button (class `kbq-breadcrumb__expand`), placed after the first entry, SHALL be shown only while at least one entry is collapsed. When every entry fits again, it SHALL be hidden and a dropdown it opened SHALL close.

#### Scenario: Container grows while the dropdown is open

- **WHEN** the dropdown of the expand button is open and the trail's container is widened until every item fits
- **THEN** the dropdown panel closes and the expand button is hidden

### Requirement: Expand dropdown lists the collapsed items

Activating the expand button SHALL open a dropdown with one `kbq-dropdown-item` link per collapsed item, in trail order. Each row SHALL lead to the item's `routerLink`, show the item's `kbqBreadcrumbView` template when it has one and its `text` otherwise, be disabled when the trail or the item is disabled, and have `aria-current="page"` when the item has `current` set.

#### Scenario: Rows of the collapsed items

- **WHEN** five items "Item #0" to "Item #4" are capped by `max` 4 and the user clicks the expand button
- **THEN** the dropdown shows two rows, "Item #1" and "Item #2"

#### Scenario: Collapsed item with a template

- **WHEN** a collapsed item has a `*kbqBreadcrumbView` template and the user opens the dropdown
- **THEN** its row renders that template instead of an empty row

### Requirement: Dropdown copies stay out of the trail's navigation

A `kbqBreadcrumb` element rendered inside the expand dropdown, as a copy of a collapsed item's template, MUST NOT join the trail's arrow-key navigation.

#### Scenario: Opening the dropdown

- **WHEN** collapsed items with `kbqBreadcrumb` templates are rendered in the open dropdown
- **THEN** the set of entries the trail's arrow keys reach is unchanged and contains only elements inside the trail

### Requirement: Disabled trail

With `disabled` set, the trail SHALL put `kbq-disabled` on its host, render every default entry with `aria-disabled="true"`, disable the expand button natively, and take all of them out of keyboard navigation and of the tab order. Custom `kbqBreadcrumbView` entries are not affected.

#### Scenario: Disabled trail of default items

- **WHEN** a trail of three default items has `disabled` set
- **THEN** the host has `kbq-disabled` and every entry has `aria-disabled="true"`
- **AND** the expand button is disabled and no entry can be reached with the keyboard

### Requirement: First item offset

The host SHALL have the `kbq-breadcrumbs_first-item-negative-margin` class while `firstItemNegativeMargin` is `true`, which shifts the trail to the left by `--kbq-breadcrumb-item-negative-margin` in every wrap mode. It SHALL default to the configured value, `true` unless configured otherwise.

#### Scenario: Default offset

- **WHEN** a trail is rendered without `firstItemNegativeMargin`
- **THEN** the host has `kbq-breadcrumbs_first-item-negative-margin`

#### Scenario: Offset turned off

- **WHEN** `firstItemNegativeMargin` is `false`
- **THEN** the host does not have that class

### Requirement: Tooltip for a clipped item

A default entry whose text is clipped by the consumer's styles SHALL show its full text in a tooltip below it, without an arrow, on hover or keyboard focus. An entry whose text fits SHALL show no tooltip.

#### Scenario: Truncated name

- **WHEN** consumer CSS limits the width of the entries and the user hovers an entry whose text is cut off
- **THEN** a tooltip with the full text appears below the entry

### Requirement: Wrap mode

With `wrapMode` `wrap`, the trail SHALL render every item, with no expand button and no collapsing, ignore `max`, put the `kbq-breadcrumbs_wrap` class on the host and move entries that do not fit onto the next line.

#### Scenario: Narrow wrapping trail

- **WHEN** a trail of five items with `wrapMode="wrap"` and `max` 4 is narrower than its items
- **THEN** all five entries are visible across several lines and there is no expand button

### Requirement: No-wrap mode

With `wrapMode` `none`, the trail SHALL render every item on one line, with no expand button, no collapsing and no wrapping, and SHALL ignore `max`. Entries that do not fit overflow the trail.

#### Scenario: Narrow trail without wrapping

- **WHEN** a trail of five items with `wrapMode="none"` and `max` 4 is narrower than its items
- **THEN** all five entries stay on one line and there is no expand button

### Requirement: Short trails

A trail of fewer than two items SHALL render its items without an expand button, whatever `wrapMode` and `max` say.

#### Scenario: Single item

- **WHEN** a trail has one item
- **THEN** it renders one entry and no expand button

### Requirement: Navigation landmark

The trail SHALL be a navigation landmark: on any host other than `<nav>` it SHALL set `role="navigation"`, and on a `<nav>` host it MUST NOT set a `role`.

#### Scenario: Element form

- **WHEN** the trail is rendered as `<kbq-breadcrumbs>`
- **THEN** the host has `role="navigation"`

#### Scenario: Attribute form on nav

- **WHEN** the trail is rendered as `<nav kbq-breadcrumbs>`
- **THEN** the host has no `role` attribute

### Requirement: Accessible name of the landmark

The host SHALL have an `aria-label`: the value of the `aria-label` input when one is given, otherwise the active locale's `a11y.breadcrumbs` string.

#### Scenario: Name from the locale

- **WHEN** the trail has no `aria-label` and the locale is the default `ru-RU`
- **THEN** the host has `aria-label="Хлебные крошки"`

#### Scenario: Consumer-authored name

- **WHEN** the trail is `<nav kbq-breadcrumbs aria-label="Main trail">`
- **THEN** the host keeps `aria-label="Main trail"`

### Requirement: List semantics

The trail SHALL expose its entries as a list: one element with `role="list"` whose direct children are the `role="listitem"` containers of the entries and, in `auto` mode, of the expand button.

#### Scenario: Items as a list

- **WHEN** a trail renders three items
- **THEN** it contains an element with `role="list"`
- **AND** every element with `role="listitem"` is a direct child of it

### Requirement: Current page

The default entry of the last item SHALL have `aria-current="page"` and SHALL be disabled (`aria-disabled="true"`, `kbq-disabled`): it does not navigate and the keyboard does not reach it. The default entry of any other item with `current` set SHALL also have `aria-current="page"` and stay enabled.

#### Scenario: Trail ending at the current page

- **WHEN** a trail of three default items is rendered
- **THEN** only the last entry has `aria-current="page"`, and it is disabled

#### Scenario: Current item before the end

- **WHEN** the second of three items has `current` set
- **THEN** the second and the third entries have `aria-current="page"`

### Requirement: Accessible name of the expand button

The expand button SHALL have an `aria-label` taken from the active locale's `a11y.expandBreadcrumbs` string.

#### Scenario: Default locale

- **WHEN** the trail renders its expand button with the default `ru-RU` locale
- **THEN** the button has `aria-label="Показать скрытые элементы"`

### Requirement: Single tab stop

The host SHALL have `tabindex="0"` while a `kbqBreadcrumb` element takes part in keyboard navigation and `tabindex="-1"` otherwise; the expand button of an enabled `auto` trail of two or more items takes part even while hidden. When the host receives focus, focus SHALL move to the participant that last had focus, else to the first one that can take focus. Participants SHALL have `tabindex="-1"` except the one that last had focus and those enabled again after the first render.

#### Scenario: Tabbing into the trail

- **WHEN** no entry has had focus yet and the user moves focus onto the trail with Tab or Shift+Tab
- **THEN** the first entry gets focus

#### Scenario: Trail without reachable entries

- **WHEN** the trail has a single default item, or the trail is disabled and no item has a custom `kbqBreadcrumb` template
- **THEN** the host has `tabindex="-1"`

#### Scenario: Hidden expand button

- **WHEN** an enabled `auto` trail has two default items, the first of them disabled, and nothing is collapsed
- **THEN** the host has `tabindex="0"`, because the hidden expand button still takes part in keyboard navigation

#### Scenario: Trail enabled after the first render

- **WHEN** a trail of default items rendered with `disabled` set has it turned off
- **THEN** each enabled default entry has `tabindex="0"` and the expand button has no `tabindex`
- **AND** each visible one of them stays a tab stop until it has had focus and focus has moved on to another entry

### Requirement: Shift+Tab leaves the trail

Shift+Tab on an entry SHALL set the host's `tabindex` to `-1` at once, before any render, so that focus leaves the trail instead of landing on the host, and SHALL restore `tabindex="0"` as soon as focus has left.

#### Scenario: Backwards out of the trail

- **WHEN** an entry has focus and the user presses Shift+Tab
- **THEN** focus moves to the element before the trail
- **AND** the host has `tabindex="0"` again afterwards

#### Scenario: Prevented Shift+Tab

- **WHEN** the page prevents the Shift+Tab and focus stays on the entry
- **THEN** the host keeps `tabindex="-1"` across renders until focus leaves the entry

### Requirement: Arrow keys move between entries

Left and Right arrows on an enabled `kbqBreadcrumb` element SHALL move focus to the previous or next element that takes part in keyboard navigation and can take focus, the visible expand button included, and SHALL prevent the key's default action. Disabled default entries, the last default entry, collapsed entries and elements with `focusable` set to `false` are skipped. A Left or Right arrow pressed with Ctrl, Alt, Meta or Shift MUST be ignored.

#### Scenario: Next entry

- **WHEN** the first entry has focus and the user presses ArrowRight
- **THEN** focus moves to the next entry that can take focus
- **AND** the key's default action is prevented

#### Scenario: With a modifier

- **WHEN** an entry has focus and the user presses Shift+ArrowRight
- **THEN** focus does not move

#### Scenario: Disabled custom entry

- **WHEN** the second of three custom entries, none of them collapsed, is `<a kbq-button kbqBreadcrumb disabled>` without `[focusable]="false"`, the first entry has focus and the user presses ArrowRight
- **THEN** focus moves to the disabled entry
- **AND** ArrowLeft or ArrowRight pressed on it does not move focus

### Requirement: Home and End

Home SHALL move focus to the first element that takes part in keyboard navigation and can take focus and End to the last one, and both SHALL prevent the key's default action. The last item's default entry takes no part, so End SHALL land on the last participating entry before it that can take focus, which is not the entry right before it when that one is disabled.

#### Scenario: End on a default trail

- **WHEN** a trail of three default items has focus on the first entry and the user presses End
- **THEN** focus moves to the second entry

#### Scenario: Disabled entry before the last

- **WHEN** a trail of four default items with enough width has its third item disabled, the first entry has focus and the user presses End
- **THEN** focus moves to the second entry

### Requirement: Wrapping arrow navigation

The `loop` input, `true` by default, SHALL make the arrow keys wrap from the last entry that can take focus to the first and back. With `loop` set to `false`, the arrow keys SHALL stop at either end.

#### Scenario: Wrapping forward

- **WHEN** `loop` is `true`, the last entry that can take focus has focus and the user presses ArrowRight
- **THEN** focus moves to the first entry

#### Scenario: Stopping at the end

- **WHEN** `loop` is `false`, the last entry that can take focus has focus and the user presses ArrowRight
- **THEN** focus does not move

### Requirement: Reading direction of the arrow keys

The arrow keys SHALL follow the reading direction: the `dir` input when it is set, which is also written to the host's `dir` attribute, and the ambient direction otherwise. In right-to-left, ArrowLeft SHALL move forward and ArrowRight backward. Without the input the host MUST NOT get a `dir` attribute.

#### Scenario: Ambient right-to-left

- **WHEN** the document direction is `rtl` and the second of three entries has focus
- **AND** the user presses ArrowLeft
- **THEN** focus moves to the third entry

#### Scenario: No direction forced

- **WHEN** a trail is rendered without `dir`
- **THEN** the host has no `dir` attribute

### Requirement: Keys left to the page

The trail MUST NOT prevent the default action of PageUp, PageDown, ArrowUp or ArrowDown, so they keep scrolling the page or reach the focused entry's own handlers.

#### Scenario: Paging keys

- **WHEN** an entry has focus and the user presses PageUp or PageDown
- **THEN** the key's default action is not prevented

### Requirement: Pointer focus

A pointer press on a `kbqBreadcrumb` element that takes part in keyboard navigation SHALL make it the element focus returns to. A pointer press on a `kbqBreadcrumb` element that does not, such as a disabled default entry or one with `focusable` set to `false`, MUST NOT move focus onto it. A pointer press on an element of a custom template without `kbqBreadcrumb` SHALL be left to the browser.

#### Scenario: Clicking an entry

- **WHEN** the user presses the pointer on the second entry and focus later re-enters the trail through its host
- **THEN** focus lands on the second entry

#### Scenario: Pressing a non-focusable entry

- **WHEN** the user presses the pointer on a custom entry with `focusable` set to `false`
- **THEN** that entry does not get focus

#### Scenario: Plain custom entry

- **WHEN** a custom template renders `<a href="/docs">` without `kbqBreadcrumb` and the user presses the pointer on it
- **THEN** the trail neither keeps focus from moving onto it nor makes it the entry focus returns to

### Requirement: Application-wide defaults

`KBQ_BREADCRUMBS_CONFIGURATION`, usually provided with `kbqBreadcrumbsConfigurationProvider()`, SHALL supply the defaults of `max`, `size`, `firstItemNegativeMargin` and `wrapMode`. The provider SHALL merge the keys it is given over the built-in defaults (`max` 4, `size` `normal`, `firstItemNegativeMargin` `true`, `wrapMode` `auto`), and an input bound on a trail SHALL win over the configured value.

#### Scenario: Partial configuration

- **WHEN** `kbqBreadcrumbsConfigurationProvider({ max: null })` is provided and a trail binds no inputs
- **THEN** the trail applies no cap, has the `normal` size and the first-item offset, and collapses by width

#### Scenario: Input wins

- **WHEN** the provider sets `size: 'compact'` and a trail binds `size="big"`
- **THEN** that trail has `kbq-breadcrumbs_big`

### Requirement: Localized strings

The strings the trail renders itself — the landmark name (`a11y.breadcrumbs`) and the name of the expand button (`a11y.expandBreadcrumbs`) — SHALL follow the active locale, `ru-RU` by default. `kbqA11yLocaleConfigurationProvider()` SHALL override them for an injector, and `[localeOverrides]` SHALL override them for one trail, while keys left out keep following the locale.

#### Scenario: Provider override

- **WHEN** `kbqA11yLocaleConfigurationProvider({ breadcrumbs: 'Навигация' })` is provided
- **THEN** the host has `aria-label="Навигация"`

#### Scenario: Switching the locale

- **WHEN** the application switches the locale to `en-US`
- **THEN** the landmark is named "Breadcrumbs" and the expand button "Show hidden breadcrumbs"

#### Scenario: Overriding one trail

- **WHEN** a trail binds `[localeOverrides]` with its own `a11y.expandBreadcrumbs`
- **THEN** only that trail's expand button uses the overridden name
