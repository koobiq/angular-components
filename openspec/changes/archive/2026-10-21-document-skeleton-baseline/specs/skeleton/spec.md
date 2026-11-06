# Spec Delta

## Purpose

Describes what the `kbqSkeleton` directive, the `kbq-skeleton` element and the presets of `@koobiq/components/skeleton` guarantee to consumers: how a placeholder is turned on and off, how it hides and blocks the content it covers, how its wave runs, and which shapes, counts and sizes each preset renders while data loads.

## ADDED Requirements

### Requirement: Skeleton selectors

The skeleton SHALL apply to a `kbq-skeleton` element and to any element with the `kbqSkeleton` attribute, and SHALL be exported to templates as `kbqSkeleton`. Its host MUST carry the `kbq-skeleton` class whether the skeleton is on or off.

#### Scenario: Element and attribute

- **WHEN** a template renders `<kbq-skeleton />` and `<button kbqSkeleton>Save</button>`
- **THEN** both hosts carry the `kbq-skeleton` class

#### Scenario: Template reference

- **WHEN** a template declares `<div kbqSkeleton #skeleton="kbqSkeleton">`
- **THEN** `skeleton.enabled()` reads whether the skeleton is on

### Requirement: Turning a skeleton on and off

A skeleton SHALL be on by default. The `kbqSkeleton` input SHALL be read as a boolean attribute: an attribute without a value turns it on, while `false`, `"false"`, `null` and `undefined` turn it off. While off, the host MUST carry the `kbq-skeleton_disabled` class, and the class MUST be removed once it is on again.

#### Scenario: Attribute without a value

- **WHEN** a template renders `<span kbqSkeleton>Text</span>`
- **THEN** the skeleton is on and the host has no `kbq-skeleton_disabled` class

#### Scenario: Bound to a loading flag

- **WHEN** the host is `<button [kbqSkeleton]="loading">` and `loading` changes from `false` to `true`
- **THEN** the `kbq-skeleton_disabled` class is removed from the host

### Requirement: An active skeleton is inert

While a skeleton is on, its host SHALL carry the `inert` attribute, so the host and its descendants leave the tab order and the accessibility tree and ignore pointer input. While it is off, the host MUST NOT carry `inert`.

#### Scenario: Toggling the skeleton

- **WHEN** a skeleton bound to a flag is turned on and then off
- **THEN** the host has the `inert` attribute while it is on
- **AND** the attribute is removed once it is off

### Requirement: An active skeleton hides the content it covers

While a skeleton is on, the host SHALL be painted, children included, as one flat filled shape of its own outline: text becomes transparent, shadows are dropped, and the content can be neither selected nor clicked. The content MUST stay in the DOM and keep its layout, so the placeholder has the size of the content. An inline host that wraps SHALL get one bar per line. While off, the host MUST render as usual.

#### Scenario: Directive on rendered text

- **WHEN** `[kbqSkeleton]` is on for a `<span>` holding a long sentence that wraps over two lines
- **THEN** each line of the span is painted as a filled bar of the line's length
- **AND** the text is not readable

#### Scenario: Directive on a component

- **WHEN** `[kbqSkeleton]` is on for a `kbq-button` with an icon and a label
- **THEN** the button, icon and label are painted as one shape of the button's outline at the button's size

### Requirement: Border radius fallback

While a skeleton is on, a host that has no border radius of its own SHALL get the skeleton's default radius. A host whose styles set a radius, including an explicit `0`, MUST keep it. A class on a `kbq-skeleton` element MUST be able to override the radius. Once the skeleton is off, the host SHALL show its own radius again.

#### Scenario: Host without a radius

- **WHEN** a skeleton is on for a plain `<span>` or `<div>`
- **THEN** the host is rounded with the skeleton radius
- **AND** the radius is back to `0px` once the skeleton is off

#### Scenario: Host with its own radius

- **WHEN** a skeleton is on for a `kbq-button`, a `kbq-alert`, a `kbq-form-field` or an element whose class sets `border-radius: 10px`
- **THEN** the host keeps the same radius it has with the skeleton off

#### Scenario: Explicit zero and a circle

- **WHEN** a skeleton host has `border-radius: 0`, and a `kbq-skeleton` element has a class with `border-radius: 50%`
- **THEN** the first stays square and the second is round

### Requirement: Size of the kbq-skeleton element

While on, a `kbq-skeleton` element SHALL be a block that stretches across the width of its container and has a minimum height, so it shows without any size of its own. A consumer class or style MUST be able to set its width and height. While off, the element MUST lose this display and minimum height.

#### Scenario: Height from a class

- **WHEN** a `kbq-skeleton` element with a class that sets `height: 100px` is placed in a block container
- **THEN** the element is as wide as the container and 100 px tall

#### Scenario: Width from a class

- **WHEN** a `kbq-skeleton` element has a class that sets `inline-size: 50%`
- **THEN** it takes half of the width of its container

### Requirement: Wave animation

While a skeleton is on and motion is allowed, a band SHALL run across its fill, repeating without end, and the host MUST NOT carry the `kbq-animations-disabled` class.

#### Scenario: Default motion

- **WHEN** a skeleton is rendered without any motion setting
- **THEN** the host has no `kbq-animations-disabled` class and its band runs across the fill

### Requirement: Motion can be turned off

When `KBQ_ANIMATIONS_CONFIG` sets `animationsDisabled`, when the application uses `provideNoopAnimations()`, or when the user prefers reduced motion at the moment the skeleton is created, the host SHALL carry the `kbq-animations-disabled` class and the fill MUST stand still without the band. A reduced-motion preference SHALL also stop the band through the media query alone.

#### Scenario: Animations disabled by configuration

- **WHEN** `KBQ_ANIMATIONS_CONFIG` is provided with `{ animationsDisabled: true }`
- **THEN** every skeleton host carries `kbq-animations-disabled`
- **AND** its fill stands still

#### Scenario: Reduced motion

- **WHEN** the user's system prefers reduced motion
- **THEN** skeletons show their fill without the band

### Requirement: One wave across the page

Every active skeleton SHALL show the same band at the same moment, so skeletons side by side read as one band crossing the viewport. Each wave SHALL be aligned with the first one that started, and the host's horizontal position SHALL be measured again on every pass of the band. Once no active skeleton is left, the next one MUST start a new wave of its own.

#### Scenario: Two skeletons start apart

- **WHEN** a second skeleton starts its wave later than the first one
- **THEN** its wave is aligned to the start of the first one

#### Scenario: Host moves between passes

- **WHEN** a skeleton host moves horizontally and its band starts the next pass
- **THEN** the band is aligned with the host's new position

#### Scenario: All skeletons gone

- **WHEN** every skeleton has been destroyed and a new one is rendered
- **THEN** the new skeleton's wave is not aligned to the old start time

### Requirement: Other animations are left alone

The skeleton MUST align only the band of its own host. Other animations of the host, and animations of its descendants, MUST keep their own timing.

#### Scenario: Another animation on the host

- **WHEN** a skeleton host also runs an unrelated CSS animation
- **THEN** that animation's start time is unchanged

#### Scenario: Animation of a descendant

- **WHEN** an element inside an active skeleton host starts an animation
- **THEN** the skeleton does not react to it

### Requirement: The wave pauses outside the viewport

An active skeleton whose host is more than 100 px outside the viewport SHALL carry the `kbq-skeleton_offscreen` class and stop its band while keeping the fill; the class MUST be removed once the host comes back into view. Where `IntersectionObserver` is not available, every active skeleton SHALL keep its band running.

#### Scenario: Host scrolls out and back

- **WHEN** an active skeleton host leaves the viewport and then returns
- **THEN** the host carries `kbq-skeleton_offscreen` while it is out
- **AND** loses the class when it is back

#### Scenario: No IntersectionObserver

- **WHEN** the window has no `IntersectionObserver`
- **THEN** skeletons render without error and none carries `kbq-skeleton_offscreen`

### Requirement: A skeleton leaves no trace once off or destroyed

When a skeleton is turned off or destroyed, it SHALL stop taking part in the wave and remove what it added to the host for the wave: the `kbq-skeleton_offscreen` class and its inline style. Late viewport reports and band events that arrive after that MUST NOT change the host.

#### Scenario: Turned off while offscreen

- **WHEN** an active skeleton outside the viewport is turned off
- **THEN** the host carries neither `kbq-skeleton_offscreen` nor an inline style added by the skeleton
- **AND** a viewport report or band event that arrives afterwards changes nothing

#### Scenario: Destroyed

- **WHEN** the view holding a skeleton is destroyed
- **THEN** the skeleton stops observing its host and the inline style it added is removed

### Requirement: Styles load on their own

Rendering the skeleton directive or any preset SHALL load the skeleton styles, presets included, without a skeleton-specific theme mixin or stylesheet import from the consumer. The global Koobiq design tokens MUST still be present, as for every component, because the wave colors come from them.

#### Scenario: No skeleton stylesheet

- **WHEN** an application that includes the Koobiq design tokens imports only `KbqSkeleton` and renders `<kbq-skeleton />`
- **THEN** the element is painted as a skeleton with its wave

### Requirement: No ARIA of its own

The skeleton and its presets MUST NOT set a role, `aria-busy` or an accessible name. An active skeleton is hidden from assistive technology by `inert`; announcing that content is loading is left to the consumer.

#### Scenario: Active skeleton in the accessibility tree

- **WHEN** a skeleton is on for a heading
- **THEN** the heading is absent from the accessibility tree
- **AND** the skeleton adds no ARIA attribute to the host

### Requirement: Element presets are skeletons themselves

`kbq-skeleton-button`, `kbq-skeleton-badge`, `kbq-skeleton-tag`, `kbq-skeleton-icon` and `kbq-skeleton-link` SHALL each render as an active skeleton with no children: the host carries `kbq-skeleton`, the class named after its element (such as `kbq-skeleton-button`) and the `inert` attribute.

#### Scenario: Every element preset

- **WHEN** the five element presets are rendered
- **THEN** each host carries `kbq-skeleton`, its own element name as a class and `inert`
- **AND** none has child elements

### Requirement: Element preset sizes

Each element preset SHALL default to the size of the component it stands in for: button 72 × 32 px, badge and tag 56 × 24 px, icon 24 × 24 px, link 32 × 20 px. A consumer class MUST be able to override that size.

#### Scenario: Default sizes

- **WHEN** the five element presets are rendered without classes
- **THEN** the button is 72 × 32 px, the badge and the tag are 56 × 24 px, the icon is 24 × 24 px and the link is 32 × 20 px

#### Scenario: Wider button

- **WHEN** a `kbq-skeleton-button` has a class that sets `width: 120px`
- **THEN** it is 120 × 32 px

### Requirement: Element presets cannot be turned off

The element presets MUST NOT accept the `kbqSkeleton` input; they are always on. A consumer swaps them for the real component by removing them from the template.

#### Scenario: Swapping a preset for the component

- **WHEN** a template shows `<kbq-skeleton-button />` under `@if (loading)` and the real button under `@else`
- **THEN** the placeholder is replaced by the button once `loading` is `false`

### Requirement: Layout presets draw their parts as skeletons

The layout presets (`kbq-skeleton-typography`, `kbq-skeleton-group`, `kbq-skeleton-dl`, `kbq-skeleton-table`, `kbq-skeleton-form-field`, `kbq-skeleton-accordion`, `kbq-skeleton-checkable`, `kbq-skeleton-tabs` and `kbq-skeleton-tree`) SHALL draw every placeholder part as an active, inert skeleton. Their own host MUST NOT be a skeleton and MUST NOT be inert.

#### Scenario: Parts of the default presets

- **WHEN** the typography, description list, table and badge group presets are rendered with their defaults
- **THEN** they hold 1 + 6 + 12 + 3 skeleton blocks, every one of them inert

#### Scenario: Parts of the component presets

- **WHEN** the accordion, checkable, tabs and tree presets are rendered with their defaults
- **THEN** they hold 26 skeleton blocks, every one of them inert

### Requirement: Typography level

`kbq-skeleton-typography` SHALL carry the class of its typography level, `kbq-` followed by the `level` input, which defaults to `text-normal`. Changing the level MUST replace the previous level class, and the host MUST keep `kbq-skeleton-typography`, the classes set in the template and the classes other directives bind on it.

#### Scenario: Default level

- **WHEN** `<kbq-skeleton-typography />` is rendered
- **THEN** the host carries `kbq-text-normal`

#### Scenario: Changing the level

- **WHEN** `level` changes from `text-normal` to `title`
- **THEN** the host carries `kbq-title` and `kbq-skeleton-typography` and no longer carries `kbq-text-normal`

#### Scenario: Class from another directive

- **WHEN** another directive on the same element binds a class
- **THEN** that class stays next to the level class

### Requirement: Typography lines

`kbq-skeleton-typography` SHALL render as many line placeholders as its `lines` input, which defaults to `typographyLines` of the presets configuration.

#### Scenario: Default number of lines

- **WHEN** `<kbq-skeleton-typography />` is rendered without a configuration
- **THEN** it holds one line

#### Scenario: Several lines

- **WHEN** `lines` is set to 5
- **THEN** it holds five lines

### Requirement: Typography geometry

`kbq-skeleton-typography` SHALL be as tall as the same number of lines of text at its level, each bar a small gap shorter than the line. A single line SHALL take half of the width; several lines SHALL take 80 %, 100 % and 60 % of the width in turn, starting again every three lines. A consumer class MUST be able to set the width.

#### Scenario: Heading

- **WHEN** a `kbq-skeleton-typography` with `level="title"` is rendered next to a line of `kbq-title` text
- **THEN** both are equally tall
- **AND** the bar is half as wide as the preset

#### Scenario: Paragraph

- **WHEN** a `kbq-skeleton-typography` with four lines is rendered
- **THEN** its lines take 80 %, 100 %, 60 % and 80 % of its width

### Requirement: Group of element presets

`kbq-skeleton-group` SHALL repeat the element preset named by its required `preset` input (`button`, `badge`, `tag`, `icon` or `link`) `count` times, `groupCount` of the presets configuration by default. The host SHALL carry `kbq-skeleton-group_<preset>`, and changing `preset` MUST swap both the items and the class.

#### Scenario: Tags

- **WHEN** `<kbq-skeleton-group preset="tag" />` is rendered
- **THEN** it holds three `kbq-skeleton-tag` elements and carries `kbq-skeleton-group_tag`

#### Scenario: Switching to buttons

- **WHEN** `preset` changes from `tag` to `button`
- **THEN** it holds three `kbq-skeleton-button` elements and no tag
- **AND** it carries `kbq-skeleton-group_button` instead of `kbq-skeleton-group_tag`

### Requirement: Description list preset

`kbq-skeleton-dl` SHALL render a term and a description placeholder for each of its `rows`, `dlRows` of the presets configuration by default. The terms SHALL be 120 px wide, and the rows SHALL be spaced as the rows of a `kbq-dl`.

#### Scenario: Default rows

- **WHEN** `<kbq-skeleton-dl />` is rendered next to a `kbq-dl` of three terms
- **THEN** it holds three terms and three descriptions
- **AND** its terms are 120 px wide and as far apart as the terms of the `kbq-dl`

### Requirement: Table rows and header

`kbq-skeleton-table` SHALL render `rows` rows of cells, `tableRows` of the presets configuration by default, below a header row. With `header` set to `false`, the header row MUST NOT be rendered. The header cells and the other cells SHALL be as tall as the header and body cells of a `kbq-table`.

#### Scenario: Default table

- **WHEN** `<kbq-skeleton-table />` is rendered
- **THEN** it holds three header cells and nine other cells

#### Scenario: No header

- **WHEN** `header` is `false`
- **THEN** no header cell is rendered and nine cells remain

### Requirement: Table columns

The `columns` input of `kbq-skeleton-table` SHALL accept a number, which gives that many columns of equal width, or an array of CSS grid track sizes, which gives one column of that width per entry. It defaults to `tableColumns` of the presets configuration. The tracks SHALL be written to the host's `grid-template-columns`.

#### Scenario: Equal columns

- **WHEN** `columns` is 2
- **THEN** the host's `grid-template-columns` holds two equal tracks of one `fr` each that may shrink to zero
- **AND** there are two header cells

#### Scenario: Columns of their own widths

- **WHEN** `columns` is `['160px', 'auto', '48px']`
- **THEN** the host's `grid-template-columns` is `160px auto 48px`
- **AND** the first column is 160 px wide and the last is 48 px wide

### Requirement: Selectable table

With `selectable` set, `kbq-skeleton-table` SHALL start the header and every row with a checkbox placeholder cell, and its grid SHALL get a selection column before the other columns. `selectable` defaults to `false`.

#### Scenario: Selection column

- **WHEN** `selectable` is set on a table with a header, three rows and three columns
- **THEN** four cells carry `kbq-skeleton-table__cell_selection`
- **AND** the host's `grid-template-columns` starts with the selection column, followed by the three columns

### Requirement: Pinned columns of a table

With `pinnedColumns` set to N, every cell of the N-th column of `kbq-skeleton-table`, header included and the selection column not counted, SHALL carry `kbq-skeleton-table__cell_pinned-edge`, which draws a line after the pinned columns. It defaults to 0, which marks no cell.

#### Scenario: One pinned column in a selectable table

- **WHEN** `selectable` is set and `pinnedColumns` is 1
- **THEN** four cells carry `kbq-skeleton-table__cell_pinned-edge`
- **AND** the first header cell after the selection cell is one of them, and the selection cell is not

### Requirement: Form field preset

`kbq-skeleton-form-field` SHALL render, by default, a label placeholder above an input placeholder and no hint. With `horizontal` the host SHALL carry `kbq-skeleton-form-field_horizontal`; with `control="textarea"` it SHALL carry `kbq-skeleton-form-field_textarea`; `hint` SHALL add a hint placeholder below the control; `label` set to `false` MUST leave the label out.

#### Scenario: Default form field

- **WHEN** `<kbq-skeleton-form-field />` is rendered
- **THEN** it holds one label placeholder and one control placeholder and no hint
- **AND** the host carries neither the horizontal nor the textarea class

#### Scenario: Horizontal textarea with a hint

- **WHEN** `horizontal`, `control="textarea"` and `hint` are set
- **THEN** the host carries `kbq-skeleton-form-field_horizontal` and `kbq-skeleton-form-field_textarea`
- **AND** a hint placeholder follows the control

#### Scenario: No label

- **WHEN** `label` is `false`
- **THEN** no label placeholder is rendered and the control placeholder remains

### Requirement: Form field column classes

The `labelClass` input of `kbq-skeleton-form-field` SHALL be applied to its label and the `contentClass` input to the part that holds the control and the hint, as the inputs of the same name on `kbq-form-field`.

#### Scenario: Column widths

- **WHEN** `labelClass` is `flex-30` and `contentClass` is `flex-70`
- **THEN** the label part carries `flex-30` and the content part carries `flex-70`

### Requirement: Form field geometry

`kbq-skeleton-form-field` SHALL place its label and control at the position and size of the label and control container of a `kbq-form-field` with the same layout, and start its hint where the hint of that form field starts. Without a label, it SHALL have the size of a form field that has only a control.

#### Scenario: Matching layouts

- **WHEN** the horizontal, vertical and textarea presets with a hint are rendered next to `kbq-form-field` elements of the same layout
- **THEN** each label and control placeholder has the box of the form field's label and control container
- **AND** each hint placeholder starts where the form field's hint starts

#### Scenario: Control alone

- **WHEN** a preset with `label` set to `false` is rendered next to a `kbq-form-field` with an input only
- **THEN** both have the same size and the control placeholder has the box of the control container

### Requirement: Accordion preset

`kbq-skeleton-accordion` SHALL render `rows` collapsed items, `accordionRows` of the presets configuration by default, each with an icon and a title placeholder. Each item SHALL have the box of a collapsed `kbq-accordion` item, and each icon SHALL be centred where the item's icon is.

#### Scenario: Default accordion

- **WHEN** `<kbq-skeleton-accordion />` is rendered next to a `kbq-accordion` of three collapsed items
- **THEN** it holds three items with the boxes of the accordion items
- **AND** its icons are centred on the icons of the accordion triggers

### Requirement: Checkable control

`kbq-skeleton-checkable` SHALL stand in for a checkbox by default, and for a radio button or a toggle when `control` is `radio` or `toggle`. The host SHALL carry `kbq-skeleton-checkable_<control>` and MUST keep `kbq-skeleton-checkable` when the control changes.

#### Scenario: Switching controls

- **WHEN** `control` changes from the default to `toggle` and then to `radio`
- **THEN** the host carries `kbq-skeleton-checkable_checkbox`, then `kbq-skeleton-checkable_toggle`, then `kbq-skeleton-checkable_radio`, each replacing the previous one
- **AND** `kbq-skeleton-checkable` stays on the host

### Requirement: Checkable rows, label and hint

`kbq-skeleton-checkable` SHALL render `rows` control placeholders, `checkableRows` of the presets configuration by default. Each SHALL have a label placeholder unless `label` is `false`, and a hint placeholder below the label when `hint` is set. Without a label, the hint MUST NOT be rendered either.

#### Scenario: Label and hint

- **WHEN** a single checkable placeholder has `hint` set
- **THEN** it holds a control, a label and a hint placeholder

#### Scenario: Label left out

- **WHEN** `hint` is set and `label` is `false`
- **THEN** only the control placeholder is rendered

### Requirement: Checkable geometry

The control placeholder of `kbq-skeleton-checkable` SHALL have the box of the control of a `kbq-checkbox`, `kbq-radio-button` or `kbq-toggle`, and its text lines SHALL start at the position and have the height of that component's text.

#### Scenario: Next to the real controls

- **WHEN** the checkbox and toggle presets with a hint and a radio preset of three rows are rendered next to the matching components
- **THEN** every control placeholder has the box of the component's control
- **AND** every text placeholder starts at the position and has the height of the component's text

### Requirement: Tabs preset

`kbq-skeleton-tabs` SHALL render `count` tab placeholders, `tabsCount` of the presets configuration by default, and mark the first one with `kbq-skeleton-tabs__tab_selected`. With `vertical` set, the host SHALL carry `kbq-skeleton-tabs_vertical`, and the tabs SHALL be stacked beside the content.

#### Scenario: Default tabs

- **WHEN** `<kbq-skeleton-tabs />` is rendered
- **THEN** it holds three tabs, only the first of them selected
- **AND** the host does not carry `kbq-skeleton-tabs_vertical`

#### Scenario: Vertical tabs

- **WHEN** `vertical` is set
- **THEN** the host carries `kbq-skeleton-tabs_vertical`

### Requirement: Content of the tabs preset

When nothing is projected into it, `kbq-skeleton-tabs` SHALL show a `kbq-skeleton-typography` of `contentLines` lines, `tabsContentLines` of the presets configuration by default, as its content. Projected content MUST replace that text.

#### Scenario: Default content

- **WHEN** `<kbq-skeleton-tabs />` is rendered
- **THEN** its content is a typography placeholder of three lines

#### Scenario: Projected placeholder

- **WHEN** a `kbq-skeleton-dl` is projected into `kbq-skeleton-tabs`
- **THEN** the content holds the description list placeholder and no typography placeholder

### Requirement: Tabs geometry

The tab placeholders of `kbq-skeleton-tabs` SHALL be as tall as the tab labels of a `kbq-tab-group`, and stacked tabs SHALL be as far apart as the labels of a vertical `kbq-tab-group`.

#### Scenario: Next to tab groups

- **WHEN** a horizontal and a vertical tabs preset are rendered next to `kbq-tab-group` elements of three tabs
- **THEN** the tab placeholders are as tall as the tab labels
- **AND** the stacked placeholders are as far apart as the stacked labels

### Requirement: Tree preset

`kbq-skeleton-tree` SHALL render `rows` top-level nodes, `treeRows` of the presets configuration by default, with the second node expanded: `children` nested nodes, `treeChildren` by default, follow it and carry `kbq-skeleton-tree__node_nested`. With fewer than two top-level nodes, no nested node SHALL be rendered. Each node SHALL have a toggle and a label placeholder.

#### Scenario: Default tree

- **WHEN** a tree preset with three rows and three children is rendered
- **THEN** its nodes are, in order: two top-level nodes, three nested nodes, one top-level node

#### Scenario: One top-level node

- **WHEN** `rows` is 1
- **THEN** the tree holds a single node and no nested node

### Requirement: Tree geometry

The nodes of `kbq-skeleton-tree` SHALL have the boxes of the options of a `kbq-tree-selection` that uses `kbqTreeNodePadding` with its default, with the second node expanded, and each toggle SHALL be centred where the node toggle of that option is, at every level.

#### Scenario: Next to a tree

- **WHEN** the default tree preset is rendered next to such a tree of three nodes with the second one expanded
- **THEN** every node placeholder has the box of the matching tree option
- **AND** every toggle placeholder is centred on the matching node toggle

### Requirement: Count inputs

The inputs that set a number of items (`lines`, `rows`, `count`, `contentLines`, `children`, and `columns` given as a number) SHALL accept a number or a string. A string holding a number SHALL be read as that number. A value that is not a number, or is not finite, SHALL render a single item.

#### Scenario: Numeric string

- **WHEN** `lines` of a typography preset is `'4'`
- **THEN** it holds four lines

#### Scenario: Not a number

- **WHEN** `rows` of a description list preset is `'not a number'`
- **THEN** it holds a single row

#### Scenario: Infinity

- **WHEN** `rows` of a description list preset is `'Infinity'`
- **THEN** it holds a single row

### Requirement: Default presets configuration

Without a configuration, the presets SHALL use these counts: `typographyLines` 1, `dlRows` 3, `tableRows` 3, `tableColumns` 3, `groupCount` 3, `accordionRows` 3, `checkableRows` 1, `tabsCount` 3, `tabsContentLines` 3, `treeRows` 3 and `treeChildren` 3. `KBQ_SKELETON_PRESETS_CONFIGURATION` SHALL provide these values at the root.

#### Scenario: Default presets

- **WHEN** every layout preset is rendered without inputs or configuration
- **THEN** typography has one line, the description list three rows, the table three rows of three columns, the group three items, the accordion three items, the checkable one control, the tabs three tabs over three lines and the tree three top-level nodes

### Requirement: Configuration provider

`kbqSkeletonPresetsConfigurationProvider()` SHALL take a partial configuration and provide it to the presets of the injector where it is used and below. A key it leaves out SHALL keep the value of the nearest configuration above, and a key no configuration sets SHALL fall back to the default.

#### Scenario: Application-wide counts

- **WHEN** the provider sets `typographyLines` 5, `dlRows` 4, `tableRows` 2, `tableColumns` 4 and `groupCount` 1
- **THEN** the presets render five lines, four rows, a table of two rows of four columns and a single group item

#### Scenario: Nested provider

- **WHEN** an application provides `{ tableRows: 4 }` and a component below it provides `{ dlRows: 2 }`
- **THEN** presets in that component render two description list rows, four table rows and the default single typography line

#### Scenario: Partial value provided directly above

- **WHEN** an application provides the token itself with only `tableRows: 4`, and a component below uses the provider with `{ dlRows: 2 }`
- **THEN** presets in that component render two description list rows, four table rows, three table columns and one typography line

### Requirement: Inputs override the configuration

A count set through a preset input SHALL take precedence over the presets configuration.

#### Scenario: Input over configuration

- **WHEN** the configuration sets `dlRows` to 4 and a description list preset has `rows` set to 1
- **THEN** that preset holds a single row

### Requirement: NgModule

`KbqSkeletonModule` SHALL import and export `KbqSkeleton` and the fourteen presets, so NgModule-based consumers get all of them with one import.

#### Scenario: Module import

- **WHEN** an NgModule imports `KbqSkeletonModule`
- **THEN** its templates can use `kbqSkeleton`, `kbq-skeleton` and every `kbq-skeleton-*` preset
