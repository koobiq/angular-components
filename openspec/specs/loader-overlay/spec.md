# loader-overlay Specification

## Purpose

Describes what `kbq-loader-overlay` from `@koobiq/components/loader-overlay` guarantees to consumers: how it covers its parent element while an operation runs, which indicator, text and caption it shows, how projected parts replace the built-in ones, and how `surface` and `size` change it.

## Requirements

### Requirement: Default indicator

Unless an element marked with `kbq-loader-overlay-indicator` is projected, the overlay SHALL render one `kbq-progress-spinner` in indeterminate mode as its indicator, above the text and the caption.

#### Scenario: Overlay without content

- **WHEN** `<kbq-loader-overlay />` is rendered with no inputs and no content
- **THEN** it shows one `kbq-progress-spinner`
- **AND** the spinner has the class `kbq-progress-spinner_indeterminate`

### Requirement: Text input

A non-empty `text` SHALL be rendered under the indicator in an element with the class `kbq-loader-overlay-text`, and the rendered text SHALL follow later changes of the binding. An empty string or `undefined` MUST NOT render a text element.

#### Scenario: Text is bound

- **WHEN** `text` is "Создание отчета"
- **THEN** an element with the class `kbq-loader-overlay-text` reads "Создание отчета"

#### Scenario: Text arrives after the first render

- **WHEN** the overlay is rendered with `text` set to `undefined`
- **AND** the binding then changes to "Загрузка"
- **THEN** a text element reading "Загрузка" appears

#### Scenario: Empty text

- **WHEN** `text` is an empty string
- **THEN** no element with the class `kbq-loader-overlay-text` is rendered

### Requirement: Caption input

A non-empty `caption` SHALL be rendered under the text in an element with the class `kbq-loader-overlay-caption`. An empty string or `undefined` MUST NOT render a caption element.

#### Scenario: Caption is bound

- **WHEN** `caption` is "18,7 МБ из 25 МБ — осталось 2 мин"
- **THEN** an element with the class `kbq-loader-overlay-caption` reads that string

#### Scenario: Caption without text

- **WHEN** only `caption` is bound
- **THEN** the overlay shows the indicator and the caption, and no text element

### Requirement: No built-in text

`text` and `caption` SHALL default to `undefined`, and the overlay MUST NOT render any text of its own: with neither bound nor projected, it shows only the indicator. The overlay has no locale strings.

#### Scenario: Unbound text and caption

- **WHEN** `<kbq-loader-overlay />` is rendered
- **THEN** `text()` and `caption()` return `undefined`
- **AND** no element with the class `kbq-loader-overlay-text` or `kbq-loader-overlay-caption` is rendered

### Requirement: Fixed order of the parts

The overlay SHALL lay out its parts in one column in a fixed order — indicator, then text, then caption — whatever order projected elements are written in.

#### Scenario: Caption written before the text

- **WHEN** a consumer projects an element marked `kbq-loader-overlay-caption` before one marked `kbq-loader-overlay-text`
- **THEN** the text is rendered above the caption

### Requirement: Empty state host class

The host SHALL carry the class `kbq-loader-overlay_empty` while the overlay has no text and no caption, from the inputs or projected, and SHALL drop it as soon as either appears. A projected indicator MUST NOT count as content.

#### Scenario: Indicator only

- **WHEN** the overlay has no text and no caption
- **THEN** its host has the class `kbq-loader-overlay_empty`

#### Scenario: Text arrives

- **WHEN** an empty overlay's `text` binding changes to a non-empty string
- **THEN** the class `kbq-loader-overlay_empty` is removed

#### Scenario: Projected caption only

- **WHEN** the only content is an element marked `kbq-loader-overlay-caption`
- **THEN** the host does not have the class `kbq-loader-overlay_empty`

### Requirement: Overlay covers its parent element

The overlay SHALL be absolutely positioned over the whole padding box of its parent element, stacked above the parent's in-flow content with `z-index: 10`, with its parts centered horizontally and vertically. It SHALL inherit the parent's `border-radius` and `corner-shape`, so it follows rounded corners.

#### Scenario: Overlay in a block

- **WHEN** an overlay is rendered as a child of a 170 px square block with text in it
- **THEN** the overlay covers the whole block and its indicator is in the middle of it

#### Scenario: Rounded container

- **WHEN** the parent element has a `border-radius`
- **THEN** the overlay has the same rounded corners

### Requirement: Parent element marker class

When the overlay initializes, it SHALL add the class `kbq-loader-overlay_parent` to its parent element, which gives the parent `position: relative`. When the overlay is destroyed, it SHALL remove that class from the parent. No other ancestor is changed.

#### Scenario: Overlay added

- **WHEN** an overlay is rendered inside a `div`
- **THEN** the `div` has the class `kbq-loader-overlay_parent`

#### Scenario: Overlay removed

- **WHEN** the `@if` that renders the overlay becomes false
- **THEN** the parent no longer has the class `kbq-loader-overlay_parent`

### Requirement: Visible while rendered

The overlay SHALL be shown for as long as it is in the DOM and MUST NOT offer an input that hides it: consumers show and hide it by adding and removing the element, for example with `@if`. It has no enter or leave animation of its own.

#### Scenario: Operation finishes

- **WHEN** the condition of the `@if` around the overlay becomes false
- **THEN** the overlay disappears at once

### Requirement: Pointer input over the covered area

Pointer input over the area the overlay covers SHALL land on the overlay, so clicks and hover MUST NOT reach the parent's in-flow content beneath it.

#### Scenario: Clicking a covered button

- **WHEN** a button in the parent is covered by the overlay and the user clicks where the button is
- **THEN** the button is not activated

### Requirement: Keyboard focus is not blocked

The overlay MUST NOT move focus, trap focus or make the covered content inert. Focusable elements under it SHALL stay in the tab order, and an element that had focus when the overlay appeared SHALL keep it.

#### Scenario: Tabbing into covered content

- **WHEN** an overlay covers a form and the user presses Tab
- **THEN** focus moves to the inputs of the covered form as it would without the overlay

### Requirement: Surface variants

`surface` SHALL select the background. `solid` SHALL give an opaque background and the host class `kbq-loader-overlay_filled`. `bg`, `bg-secondary`, `bg-tertiary` and `card` SHALL give a translucent tint of the matching surface color and the host class `kbq-loader-overlay_transparent`, plus `kbq-loader-overlay_surface_bg`, `kbq-loader-overlay_surface_bg-secondary`, `kbq-loader-overlay_surface_bg-tertiary` or `kbq-loader-overlay_card` respectively.

#### Scenario: Solid surface

- **WHEN** `surface` is `solid`
- **THEN** the host has the class `kbq-loader-overlay_filled`
- **AND** it has neither `kbq-loader-overlay_transparent` nor a surface class

#### Scenario: Secondary background surface

- **WHEN** `surface` is `bg-secondary`
- **THEN** the host has the classes `kbq-loader-overlay_transparent` and `kbq-loader-overlay_surface_bg-secondary`
- **AND** it does not have `kbq-loader-overlay_filled`

#### Scenario: Card surface

- **WHEN** `surface` is `card`
- **THEN** the host has the classes `kbq-loader-overlay_transparent` and `kbq-loader-overlay_card`

### Requirement: Default surface

When `surface` is not bound, or is bound to `null` or `undefined`, and the deprecated `transparent` and `card` inputs keep their defaults, the overlay SHALL use the `bg` surface.

#### Scenario: Nothing bound

- **WHEN** an overlay is rendered with only `text` and `caption`
- **THEN** its host classes are exactly `kbq-loader-overlay`, `kbq-loader-overlay_big`, `kbq-loader-overlay_transparent` and `kbq-loader-overlay_surface_bg`

#### Scenario: Surface bound to null

- **WHEN** `surface` is bound to `null`
- **THEN** the overlay behaves as if `surface` were not bound

### Requirement: Surface takes precedence over the deprecated inputs

When `surface` is set, it SHALL alone decide the surface and its host classes, whatever the deprecated `transparent` and `card` inputs are set to.

#### Scenario: Solid surface with the card input set

- **WHEN** `surface` is `solid` and `card` and `transparent` are `true`
- **THEN** the host has the class `kbq-loader-overlay_filled`
- **AND** it has neither `kbq-loader-overlay_card` nor `kbq-loader-overlay_transparent`

#### Scenario: Translucent surface with transparent set to false

- **WHEN** `surface` is `bg-secondary` and `transparent` is `false`
- **THEN** the host has the class `kbq-loader-overlay_transparent` and not `kbq-loader-overlay_filled`

### Requirement: Projected indicator

An element marked with `kbq-loader-overlay-indicator`, whose marker directive is imported, and placed at the top level of the overlay's content SHALL be rendered in place of the default spinner, so a consumer can show a spinner of another size or color, or another indicator. Such an element anywhere in the content MUST remove the default spinner, but one nested in an unmarked wrapper is not projected, so no indicator is shown.

#### Scenario: Custom spinner

- **WHEN** a `kbq-progress-spinner` with the `kbq-loader-overlay-indicator` attribute and the error color is projected
- **THEN** that spinner is shown with the class `kbq-error`
- **AND** the default spinner is not rendered

#### Scenario: Indicator nested in a wrapper

- **WHEN** the content is a plain `div` that wraps an element marked `kbq-loader-overlay-indicator`
- **THEN** neither that element nor the default spinner is rendered

### Requirement: Projected text

An element marked with `kbq-loader-overlay-text`, whose marker directive is imported, and placed at the top level of the overlay's content SHALL be rendered in place of the `text` input, which is then ignored even when it is bound. Such an element anywhere in the content MUST make the overlay ignore `text`, but one nested in an unmarked wrapper is not projected, so no text is shown.

#### Scenario: Projected text only

- **WHEN** `<div kbq-loader-overlay-text>Создание отчета</div>` is projected
- **THEN** the overlay shows "Создание отчета" in that element

#### Scenario: Projected text and a bound text

- **WHEN** a text element is projected and `text` is also bound
- **THEN** only the projected element is rendered

#### Scenario: Text nested in a wrapper

- **WHEN** `text` is bound and the content is a plain `div` that wraps an element marked `kbq-loader-overlay-text`
- **THEN** no text is rendered, neither the bound string nor the marked element

### Requirement: Projected caption

An element marked with `kbq-loader-overlay-caption`, whose marker directive is imported, and placed at the top level of the overlay's content SHALL be rendered in place of the `caption` input, which is then ignored even when it is bound. Such an element anywhere in the content MUST make the overlay ignore `caption`, but one nested in an unmarked wrapper is not projected, so no caption is shown.

#### Scenario: Projected caption only

- **WHEN** `<div kbq-loader-overlay-caption>18,7 МБ из 25 МБ — осталось 2 мин</div>` is projected
- **THEN** the overlay shows that string in that element

#### Scenario: Projected caption and a bound caption

- **WHEN** a caption element is projected and `caption` is also bound
- **THEN** only the projected element is rendered

#### Scenario: Caption nested in a wrapper

- **WHEN** `caption` is bound and the content is a plain `div` that wraps an element marked `kbq-loader-overlay-caption`
- **THEN** no caption is rendered, neither the bound string nor the marked element

### Requirement: Marker classes

The marker directives SHALL add the classes `kbq-loader-overlay-indicator`, `kbq-loader-overlay-text` and `kbq-loader-overlay-caption` to their elements, so projected text and captions get the same alignment, type and color as the built-in ones.

#### Scenario: Projected text element

- **WHEN** a `div` with the `kbq-loader-overlay-text` attribute is projected
- **THEN** the `div` has the class `kbq-loader-overlay-text`

### Requirement: Only marked content is rendered

The overlay SHALL render only the top-level nodes of its content that match one of the three marker selectors, with what is inside them: an element carrying a marker attribute, or a node whose `ngProjectAs` names one. It renders the nodes matching a marker only while its content holds an element with the matching marker directive. Any other content placed inside `kbq-loader-overlay` MUST NOT be rendered.

#### Scenario: Unmarked content

- **WHEN** a plain `<span>` is placed inside `kbq-loader-overlay`
- **THEN** the span is not rendered

#### Scenario: Content projected with ngProjectAs

- **WHEN** a `span` with `ngProjectAs="[kbq-loader-overlay-caption]"` is placed next to an element marked `kbq-loader-overlay-caption`
- **THEN** the span is rendered in the caption's place as well

### Requirement: Size

`size` SHALL accept `compact`, `normal` and `big` and default to `big`. The host SHALL carry exactly one matching class — `kbq-loader-overlay_compact`, `kbq-loader-overlay_normal` or `kbq-loader-overlay_big` — and SHALL swap it when the binding changes. The size scales the spacing and the type of the text and caption.

#### Scenario: Default size

- **WHEN** `size` is not bound
- **THEN** the host has the class `kbq-loader-overlay_big`

#### Scenario: Changing the size

- **WHEN** `size` changes from `big` to `normal`
- **THEN** the host has the class `kbq-loader-overlay_normal` and no longer has `kbq-loader-overlay_big`

### Requirement: Default indicator follows the size

The default spinner SHALL be the compact spinner when `size` is `compact` and the big spinner when `size` is `normal` or `big`, because the progress spinner has no normal size. A projected indicator MUST keep the size the consumer gave it.

#### Scenario: Normal overlay

- **WHEN** `size` is `normal`
- **THEN** the default spinner has the class `kbq-progress-spinner_big`

#### Scenario: Compact overlay

- **WHEN** `size` is `compact`
- **THEN** the default spinner does not have the class `kbq-progress-spinner_big`

### Requirement: No accessibility semantics of its own

The overlay MUST NOT add a role, an accessible name, `aria-busy` or a live region to itself, to its parent or to its default spinner. The text and the caption SHALL be plain text in the DOM, read in document order, and appearing or changing text MUST NOT be announced by the overlay itself.

#### Scenario: Rendered overlay

- **WHEN** an overlay with text is rendered over a block
- **THEN** neither the overlay, its spinner nor the block has a `role`, `aria-busy` or `aria-live` attribute set by the overlay

### Requirement: NgModule

`KbqLoaderOverlayModule` SHALL export `KbqLoaderOverlay`, `KbqLoaderOverlayIndicator`, `KbqLoaderOverlayText` and `KbqLoaderOverlayCaption`. Each of them SHALL also be usable as a standalone import.

#### Scenario: Importing the module

- **WHEN** a component imports `KbqLoaderOverlayModule`
- **THEN** its template can use `kbq-loader-overlay` and the three marker attributes
