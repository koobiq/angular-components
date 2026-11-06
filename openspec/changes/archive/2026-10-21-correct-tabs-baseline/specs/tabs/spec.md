# tabs Specification Delta

## MODIFIED Requirements

### Requirement: Only the selected tab's content is in the DOM

The group SHALL attach the content of the selected tab and SHALL keep the content of every other tab out of the DOM, except that the content of the tab being left stays attached until its switch animation has ended. The selected tab's content MUST be rendered by the first change detection pass. Content projected straight into a `kbq-tab` is still created with the declaring view, so view queries can reach it while its tab is not selected.

#### Scenario: Switching tabs swaps the content

- **WHEN** the first tab is selected and the application selects the fourth one
- **THEN** once the switch animation has ended, the first tab's content is no longer in the DOM and the fourth tab's content is

#### Scenario: Query into an inactive tab

- **WHEN** an element with a template reference sits in a tab that is not selected
- **THEN** a `viewChild` query of the declaring component still resolves it

#### Scenario: Content during the switch animation

- **WHEN** `animationDuration` is `300ms` and the user selects another tab
- **THEN** the content of the tab being left stays in the DOM until its slide has ended

### Requirement: Pointer selection

Clicking the label of an enabled tab SHALL select that tab and move keyboard focus to its label. While `activeTab` holds a string, a click on a tab without a `tabId` selects the first enabled tab instead, and focus still moves to the clicked label. Clicking the label of a disabled tab MUST NOT change the selection.

#### Scenario: Clicking labels

- **WHEN** the first tab is selected and the user clicks the second and then the third label
- **THEN** the second and then the third tab is selected

#### Scenario: Tab without an id in string mode

- **WHEN** `activeTab` holds "second", the third tab has no `tabId` and the user clicks the third label
- **THEN** the first tab is selected and the third label has focus

### Requirement: Selection change events

After the first render, a change of the selected index SHALL emit `selectedTabChange` with a `KbqTabChangeEvent` that holds the new `index` and its `tab`, then `selectedIndexChange` with the index and `activeTabChange`, asynchronously, whether the user or code made it, except for the new index of a tab kept selected by index as tabs are added or removed. The initial selection MUST NOT emit any of them; a group rendered without tabs counts index 0 as its initial selection.

#### Scenario: Selection set in code

- **WHEN** the application assigns `selectedIndex = 2` on a group whose second tab is selected
- **THEN** `selectedTabChange` fires once with `index` 2

#### Scenario: Two-way binding follows a click

- **WHEN** `[(selectedIndex)]` is bound to 0 and the user clicks the second label
- **THEN** the bound value becomes 1

#### Scenario: Tabs arriving after the first render

- **WHEN** a group bound to `selectedIndex` 2 renders without tabs and three tabs arrive later
- **THEN** the third tab is selected and `selectedTabChange` fires with `index` 2

### Requirement: Value emitted by activeTabChange

`activeTabChange` SHALL emit what `activeTab` holds once the selection has changed: a string or a number as it was set, neither clamped nor checked against the tabs, `null` while it holds nothing, and the selected `KbqTab` while it holds a function that returns one. A user selection keeps a string mode on the clicked tab's `tabId`, or clears it when that tab has none, and switches every other mode to the clicked index.

#### Scenario: Clicking in string mode

- **WHEN** `[(activeTab)]` is bound to "first" and the user clicks the label of the tab whose `tabId` is "last"
- **THEN** the bound value becomes the string "last"

#### Scenario: Clicking in number mode

- **WHEN** `[(activeTab)]` is bound to 1 in a group of three tabs and the user clicks the last label
- **THEN** the bound value becomes the number 2

#### Scenario: Binding reset to nothing

- **WHEN** `[(activeTab)]` is bound to 2 and then to `undefined`
- **THEN** the first enabled tab is selected and the bound value becomes `null`

#### Scenario: Index out of range

- **WHEN** the application assigns `selectedIndex = 5` on a group of three tabs whose first tab is selected
- **THEN** `selectedIndexChange` emits 2 and `activeTabChange` emits 5

### Requirement: Active flag of a tab

Each `kbq-tab` SHALL expose `isActive`, which the group sets after every change of the selected index: `true` for the tab at that index and `false` for the others. A template that reads it SHALL render the new value without an error. A tab that becomes selected without a change of the index, such as the first tab arriving in a group that rendered without tabs or the tab that takes the index of a removed selected tab, keeps `isActive` `false` until the index changes.

#### Scenario: Reading isActive in a template

- **WHEN** a template shows `first.isActive` and `second.isActive` and the application selects the second tab
- **THEN** after the next render only `second.isActive` reads `true`

#### Scenario: Tabs arriving after the first render

- **WHEN** nothing selects a tab of a group that renders without tabs, and two tabs arrive later
- **THEN** the first tab is selected and its `isActive` reads `false`

### Requirement: Selection survives a change of the tab list

While the selection is held by index (`selectedIndex`, a number in `activeTab` or a user selection outside string mode), adding or removing other tabs SHALL keep the selected tab selected at its new position without emitting `selectedTabChange`, and removing the selected last tab SHALL select the new last one. While `activeTab` holds a string, a change of its tab's index is emitted, and removing that tab selects the first one. Tabs that arrive asynchronously SHALL be rendered once they exist.

#### Scenario: Tab inserted before the selection

- **WHEN** the second tab is selected through `selectedIndex` and a tab is inserted at the start
- **THEN** the same tab stays selected, now at index 2
- **AND** `selectedTabChange` does not fire

#### Scenario: Removing the selected last tab

- **WHEN** the last tab is selected through `selectedIndex` and it is removed
- **THEN** the new last tab is selected

#### Scenario: Tab inserted in string mode

- **WHEN** `activeTab` holds "second", that tab is selected at index 1 and a tab is inserted at the start
- **THEN** the tab "second" stays selected, now at index 2
- **AND** `selectedTabChange` fires with `index` 2

### Requirement: Header position

`headerPosition` SHALL accept `above` (the default) and `below`. With `below`, the group host SHALL carry `kbq-tab-group_inverted-header`, and a horizontal group lays the strip out after the content, while a vertical group keeps it before the content. A bound `undefined` SHALL return it to `above`.

#### Scenario: Header below the content

- **WHEN** `headerPosition` is bound to "below" and later to `undefined`
- **THEN** the host carries `kbq-tab-group_inverted-header`, and loses it again

### Requirement: Stretched and aligned labels

The attribute `kbq-stretch-tabs` on a group or a nav bar SHALL add the host class `kbq-tab-group_stretch-labels`. In a group the class makes the labels share the strip's width equally; no style stretches the links of a nav bar. `kbq-align-tabs-center` and `kbq-align-tabs-end` SHALL add `kbq-tab-group_align-labels-center` and `kbq-tab-group_align-labels-end`.

#### Scenario: Stretched group

- **WHEN** a group carries the `kbq-stretch-tabs` attribute
- **THEN** its host has the class `kbq-tab-group_stretch-labels`

#### Scenario: Stretched nav bar

- **WHEN** a nav bar carries the `kbq-stretch-tabs` attribute
- **THEN** its host has the class `kbq-tab-group_stretch-labels` and its links keep the width of their content

### Requirement: Switch animation

`animationDuration` SHALL set how long the new content takes to slide in from the side on which its tab lies relative to the previous one (for a later tab the right, or the left in right-to-left layouts) as the old content slides out. It SHALL default to the `animationDuration` of `KBQ_TABS_CONFIG`, or `0ms` without one, and a bound `undefined` SHALL restore that default. A bare number SHALL be read as milliseconds. With animations disabled, the content MUST NOT move.

#### Scenario: Configured default

- **WHEN** `KBQ_TABS_CONFIG` provides `300ms` and the bound `animationDuration` changes from `500ms` to `undefined`
- **THEN** the group's `animationDuration` is `300ms`

#### Scenario: Selecting a later tab

- **WHEN** `animationDuration` is `300ms`, the first tab is selected and the user clicks the third label in a left-to-right layout
- **THEN** the third tab's content slides in from the right and the first tab's content slides out to the left

### Requirement: Arrow keys move focus

With focus in a horizontal strip, Right and Left SHALL move focus to the next and previous label, and Up and Down SHALL do nothing. In a vertical strip, Down and Up SHALL move it and Left and Right SHALL do nothing. Focus SHALL skip disabled tabs and stop at the ends without wrapping. Moving focus MUST NOT change the selection. They move from a position that follows the selection too, so with a disabled tab selected from code they start from that tab even when Tab focused another label.

#### Scenario: Skipping a disabled tab

- **WHEN** focus is on the first label, the second tab is disabled and the user presses Right
- **THEN** focus moves to the third label and the selection is unchanged

#### Scenario: Left past a disabled tab

- **WHEN** focus is on the third label, the second tab is disabled and the user presses Left
- **THEN** focus moves to the first label

#### Scenario: Disabled tab selected from code

- **WHEN** the third of four tabs is disabled and selected from code, the user tabs onto the first label and presses Right
- **THEN** focus moves to the fourth label

### Requirement: Manual activation

Enter and Space SHALL select the tab at the position the arrow keys move from (see Arrow keys move focus), which is the focused label unless a disabled tab selected from code still holds it. While `activeTab` holds a string, Enter or Space on a tab without a `tabId` selects the first enabled tab instead. The strip SHALL prevent the default action of Home, End, Enter, Space and all four arrow keys. Keys pressed with a modifier key MUST be ignored.

#### Scenario: Selecting the focused tab

- **WHEN** the first tab is selected, the user presses Right to focus the third label and then Enter
- **THEN** the third tab is selected and the Enter key's default action is prevented

#### Scenario: Space

- **WHEN** focus is on the first label of a group whose third tab is selected and the user presses Space
- **THEN** the first tab is selected and the Space key's default action is prevented

### Requirement: Focus moves next to a removed tab

When the label or link that holds keyboard focus is removed, focus SHALL move to the label at the same position, or the new last one, and to the first enabled one when that is disabled. This SHALL also hold in a nav bar, where focus goes to the adjacent link and not to the active one. When focus never entered the strip, or last left it for another element, the removal MUST NOT move focus; focus that left the strip for the document body still counts as in it.

#### Scenario: Removing the focused last tab

- **WHEN** focus is on the last label and that tab is removed
- **THEN** the new last label has focus

#### Scenario: Focus elsewhere

- **WHEN** focus has never been in the strip and a tab is removed
- **THEN** focus stays on the document body

#### Scenario: Focus dropped to the body

- **WHEN** the second label had focus, focus then went to the document body without another element taking it, and a tab is removed
- **THEN** the label now at the second position receives focus

### Requirement: Nav bar without a panel

Without `tabNavPanel`, a nav bar SHALL stay plain navigation: it adds no `role`, `aria-selected` or `aria-controls` and leaves those the author wrote, the active link SHALL carry `aria-current="page"`, and every enabled link SHALL carry its own `tabIndex`, so each is a tab stop. It removes an author's `aria-orientation`, unless an author's `role="tablist"` on a vertical nav bar turns it into `vertical`. Unbinding `tabNavPanel` at runtime leaves the roles and ARIA states the panel mode wrote.

#### Scenario: Plain navigation

- **WHEN** a nav bar has three links, the first active, and no `tabNavPanel`
- **THEN** the links carry no `role` and no `aria-selected`, and `aria-current` reads `page`, absent, absent

#### Scenario: Orientation written by the author

- **WHEN** a horizontal nav bar without `tabNavPanel` is declared with `aria-orientation="horizontal"`
- **THEN** the nav bar carries no `aria-orientation`

### Requirement: Application-driven selection is not persisted

When `selectedIndex` or `activeTab` is bound, even to `undefined`, the group MUST NOT restore or write state. On a group that persists, a selection assigned in code through these properties MUST NOT be written when it is assigned; it is written once adding or removing tabs keeps it selected by index, as a user selection would be.

#### Scenario: Bound selectedIndex

- **WHEN** the store holds `{ tabId: 'last', index: 2 }`, the group binds `[(selectedIndex)]` to 1 and the user clicks the first label
- **THEN** the second tab was selected on init and the store still holds `{ tabId: 'last', index: 2 }`

#### Scenario: Bound but unset activeTab

- **WHEN** the group binds `[(activeTab)]` to a value that is `undefined` and the store names the second tab
- **THEN** the first tab is selected and a click does not change the store

#### Scenario: Selection assigned in code, then a tab added

- **WHEN** a persisting group with nothing bound gets `selectedIndex = 2` in code and a tab is then added at the end
- **THEN** the store holds the `tabId` of the third tab with `index` 2

### Requirement: Group outside the document

A group that is not attached to the document while it initializes, such as one projected into a closed overlay, MUST NOT restore or write state, even with a `stateSavingKey` and after it is attached, and MUST NOT warn while it initializes. Once it is attached, selecting a tab without a `tabId` still logs the dev-mode warning about the missing `tabId`, although nothing is written.

#### Scenario: Detached host

- **WHEN** the store holds a state for the derived key and the group initializes detached from the document
- **THEN** the first tab is selected and no warning is logged

#### Scenario: Attached later

- **WHEN** a group that initialized detached is attached to the document and the user selects a tab
- **THEN** the store is unchanged
