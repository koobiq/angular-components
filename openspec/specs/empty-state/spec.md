# empty-state Specification

## Purpose

Describes what `kbq-empty-state` from `@koobiq/components/empty-state` guarantees to consumers: which content it renders and in what order, how `size`, `alignTop` and `errorColor` change it, which classes it exposes, and what it leaves to the consumer for accessibility.

## Requirements

### Requirement: Content slots render in a fixed order

The empty state SHALL render content marked with the `kbq-empty-state-icon`, `kbq-empty-state-title`, `kbq-empty-state-text` and `kbq-empty-state-actions` attributes in that order, whatever order the consumer declares them in. Every slot SHALL be optional, and an empty slot MUST NOT leave an element of its own behind.

#### Scenario: All four slots filled

- **WHEN** an empty state contains an illustration, a title, a text and an actions row
- **THEN** they render top to bottom as illustration, title, text, actions

#### Scenario: Slots declared out of order

- **WHEN** the consumer declares the actions row first and the illustration last
- **THEN** the illustration still renders first and the actions row last

#### Scenario: Text only

- **WHEN** an empty state contains only a `kbq-empty-state-text` element
- **THEN** only that text renders, with no placeholder for the other slots

### Requirement: Host and slot classes

The host element SHALL carry the `kbq-empty-state` class. Each slot directive SHALL add its own class to the element it sits on: `kbq-empty-state-icon`, `kbq-empty-state-title`, `kbq-empty-state-text` and `kbq-empty-state-actions`.

#### Scenario: Classes of a fully filled empty state

- **WHEN** an empty state with all four slots filled is rendered
- **THEN** the host has `kbq-empty-state`
- **AND** the illustration, title, text and actions elements have `kbq-empty-state-icon`, `kbq-empty-state-title`, `kbq-empty-state-text` and `kbq-empty-state-actions` respectively

### Requirement: Size selects one size class

The `size` input SHALL accept `compact`, `normal` and `big` and default to `normal`. The host SHALL carry exactly one size class, `kbq-empty-state_<size>`, and a new value MUST replace the previous class rather than add to it.

#### Scenario: Default size

- **WHEN** `size` is not set
- **THEN** the host has `kbq-empty-state_normal`

#### Scenario: Each size

- **WHEN** `size` is `compact`, `normal` or `big`
- **THEN** the host has `kbq-empty-state_compact`, `kbq-empty-state_normal` or `kbq-empty-state_big`

#### Scenario: Changing the size

- **WHEN** `size` changes from `normal` to `big`
- **THEN** the host has `kbq-empty-state_big` and no longer has `kbq-empty-state_normal`

### Requirement: Size sets spacing, width and typography

The size SHALL set the padding of the host and the gaps between the slots. It SHALL limit the width of the title, the text and the actions row to 320 px at `compact` and `normal` and to 480 px at `big`, so longer content wraps. The title SHALL use the `text-normal`, `subheading` or `headline` typography and the text `text-compact`, `text-normal` or `text-big` at `compact`, `normal` and `big`.

#### Scenario: Long text at the normal size

- **WHEN** a `normal` empty state has a text of several hundred characters
- **THEN** the text wraps at 320 px

#### Scenario: Big size

- **WHEN** `size` is `big`
- **THEN** the title uses the `headline` typography, the text the `text-big` typography, and both wrap at 480 px

#### Scenario: Compact size

- **WHEN** `size` is `compact`
- **THEN** the title uses the `text-normal` typography and the text the `text-compact` typography

### Requirement: Alignment class

The `alignTop` input SHALL default to `false`. While it is `false` the host SHALL carry `kbq-empty-state_align-center` and center the content vertically; while it is `true` the host SHALL carry `kbq-empty-state_align-top` and place the content at the top. The host MUST carry exactly one of the two classes.

#### Scenario: Default alignment

- **WHEN** `alignTop` is not set
- **THEN** the host has `kbq-empty-state_align-center` and not `kbq-empty-state_align-top`

#### Scenario: Top alignment

- **WHEN** `alignTop` is `true`
- **THEN** the host has `kbq-empty-state_align-top` and not `kbq-empty-state_align-center`

### Requirement: Alignment needs a height

The host SHALL be a vertical flex container that grows as a flex item inside a flex parent. It MUST NOT have an intrinsic height of its own: in a block container, and without a height set by the consumer, it is as tall as its content plus its padding, and the two alignments look the same. A parent that stretches its items, such as a flex container or a grid container whose row has a fixed height, gives it that height.

#### Scenario: Host with a height

- **WHEN** the host has a `min-height` larger than its content and `alignTop` is `true`
- **THEN** the content sits at the top and the free space is below it

#### Scenario: Host without a height

- **WHEN** the host is in a block container and has no height set
- **THEN** it is as tall as its content plus its padding, and changing `alignTop` does not move the content

#### Scenario: Host in a flex parent

- **WHEN** the host is the only child of a flex container with a fixed height and the default `align-items`
- **THEN** it fills that container, and the alignment applies within the container's height

#### Scenario: Host in a grid parent

- **WHEN** the host has no height set and is the only item of a grid container whose single row has a fixed height
- **THEN** it fills that row, and the alignment applies within the row's height

### Requirement: Content is centred horizontally

The empty state SHALL centre every slot horizontally within the host, and the title and the text SHALL have centred text.

#### Scenario: Multi-line text

- **WHEN** the text wraps onto several lines
- **THEN** each line is centred, and the text block is centred within the host

### Requirement: Error color class

The `errorColor` input SHALL default to `false`. While it is `false` the host SHALL carry `kbq-empty-state_normal-color`; while it is `true` the host SHALL carry `kbq-empty-state_error-color`. The host MUST carry exactly one of the two classes.

#### Scenario: Default color

- **WHEN** `errorColor` is not set
- **THEN** the host has `kbq-empty-state_normal-color` and not `kbq-empty-state_error-color`

#### Scenario: Error color

- **WHEN** `errorColor` is `true`
- **THEN** the host has `kbq-empty-state_error-color` and not `kbq-empty-state_normal-color`

### Requirement: Title and text follow the color

In the normal color the title SHALL use the contrast foreground color and the text the secondary contrast foreground color. With `errorColor` set, both SHALL use the error foreground color. The actions row MUST NOT be recolored.

#### Scenario: Error state

- **WHEN** `errorColor` is `true`
- **THEN** the title and the text render in the error color
- **AND** the buttons in the actions row keep their own colors

### Requirement: Error tint reaches an icon item in the illustration slot

While `errorColor` is `true`, the empty state SHALL add the `kbq-error` class to every `kbq-icon-item` that carries the `kbq-empty-state-icon` attribute itself or is declared inside that element in the same template, including the template of a component nested in its content, since the slot finds the empty state through dependency injection. An icon item that another component in the slot renders with no such mark in its own template MUST NOT be reached.

#### Scenario: Icon item on the slot element

- **WHEN** a `kbq-icon-item` carries `kbq-empty-state-icon` and `errorColor` is `true`
- **THEN** the icon has the `kbq-error` class

#### Scenario: Icon item wrapped by the slot element

- **WHEN** a `kbq-icon-item` sits inside a `<div kbq-empty-state-icon>` and `errorColor` is `true`
- **THEN** the icon has the `kbq-error` class

#### Scenario: Icon item inside another component

- **WHEN** the illustration slot holds a consumer component whose own template renders a `kbq-icon-item` with no `kbq-empty-state-icon` on it or on an element around it, and `errorColor` is `true`
- **THEN** that icon does not receive the `kbq-error` class from the empty state

#### Scenario: Error color set before the first render

- **WHEN** `errorColor` is already `true` when the icon first renders
- **THEN** the icon has the `kbq-error` class

#### Scenario: Slot attribute inside another component

- **WHEN** the illustration slot holds a consumer component whose own template renders `<i kbq-icon-item="kbq-bell_16" kbq-empty-state-icon>`, and `errorColor` is `true`
- **THEN** that icon has the `kbq-error` class

### Requirement: Error tint follows changes

The tint SHALL follow `errorColor` for as long as the empty state lives: setting it to `false` SHALL remove the `kbq-error` class the tint added, and an icon item that enters the illustration slot later, for example behind an `@if`, SHALL receive the current tint.

#### Scenario: Toggling the error color

- **WHEN** `errorColor` changes from `false` to `true` and back to `false`
- **THEN** the icon gains `kbq-error` and then loses it again

#### Scenario: Icon mounted after the error color is set

- **WHEN** `errorColor` is `true` and an icon item inside the illustration slot is rendered only afterwards
- **THEN** that icon has the `kbq-error` class

### Requirement: Error tint keeps the icon's own color

The tint SHALL add `kbq-error` on top of the icon's own `kbq-<color>` class without removing it or changing the icon's `color`. When the tint is lifted, the icon SHALL show the color it carries at that moment, including a color the consumer changed while the tint was on.

#### Scenario: Own color class stays

- **WHEN** an icon with `color="contrast"` is tinted
- **THEN** it has both `kbq-contrast` and `kbq-error`

#### Scenario: Color changed while tinted

- **WHEN** the icon is tinted, its `color` is changed from `contrast` to `theme`, and the tint is lifted
- **THEN** the icon has `kbq-theme` and neither `kbq-contrast` nor `kbq-error`

### Requirement: Icon with its own error color keeps it

An icon item whose own `color` is `error` SHALL keep the `kbq-error` class whether `errorColor` is `true`, `false`, or changes from `true` to `false`.

#### Scenario: Tint lifted from an icon that is red on its own

- **WHEN** an icon with `color="error"` is in an empty state whose `errorColor` changes from `true` to `false`
- **THEN** the icon still has the `kbq-error` class

#### Scenario: No tint at all

- **WHEN** an icon with `color="error"` is in an empty state whose `errorColor` is `false`
- **THEN** the icon has the `kbq-error` class

### Requirement: Only icon items are tinted

The error tint SHALL apply only to `kbq-icon-item` elements. Other content of the illustration slot, such as an image, a plain `kbq-icon` or an `svg`, MUST NOT be changed by `errorColor`.

#### Scenario: Image as the illustration

- **WHEN** the illustration slot holds an `<img>` and `errorColor` is `true`
- **THEN** the image is rendered unchanged, while the title and the text turn to the error color

#### Scenario: Plain icon as the illustration

- **WHEN** the illustration slot holds a `kbq-icon` that is not a `kbq-icon-item` and `errorColor` is `true`
- **THEN** the icon does not receive the `kbq-error` class from the empty state

### Requirement: Illustration marks the host

The host SHALL carry the `kbq-empty-state_has-icon` class while its content contains an element with the `kbq-empty-state-icon` attribute, and MUST NOT carry it otherwise. The class SHALL follow an illustration that is added or removed later.

#### Scenario: Illustration present

- **WHEN** the empty state contains an element with `kbq-empty-state-icon`
- **THEN** the host has `kbq-empty-state_has-icon`

#### Scenario: Illustration removed

- **WHEN** the illustration is rendered behind an `@if` whose condition becomes `false`
- **THEN** the host no longer has `kbq-empty-state_has-icon`

### Requirement: Optical compensation for a centred illustration

A centre-aligned empty state with an illustration SHALL get an extra bottom margin on the host that raises the composition: `--kbq-size-xxl` at `normal` and `--kbq-size-6xl` at `big`. The `compact` size and a top-aligned empty state MUST NOT get this margin.

#### Scenario: Centred with an illustration

- **WHEN** a `normal` empty state has an illustration and `alignTop` is `false`
- **THEN** the host has a bottom margin of `--kbq-size-xxl`

#### Scenario: Top aligned with an illustration

- **WHEN** an empty state has an illustration and `alignTop` is `true`
- **THEN** the host has no extra bottom margin

#### Scenario: Compact with an illustration

- **WHEN** a `compact` empty state has an illustration and `alignTop` is `false`
- **THEN** the host has no extra bottom margin

### Requirement: Title has no heading margin

The title slot SHALL have a margin of zero, apart from the bottom gap the size sets, so that a heading element such as `<h2 kbq-empty-state-title>` keeps the same spacing as a `div`.

#### Scenario: Heading as the title

- **WHEN** the title is written as `<h2 kbq-empty-state-title>`
- **THEN** the browser's default heading margins do not apply, and the gap to the text is the one the size sets

### Requirement: Content outside the slots is not rendered

The empty state has no default slot. Content that matches none of the four slot selectors at the top level of its content, by a slot attribute or `ngProjectAs`, and a control flow block with more than one root node, MUST NOT be rendered, and nothing SHALL be logged at runtime. For a slot element in such a block the Angular template type-check reports the `NG8011` warning. A control flow block with a single root element that carries a slot attribute SHALL be rendered in that slot.

#### Scenario: Element without a slot attribute

- **WHEN** the consumer puts a `<p>` without a slot attribute inside the empty state
- **THEN** the paragraph does not appear in the DOM, and nothing is logged

#### Scenario: Conditional slot with a single root

- **WHEN** an `@if` block contains only `<i kbq-empty-state-icon ...>` and its condition is `true`
- **THEN** the icon renders in the illustration slot

#### Scenario: Block with two roots

- **WHEN** an `@if` block contains both the illustration and the title elements
- **THEN** neither of them appears in the DOM, and nothing is logged at runtime
- **AND** the template type-check of the Angular compiler reports the `NG8011` warning for each of them at build time

#### Scenario: Element projected with ngProjectAs

- **WHEN** the consumer puts a `<p ngProjectAs="[kbq-empty-state-text]">` inside the empty state
- **THEN** the paragraph renders in the text slot

### Requirement: Slot directives outside an empty state

The slot directives SHALL work without an enclosing `kbq-empty-state`: each SHALL add its class to its element, the illustration directive MUST NOT throw, and no error tint SHALL be applied to an icon item in it.

#### Scenario: Illustration directive used on its own

- **WHEN** `<i kbq-icon-item="kbq-bell_16" kbq-empty-state-icon>` is rendered outside any empty state
- **THEN** the element has the `kbq-empty-state-icon` class, no error is thrown, and the icon keeps its own color

### Requirement: No role or ARIA attributes of its own

The empty state and its slot directives MUST NOT add a `role` or any `aria-*` attribute to their elements, and SHALL keep a `role` the consumer sets on the host, such as `role="status"` or `role="alert"`.

#### Scenario: Default markup

- **WHEN** an empty state is rendered without consumer attributes
- **THEN** neither the empty state nor its slot directives set a `role` or an `aria-*` attribute on the host or the slot elements

#### Scenario: Consumer announces the empty state

- **WHEN** the consumer writes `<kbq-empty-state role="status">`
- **THEN** the host keeps `role="status"`

### Requirement: Accessible with a heading title

An empty state whose title is a heading at the level the page calls for SHALL pass the axe checks that apply without rendering.

#### Scenario: Under a page heading

- **WHEN** an empty state with an illustration, an `<h2 kbq-empty-state-title>` and a text is placed under an `<h1>` page heading
- **THEN** axe reports no violations

### Requirement: NgModule and standalone use

`KbqEmptyStateModule` SHALL import and export `KbqEmptyState`, `KbqEmptyStateIcon`, `KbqEmptyStateTitle`, `KbqEmptyStateText` and `KbqEmptyStateActions`. Each of them SHALL also be usable as a standalone import.

#### Scenario: NgModule consumer

- **WHEN** a component imports `KbqEmptyStateModule`
- **THEN** `kbq-empty-state` and all four slot attributes are recognised in its template

#### Scenario: Standalone consumer

- **WHEN** a component imports `KbqEmptyState` and only the slot directives it uses
- **THEN** the empty state renders those slots

### Requirement: Template reference name

The component SHALL be exported to templates as `kbqEmptyState`.

#### Scenario: Template reference

- **WHEN** the template declares `<kbq-empty-state #state="kbqEmptyState" size="big">`
- **THEN** `state.size()` reads `big` in that template
