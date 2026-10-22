# app-switcher Specification

## Purpose

Describes what the app switcher from `@koobiq/components/app-switcher` guarantees to consumers: how the `[kbqAppSwitcher]` trigger opens and closes its popup, how sites and applications are listed, grouped, searched and selected, and how users operate the popup with a pointer, the keyboard or assistive technology.

## Requirements

### Requirement: Click on the trigger opens the switcher

Clicking an element that carries `kbqAppSwitcher` SHALL open the popup in a CDK overlay. The overlay pane SHALL carry the class `kbq-app-switcher__panel` and the popup root the class `kbq-app-switcher`.

#### Scenario: Click opens the popup

- **WHEN** the user clicks a closed, enabled trigger
- **THEN** an element with class `kbq-app-switcher` appears inside an overlay pane with class `kbq-app-switcher__panel`

### Requirement: Enter and Space on the trigger open the switcher

With the default triggers (`click` and `keydown`), Enter or Space pressed while the trigger element has focus SHALL open the popup in the next task.

#### Scenario: Keyboard opens the popup

- **WHEN** a closed, enabled trigger has focus and the user presses Enter or Space
- **THEN** the popup opens

### Requirement: Programmatic open and close

The trigger directive, exported as `kbqAppSwitcher`, SHALL open the popup on `show()`, close it on `hide()`, and report through `isOpen` whether the popup is shown.

#### Scenario: Opening from code

- **WHEN** code calls `show()` on a closed, enabled trigger
- **THEN** the popup appears in the overlay
- **AND** `isOpen` is `true` once it is shown

#### Scenario: Closing from code

- **WHEN** the popup is open and is closed from code
- **THEN** the popup is removed from the overlay
- **AND** `isOpen` is `false`

### Requirement: Open state on the trigger element

While the popup is shown, the trigger element SHALL carry the class `kbq-app-switcher_open` and, because the default triggers include `click`, the class `kbq-active`. Both classes MUST be removed when the popup closes.

#### Scenario: Classes follow the open state

- **WHEN** the popup opens
- **THEN** the trigger element has the classes `kbq-app-switcher_open` and `kbq-active`
- **AND** both are removed once the popup closes

### Requirement: Visibility output

The trigger SHALL emit `kbqVisibleChange` with `true` once the popup is shown and with `false` once it is hidden.

#### Scenario: Open and close cycle

- **WHEN** the user opens the popup and then closes it
- **THEN** `kbqVisibleChange` emits `true` and then `false`

### Requirement: Disabled trigger

Setting `disabled` to `true` SHALL close an open popup, and while it is `true` the popup MUST NOT open. Setting it back to `false` MUST NOT open or close anything. The directive does not add a `disabled` or `aria-disabled` attribute to the trigger element.

#### Scenario: Disabling an open switcher

- **WHEN** the popup is open and `disabled` becomes `true`
- **THEN** the popup closes

#### Scenario: A disabled trigger does not open

- **WHEN** `disabled` is `true` and the user clicks the trigger or code calls `show()`
- **THEN** the popup stays closed

### Requirement: Placement

`kbqAppSwitcherPlacement` SHALL set the preferred placement of the popup relative to the trigger, `bottomLeft` by default; binding `undefined` SHALL restore `bottomLeft`. The trigger SHALL emit `kbqPlacementChange` with the placement the overlay resolved to for the first position of every opening, and afterwards only when the applied position, or whether the trigger or the popup is clipped by or out of its scroll containers, changes. Re-applying an unchanged position emits nothing.

#### Scenario: Default placement

- **WHEN** no placement is bound
- **THEN** the trigger's `placement` is `bottomLeft`

#### Scenario: Bound placement reset

- **WHEN** `kbqAppSwitcherPlacement` is bound to `top` and then to `undefined`
- **THEN** the trigger's `placement` returns to `bottomLeft`

#### Scenario: Position re-applied unchanged

- **WHEN** the popup is open and its own list scrolls, so the overlay re-applies the position it already has
- **THEN** `kbqPlacementChange` does not emit

### Requirement: Offset input

`offset` SHALL accept a number or a numeric string and default to 8. Binding `undefined` or `null` SHALL restore 8.

#### Scenario: Offset reset

- **WHEN** `offset` is bound to `4` and then to `undefined` or `null`
- **THEN** the trigger's `offset` is `8`

### Requirement: Backdrop class input

`backdropClass` SHALL default to `cdk-overlay-transparent-backdrop`, and binding `undefined` SHALL restore that value.

#### Scenario: Backdrop class reset

- **WHEN** `backdropClass` is bound to `custom-backdrop` and then to `undefined`
- **THEN** the trigger's `backdropClass` is `cdk-overlay-transparent-backdrop`

### Requirement: Escape closes the switcher

An Escape keydown inside the popup SHALL close it at once, prevent the key's default action and stop its propagation, so that overlays opened earlier stay open. An Escape whose default action a control inside the popup has already prevented MUST NOT close the popup.

#### Scenario: Escape from a row

- **WHEN** a row has focus and the user presses Escape
- **THEN** the popup closes

#### Scenario: Escape inside another overlay

- **WHEN** the switcher was opened from inside another overlay and the user presses Escape in the popup
- **THEN** the event does not propagate past the popup, so the outer overlay stays open

#### Scenario: Escape already spent

- **WHEN** a control inside the popup, such as a tooltip, has already prevented the default action of an Escape keydown
- **THEN** the popup stays open

### Requirement: Tab closes the switcher

Tab or Shift+Tab pressed while focus is on a row, or on any other control of the popup except the search field, SHALL prevent the browser's focus move, close the popup and move focus to the trigger element.

#### Scenario: Tab out of the list

- **WHEN** the last row has focus and the user presses Tab
- **THEN** the popup closes
- **AND** the trigger element has focus

### Requirement: Focus leaving closes the switcher

When focus moves from the popup to an element outside both the popup and its site flyout panels, or is lost with no new target, the popup SHALL close and focus SHALL move to the trigger element. Focus moving between rows of the popup or into a site flyout MUST NOT close it.

#### Scenario: Focus moves elsewhere on the page

- **WHEN** the popup is open and focus moves to an element outside it
- **THEN** the popup closes and the trigger element receives focus

#### Scenario: Focus moves within the popup

- **WHEN** focus moves from one row to another
- **THEN** the popup stays open

#### Scenario: Focus moves into a site flyout

- **WHEN** focus moves from the popup into an open site flyout
- **THEN** the popup stays open

### Requirement: Outside click closes the switcher

A click outside the popup and outside overlays opened after it SHALL close the popup. The switcher SHALL NOT render a backdrop.

#### Scenario: Click elsewhere on the page

- **WHEN** the popup is open and the user clicks outside it
- **THEN** the popup closes

### Requirement: Outer scroll closes the switcher

Scrolling the document, or a scrollable container outside the popup that is registered with the CDK `ScrollDispatcher` (a `cdkScrollable` element or the viewport of a `kbq-scrollbar`), SHALL close it. A container that is not registered does not close it, because none of its scroll events reaches the switcher. Scrolling inside the popup or inside a site flyout, including the scrolling that keyboard navigation causes, MUST NOT close it.

#### Scenario: Scrolling the page

- **WHEN** the popup is open and the document scrolls
- **THEN** the popup closes

#### Scenario: Scrolling the list

- **WHEN** the popup is open and its own list scrolls
- **THEN** the popup stays open

#### Scenario: Scrolling an unregistered container

- **WHEN** the popup is open and an `overflow: auto` element outside it that is not registered with the CDK `ScrollDispatcher` scrolls
- **THEN** the popup stays open

### Requirement: Focus returns to the trigger on close

Whenever the popup closes, whatever closed it, focus SHALL move to the trigger element.

#### Scenario: Closing with Escape

- **WHEN** the user closes the popup with Escape
- **THEN** the trigger element has focus

### Requirement: Sites input

`sites` SHALL take the list of sites, each with an `id`, a `name`, an optional `status` and its `apps`. Binding `undefined` SHALL clear the list, and opening with no sites SHALL show an empty popup without an error. Reading `sites` back SHALL return the sites with their applications grouped, not the bound array.

#### Scenario: No sites

- **WHEN** the trigger has no sites and the user opens it
- **THEN** the popup opens with no rows and no search field

#### Scenario: Sites reset

- **WHEN** `sites` is bound to a list and then to `undefined`
- **THEN** the trigger's `sites` is an empty list

#### Scenario: Reading the sites back

- **WHEN** `sites` is bound to two sites and code reads `sites` from the trigger
- **THEN** it gets both sites in the bound order, each with its applications grouped by type

### Requirement: Single-site layout

With exactly one site, the popup SHALL list that site's applications whatever `selectedSite` holds, with no site heading and no other-sites section.

#### Scenario: One site

- **WHEN** `sites` holds one site and the user opens the popup
- **THEN** the popup lists the names of that site's applications
- **AND** there is no other-sites section

### Requirement: Application rows

Each application SHALL render as a row showing its `name` and, when set, its `caption`; its `type` is not shown. An application row SHALL be an anchor with `rel="noopener noreferrer"`, whose `href` is the application's `link`, or which has no `href` when there is no `link`.

#### Scenario: Name and caption

- **WHEN** an application has a `name` and a `caption`
- **THEN** its row shows both
- **AND** a row of an application without a `caption` has no caption element

#### Scenario: Link

- **WHEN** an application has a `link`
- **THEN** its row is an anchor with that `href` and `rel="noopener noreferrer"`

#### Scenario: No link

- **WHEN** an application has no `link`
- **THEN** its row is an anchor without an `href` attribute

### Requirement: Application icons

A row SHALL show the application's inline `icon` when its sanitized markup is not empty, otherwise an image loaded from `iconSrc`, 24 by 24 pixels with an empty `alt`, otherwise no icon. The icon wrapper SHALL carry `aria-hidden="true"`.

#### Scenario: Inline icon

- **WHEN** an application has an inline SVG `icon`
- **THEN** its row renders the SVG markup inside an icon wrapper with `aria-hidden="true"`

#### Scenario: Icon from a URL

- **WHEN** an application has only `iconSrc`
- **THEN** its row renders an image with that source and `alt=""`

#### Scenario: Nothing left of the inline icon

- **WHEN** an application's `icon` holds only markup that sanitization removes, and it also has `iconSrc`
- **THEN** its row renders the image from `iconSrc`

#### Scenario: No icon

- **WHEN** an application has neither `icon` nor `iconSrc`
- **THEN** its row has no icon element

### Requirement: Inline icon sanitization

Inline `icon` markup SHALL be filtered against an SVG allow-list of local names, in any namespace, before it is rendered. Scripts, `style`, `foreignObject` and `a` elements, HTML elements such as `img`, comments, `on*` attributes, `href` and `xlink:href` values other than `#` references, and `style` values containing `url(`, `expression(` or `javascript:` MUST be removed. Allowed SVG elements, gradients and `#` references SHALL be kept, as is an HTML element named like one, such as `title`.

#### Scenario: Typical icon

- **WHEN** the icon is an SVG with a `viewBox`, paths and fill attributes
- **THEN** the rendered markup keeps them

#### Scenario: Event handlers and scripts

- **WHEN** the icon contains an `onload` or `onclick` attribute or a `script` element
- **THEN** the rendered markup contains neither, and no script runs

#### Scenario: External references

- **WHEN** a `use` element references `//evil/x.svg#icon` or `javascript:` through `href` or `xlink:href`
- **THEN** the reference attribute is removed
- **AND** `href="#g"` pointing at a gradient in the same icon is kept

#### Scenario: Inline styles

- **WHEN** a `style` attribute contains `url(`
- **THEN** it is removed
- **AND** `style="fill:red"` is kept

#### Scenario: HTML element with an allowed name

- **WHEN** the icon is `<title>Logo</title>`, outside any `svg` element
- **THEN** the rendered markup keeps that HTML `title` element

### Requirement: Icon sanitizer service

`KbqAppSwitcherIconSanitizer.sanitize()` SHALL return `null` for empty input, for markup with nothing left after filtering and for markup whose filtered form changes when filtered again; otherwise it SHALL return the filtered markup marked as trusted HTML. Sanitizing its own output SHALL return the same markup.

#### Scenario: Empty input

- **WHEN** `sanitize()` is called with `''`, `null` or `undefined`
- **THEN** it returns `null`

#### Scenario: Only HTML elements

- **WHEN** `sanitize()` is called with `<img src="x" onerror="alert(1)">` or an `iframe`
- **THEN** it returns `null`

#### Scenario: Stable output

- **WHEN** the result of `sanitize()` is sanitized again
- **THEN** the markup is unchanged

### Requirement: Selected application marking

In the current site's list, every row whose application `id` equals the `id` of `selectedApp` SHALL carry `aria-current="true"` and the class `kbq-selected`, and the other rows SHALL carry neither. Rows in search results and in site flyout panels are never marked.

#### Scenario: Selected application in the list

- **WHEN** `selectedApp` is one of the current site's applications and the popup opens
- **THEN** exactly one row has `aria-current="true"`, and that row has the class `kbq-selected`

### Requirement: Picking from the current list does not change the selection

Activating an application row of the current site's list or of the search results SHALL follow the row's link like any anchor, and MUST NOT change `selectedApp` or `selectedSite` or emit `selectedAppChange` or `selectedSiteChange`.

#### Scenario: Clicking an application of the current site

- **WHEN** the user clicks an application row in the current site's list
- **THEN** `selectedApp` and `selectedSite` keep their values
- **AND** the browser follows the row's `href`, if it has one

### Requirement: Grouping by type

By default the applications of each site SHALL be grouped by the string form of `type`, so `1` and `'1'` count as one type: when more than `KBQ_MIN_NUMBER_OF_APPS_TO_ENABLE_GROUPING` (3) of them share a type, they SHALL render as one group row named after the type, with the icon of the first of them, followed by their rows. Types with three or fewer applications, and applications whose `type` is missing or falsy, SHALL render as plain rows.

#### Scenario: Four applications of one type

- **WHEN** a site has four applications of type `Group` and one without a type
- **THEN** the list shows a group row named `Group`, its four application rows and the untyped application

#### Scenario: Three applications of one type

- **WHEN** a site has exactly three applications of one type
- **THEN** they render as three plain rows and there is no group row

#### Scenario: Number and string of one type

- **WHEN** a site has two applications of type `1` and two of type `'1'`
- **THEN** the list shows one group row named `1`, followed by the four application rows

### Requirement: Row order

With the default grouping, group rows SHALL come first: types whose string form is a non-negative integer without leading zeros, such as `1` or `'20'`, in ascending numeric order, then the other types in the order in which they first appear. Applications without a type SHALL follow in their original order, and the applications of types too small to group SHALL come last, type by type in the same order.

#### Scenario: Small group moves after the untyped applications

- **WHEN** a site lists two applications of type `TypeA` followed by one without a type
- **THEN** the list shows the untyped application first and then the two `TypeA` applications

#### Scenario: Groups before plain rows

- **WHEN** a site lists four applications of one type and an untyped one
- **THEN** the group row comes before the untyped application

#### Scenario: Numeric types

- **WHEN** a site lists four applications of type `2` followed by four of type `1`
- **THEN** the group row `1` comes before the group row `2`

### Requirement: Group rows expand and collapse

Group rows SHALL start expanded. Clicking a group row SHALL collapse it, removing its application rows from the list, and clicking it again SHALL expand it. The click MUST NOT propagate or perform a default action.

#### Scenario: Collapse and expand by click

- **WHEN** the user clicks an expanded group row
- **THEN** its application rows disappear and its `aria-expanded` becomes `false`
- **AND** a second click brings them back and sets `aria-expanded` to `true`

### Requirement: Custom grouping function

`groupBy` SHALL replace the grouping function. It is called once per application with the application, the record of groups and the list of untyped applications. The grouping threshold SHALL still apply to its groups, a group it emits with no applications or with an empty `aliases` array SHALL render as a plain row, and binding `undefined` SHALL restore the default grouping.

#### Scenario: Grouping turned off

- **WHEN** `groupBy` pushes every application into the untyped list
- **THEN** every application renders as a plain row

#### Scenario: Group without applications

- **WHEN** `groupBy` emits a group whose `aliases` is missing or empty
- **THEN** that group renders as a plain row without a toggle

#### Scenario: Default restored

- **WHEN** `groupBy` is bound to a custom function and then to `undefined`
- **THEN** the trigger's `groupBy` is the default function and the applications are grouped by type again

### Requirement: Grouping helper

The exported `makeGroupsForApps(apps, minAppsForGrouping, groupBy?)` SHALL return the rows in the order the popup renders them: groups holding more than `minAppsForGrouping` applications first, then every other application as a plain row. Without `groupBy` it SHALL group by `type`.

#### Scenario: Threshold of the helper

- **WHEN** `makeGroupsForApps` is called with four applications of one type and a threshold of 3
- **THEN** it returns one group named after the type with the four applications as its `aliases`

### Requirement: Multi-site layout

With more than one site, the popup SHALL show a heading with the selected site's `name` and, when set, its `status` as a badge, then that site's applications, then a localized other-sites heading and one row per other site with its `name` and its `status` badge. The site whose `id` equals that of `selectedSite` MUST NOT appear among the other sites.

#### Scenario: Two sites

- **WHEN** `sites` holds sites A and B, `selectedSite` is A, and the user opens the popup
- **THEN** the heading shows the name of A, followed by the applications of A
- **AND** the other-sites section has one row, for B

#### Scenario: Site status

- **WHEN** an other-site row's site has a `status`
- **THEN** the row shows the status as a badge
- **AND** a site without a `status` shows no badge

### Requirement: Selected site resolution

In multi-site mode the current list SHALL come from the site in `sites` whose `id` equals that of `selectedSite`, grouped by type. When no site is selected the list SHALL be empty. When the selected site's `id` matches no site, its own `apps` SHALL be listed as given, without grouping.

#### Scenario: No site selected

- **WHEN** there are several sites and `selectedSite` is `undefined`
- **THEN** the current list is empty

#### Scenario: Selected site from another source

- **WHEN** `selectedSite` is an equal copy of one of the sites
- **THEN** the popup lists the grouped applications of that site

#### Scenario: Unknown site

- **WHEN** `selectedSite` has an `id` that none of the sites has
- **THEN** its own applications are listed, without an error

### Requirement: Site flyout panels open

An other-site row SHALL open a flyout listing that site's applications, grouped the same way, when the pointer rests on it, when it is clicked, or when it has focus and the user presses Enter, Space or Right (Left in right-to-left layouts). A group row in a flyout SHALL open a nested flyout with the group's applications. Opening a flyout MUST NOT close the switcher.

#### Scenario: Hover opens a flyout

- **WHEN** the pointer rests on the row of a site whose applications form the groups `Group` and `Other`
- **THEN** a flyout opens with the rows `Group` and `Other`

#### Scenario: Keyboard opens a flyout

- **WHEN** an other-site row has focus and the user presses Enter or Right
- **THEN** the flyout opens, the row's `aria-expanded` becomes `true`, and the switcher stays open

#### Scenario: Nested flyout of a group

- **WHEN** the pointer rests on a group row inside a flyout
- **THEN** a second flyout opens with the applications of that group

### Requirement: Flyout follows the row that opened it

A flyout SHALL list the applications of the row that opened it. When the pointer leaves a row whose flyout is open for another site or group row, the flyout SHALL switch to that row at once if the pointer is outside the triangle between the point where it left and the near edge of the open flyout, and otherwise once it has rested on that row for `NESTED_HOVER_SWITCH_DELAY` (50 ms). A row the pointer only crosses inside that triangle within that delay MUST NOT replace the flyout.

#### Scenario: Moving to another site row

- **WHEN** the flyout of site C is open and the pointer moves straight to the row of site B and stays there
- **THEN** after 50 ms the flyout lists the applications of site B

#### Scenario: Crossing a row on the way

- **WHEN** the flyout of site B is open and the pointer, on its way to that flyout inside the triangle, crosses the row of site C for less than 50 ms
- **THEN** the flyout still lists the applications of site B

#### Scenario: Reopening after a close

- **WHEN** the flyout of site B was closed and the flyout of site C is opened from the keyboard
- **THEN** it lists only the applications of site C

#### Scenario: Leaving the triangle

- **WHEN** the flyout of site C is open and the pointer reaches the row of site B outside the triangle towards that flyout
- **THEN** the flyout switches to site B without waiting for `NESTED_HOVER_SWITCH_DELAY`

### Requirement: Picking an application in a flyout

Clicking an application in a flyout, including one in a group's nested flyout, SHALL set `selectedSite` to the flyout's site and `selectedApp` to the application, emit `selectedSiteChange` and `selectedAppChange`, and follow the application's link.

#### Scenario: Application of another site

- **WHEN** the user opens the flyout of site B and clicks its first application
- **THEN** `selectedSite` is site B and `selectedApp` is that application
- **AND** `selectedSiteChange` and `selectedAppChange` emit them

### Requirement: Closing a site flyout

Escape pressed in a flyout SHALL close that flyout and leave the switcher open. Left (Right in right-to-left layouts) pressed in a flyout SHALL close it too. Moving the pointer onto the current site's list or the search field SHALL close an open site flyout.

#### Scenario: Escape in a flyout

- **WHEN** a site flyout is open and the user presses Escape in it
- **THEN** the flyout closes
- **AND** the switcher stays open, so another site's flyout can be opened

#### Scenario: Pointer back over the list

- **WHEN** a site flyout is open and the pointer moves onto the current site's list
- **THEN** the flyout closes

### Requirement: Search field appears with more than seven applications

The popup SHALL show a search field above the list when the applications of all sites together number more than `KBQ_MIN_NUMBER_OF_APPS_TO_ENABLE_SEARCH` (7), and none otherwise. The trigger's `withSearch` SHALL report whether the field is shown.

#### Scenario: Eight applications

- **WHEN** the sites hold eight applications in total
- **THEN** the popup shows a search field and `withSearch` is `true`

#### Scenario: Seven or fewer

- **WHEN** the sites hold seven or fewer applications in total
- **THEN** there is no search field and `withSearch` is `false`

### Requirement: Search matching

A non-empty query SHALL replace the list with the applications whose `name` or `caption` contains the query, ignoring case. Sites without a matching application SHALL be left out, and emptying the query SHALL restore the full list. The bound sites MUST NOT be modified.

#### Scenario: Match by name

- **WHEN** the user types `app one`
- **THEN** the results contain `App One` and no application whose name or caption lacks that text

#### Scenario: Match by caption

- **WHEN** the user types `sentinel` and an application's caption is `Sentinel deployment`
- **THEN** that application is in the results

#### Scenario: Site without matches

- **WHEN** no application of site B matches the query
- **THEN** site B is not part of the results

### Requirement: Search results layout

Search results SHALL list the matching applications as plain rows in their original order, without groups or site flyout panels. In multi-site mode each site's results SHALL be preceded by a label with the site's name.

#### Scenario: Results from several sites

- **WHEN** there are several sites and a query matches applications of two of them
- **THEN** each site's matching applications follow a label with that site's name

#### Scenario: Grouped applications in the results

- **WHEN** a query matches applications that form a group in the full list
- **THEN** they appear in the results as plain rows, without a group row

### Requirement: Match highlighting

In the search results, the part of each application name that matches the query SHALL be wrapped in a `mark` element with the class `kbq-highlight-background`. Nothing SHALL be highlighted while the query is empty.

#### Scenario: Highlighted fragment

- **WHEN** the user types `pp 1` and `App 1` is the only match
- **THEN** exactly one `mark` is rendered, holding `pp 1`, inside the name `App 1`

### Requirement: Empty search result announcement

While the search field holds a query, the popup SHALL keep a `role="status"` live region mounted below the results. It SHALL be empty, taking no space, while there are results, and SHALL show the localized empty-result message once nothing matches.

#### Scenario: Query stops matching

- **WHEN** a query that matches is changed to one that matches nothing
- **THEN** the same `role="status"` element, empty before, now shows the empty-result message
- **AND** no application rows are shown

### Requirement: Clearing the search

Once the search field holds a query, a clear button SHALL appear next to it, and activating it SHALL empty the query and restore the full list. Escape pressed in the search field while it holds a query SHALL clear the query instead of closing the switcher.

#### Scenario: Clear button

- **WHEN** the user has typed a query and activates the clear button
- **THEN** the query is empty and the list shows as many rows as before the search

#### Scenario: Escape with a query

- **WHEN** the search field has focus and holds a query, and the user presses Escape
- **THEN** the query is cleared and the switcher stays open

### Requirement: Query resets on reopen

Every opening SHALL start with an empty query and the full list; a query typed before the popup closed MUST NOT persist.

#### Scenario: Reopening after a search

- **WHEN** the user types a query, closes the switcher and opens it again
- **THEN** the search field is empty and the full list is shown

### Requirement: Initial focus

On opening, focus SHALL move to the search field when one is shown, and otherwise to the first row of the list.

#### Scenario: Without a search field

- **WHEN** the popup opens without a search field
- **THEN** the first row is the active row and holds focus

#### Scenario: With a search field

- **WHEN** the popup opens with a search field
- **THEN** the search field holds focus and no row is active

### Requirement: Arrow, Home and End navigation

Up and Down SHALL move focus to the previous or next row without wrapping, and Home and End to the first and last row. The navigable rows are those of the current list or of the search results, followed by the other-site rows; rows inside flyout panels are navigated within their flyout.

#### Scenario: Next and previous

- **WHEN** the first row has focus and the user presses Down and then Up
- **THEN** focus moves to the second row and back to the first

#### Scenario: From the list to the other sites

- **WHEN** the last application row of the current site has focus and the user presses Down
- **THEN** the first other-site row receives focus

#### Scenario: No wrapping

- **WHEN** the last row has focus and the user presses Down, or the first row has focus and the user presses Up in a popup without search
- **THEN** focus stays where it is

#### Scenario: Home and End

- **WHEN** the user presses End and then Home
- **THEN** focus moves to the last row and then to the first

### Requirement: Type-ahead

While a row has focus, typing characters SHALL move focus to the next row whose text starts with them. While such a sequence is in progress, Space SHALL count as a character and MUST NOT activate the focused row.

#### Scenario: Space during type-ahead

- **WHEN** the user is typing a type-ahead sequence and presses Space
- **THEN** the focused row is not activated

### Requirement: Enter and Space activate rows

Enter or Space pressed on a focused application row SHALL click the row, so that it follows its link, and prevent the key's default action. On a group row they SHALL toggle the group instead. Other-site rows open their flyout on these keys, as stated under site flyout panels.

#### Scenario: Enter on an application row

- **WHEN** an application row has focus and the user presses Enter
- **THEN** the row is clicked and the key's default action is prevented

#### Scenario: Space on an application row

- **WHEN** an application row has focus and the user presses Space
- **THEN** the row is clicked

#### Scenario: Enter on a group row

- **WHEN** an expanded group row has focus and the user presses Enter
- **THEN** the group collapses

### Requirement: Left and Right on groups

On a group row, Right SHALL expand a collapsed group and Left SHALL collapse an expanded one. On an application row inside an expanded group, Left SHALL move focus to the group row. In right-to-left layouts the two keys SHALL swap roles.

#### Scenario: Collapse and expand

- **WHEN** an expanded group row has focus and the user presses Left, then Right
- **THEN** the group collapses and then expands again

#### Scenario: From an application back to its group

- **WHEN** the second application row of an expanded group has focus and the user presses Left
- **THEN** focus moves to the group row

#### Scenario: Right-to-left

- **WHEN** the layout is right-to-left and an expanded group row has focus
- **THEN** Right collapses the group and Left expands it

### Requirement: Search field and list handoff

In the search field, Down SHALL move focus to the first row and prevent the key's default action, and every other key except Escape SHALL be left to the field. Up on the first row SHALL move focus back to the search field and leave no row active.

#### Scenario: Into the list

- **WHEN** the search field has focus and the user presses Down
- **THEN** the first row becomes active and receives focus

#### Scenario: Back to the search field

- **WHEN** the first row has focus in a popup with a search field and the user presses Up
- **THEN** the search field receives focus and no row is active

#### Scenario: Other keys stay in the field

- **WHEN** the search field has focus and the user presses Left
- **THEN** the search field keeps focus and no row becomes active

### Requirement: Active row follows focus

When a row receives focus other than through the arrow keys, for example by a click or when its flyout closes, keyboard navigation SHALL continue from that row. When focus moves to a control in the popup that is not a row, such as the clear button, no row SHALL stay active, so Enter or Space pressed there MUST NOT activate a row.

#### Scenario: Focus moved to a row

- **WHEN** the first row is active and the second row receives focus
- **THEN** the second row is the active row

#### Scenario: Focus moved to the clear button

- **WHEN** a row is active and focus moves to the clear button, and the user presses Space there
- **THEN** no row is active and no row is clicked

### Requirement: Keyboard focus indication

A row that receives focus from keyboard navigation SHALL carry the class `cdk-keyboard-focused`.

#### Scenario: Focus ring class

- **WHEN** the user presses Down in the list
- **THEN** the newly focused row has the class `cdk-keyboard-focused`

### Requirement: Pointer hover focuses a row

When the pointer enters a row, the row SHALL receive focus, and keyboard navigation SHALL continue from it.

#### Scenario: Hover then arrow key

- **WHEN** the pointer enters the third row and the user then presses Down
- **THEN** focus moves to the fourth row

### Requirement: Menu semantics

The rows of the list SHALL be inside an element with `role="menu"` and `aria-orientation="vertical"`, with every wrapper between them carrying `role="none"`. Application, group and other-site rows, and the rows of flyout panels, SHALL have `role="menuitem"` and `tabindex="0"`. The search field and the empty-result message MUST be outside the menu.

#### Scenario: List semantics

- **WHEN** the popup opens
- **THEN** it contains an element with `role="menu"` and `aria-orientation="vertical"`
- **AND** its application rows have `role="menuitem"` and `tabindex="0"`

#### Scenario: Search field outside the menu

- **WHEN** the popup opens with a search field
- **THEN** the search field is not a descendant of the `role="menu"` element

#### Scenario: Flyout rows

- **WHEN** a site flyout is open
- **THEN** its application rows have `role="menuitem"` and `tabindex="0"`

### Requirement: Expandable row semantics

Group rows SHALL carry `aria-expanded` that reflects whether the group is expanded. Other-site rows and group rows inside flyout panels SHALL carry `aria-haspopup="menu"`, and other-site rows SHALL carry `aria-expanded` that reflects whether their flyout is open.

#### Scenario: Group row

- **WHEN** the popup opens with a group
- **THEN** the group row has `aria-expanded="true"`

#### Scenario: Other-site row

- **WHEN** the popup opens in multi-site mode
- **THEN** each other-site row has `aria-haspopup="menu"` and `aria-expanded="false"`

### Requirement: Search field naming

The search field SHALL be named through `aria-label` with the localized search placeholder, which is also its placeholder text, and its magnifier icon SHALL carry `aria-hidden="true"`. The clear button SHALL be named with the localized clear-search text.

#### Scenario: Names

- **WHEN** the popup opens with a search field and the user types a query
- **THEN** the field's `aria-label` is the search placeholder of the active locale
- **AND** the clear button's `aria-label` is the clear-search text of the active locale

### Requirement: Trigger semantics are left to the consumer

The directive MUST NOT add ARIA attributes such as `aria-haspopup`, `aria-expanded` or `aria-label` to the trigger element; naming the trigger is the consumer's job.

#### Scenario: Icon-only trigger

- **WHEN** the trigger is an icon button without text
- **THEN** it has an accessible name only if the consumer gives it one, for example with `aria-label`

### Requirement: No axe violations

With every flyout closed, the open popup SHALL have no axe-core violations in single-site mode, in multi-site mode and while it shows search results.

#### Scenario: Axe audit

- **WHEN** the popup is open in single-site mode, in multi-site mode, or with a query that matches
- **THEN** an axe-core audit of the overlay reports no violations

### Requirement: Tooltip on the trigger

A tooltip on the trigger element MUST NOT show while the switcher is open, nor when the switcher closes with Escape and focus returns to the trigger. Once the switcher has closed, a pointer that comes back to the trigger SHALL show the tooltip again.

#### Scenario: Pointer back on the trigger of an open switcher

- **WHEN** the switcher is open and the pointer leaves the trigger and comes back
- **THEN** the tooltip does not show

#### Scenario: Escape returns focus to the trigger

- **WHEN** the switcher closes with Escape and focus returns to the trigger
- **THEN** the tooltip does not show

#### Scenario: After the switcher has closed

- **WHEN** the switcher has closed and the pointer comes back to the trigger
- **THEN** the tooltip shows after its enter delay

### Requirement: Localized strings

The search placeholder, the empty-result message, the other-sites heading and the clear-search label SHALL come from the `appSwitcher` section of the active locale and follow locale changes. Without a locale service the value of `KBQ_APP_SWITCHER_LOCALE_CONFIGURATION` SHALL be used, which defaults to the Russian strings.

#### Scenario: English locale

- **WHEN** the active locale is `en-US`
- **THEN** the strings are `Search`, `Nothing found`, `Other sites` and `Clear search`

#### Scenario: No locale service

- **WHEN** no locale service is provided and the token is not overridden
- **THEN** the strings are `Поиск`, `Ничего не найдено`, `Другие площадки` and `Очистить поиск`

### Requirement: Overriding strings

`kbqAppSwitcherLocaleConfigurationProvider()` given a partial configuration SHALL override only the strings it contains, while the other strings keep following the active locale.

#### Scenario: One string overridden

- **WHEN** the provider sets only `sitesHeader` and the active locale changes
- **THEN** the other-sites heading keeps the overridden text
- **AND** the other strings follow the new locale

### Requirement: Module and standalone use

`KbqAppSwitcherModule` SHALL export the trigger directive and provide the default scroll strategy. Importing `KbqAppSwitcherTrigger` on its own SHALL work without `kbqAppSwitcherProvider()`, and a `KBQ_APP_SWITCHER_SCROLL_STRATEGY` provided by the application SHALL take precedence over the default.

#### Scenario: Standalone import

- **WHEN** a standalone component imports `KbqAppSwitcherTrigger` without adding any provider
- **THEN** the switcher opens and works as with the module
