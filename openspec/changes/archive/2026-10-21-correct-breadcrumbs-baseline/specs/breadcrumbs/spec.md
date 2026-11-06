# Spec Delta

## MODIFIED Requirements

### Requirement: Routing through the item

A `routerLink` placed on a `kbq-breadcrumb-item` SHALL become the destination of the item's default entry and of its row in the expand dropdown, as the URL tree it builds from its commands, `queryParams`, `fragment`, `queryParamsHandling`, `preserveFragment` and `relativeTo`. The item's `target`, `state`, `info`, `replaceUrl` and `skipLocationChange` are not carried over. An item without a `routerLink` SHALL render an entry without a destination.

#### Scenario: Link with query parameters

- **WHEN** an item has `routerLink="/main"`, `[queryParams]="{ q: '1' }"` and `fragment="top"`
- **THEN** its entry links to `/main?q=1#top`

#### Scenario: Navigation options on the item

- **WHEN** an item has `routerLink="/main"` and `target="_blank"`
- **THEN** its entry links to `/main` and has no `target` attribute
- **AND** a click on the entry navigates in the current tab

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
