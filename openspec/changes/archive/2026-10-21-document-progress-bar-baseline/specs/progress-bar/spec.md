# Spec Delta

## Purpose

Describes what `kbq-progress-bar` from `@koobiq/components/progress-bar` guarantees to consumers: how `value`, `mode` and `color` reach the bar, how a projected label and caption are placed and linked, how the bar reports its progress and its name to assistive technology, and how it moves with animations on and off.

## ADDED Requirements

### Requirement: Progress bar element and module

`<kbq-progress-bar>` SHALL render a horizontal track with a filled part and SHALL always carry the `kbq-progress-bar` class. The component and the `[kbq-progress-bar-text]` and `[kbq-progress-bar-caption]` directives SHALL be standalone, and `KbqProgressBarModule` SHALL re-export all three for NgModule consumers.

#### Scenario: Importing the module

- **WHEN** a template imports `KbqProgressBarModule`
- **THEN** `kbq-progress-bar`, `[kbq-progress-bar-text]` and `[kbq-progress-bar-caption]` are all available in it

#### Scenario: Host class

- **WHEN** a bar is rendered with any inputs
- **THEN** its host element has the `kbq-progress-bar` class

### Requirement: Bar without bindings

A bar rendered without any binding SHALL be determinate, SHALL have an empty fill (`0%` wide) and `aria-valuenow="0"`, SHALL carry the `kbq-theme` color class and SHALL get a generated id.

#### Scenario: Bare bar

- **WHEN** a consumer renders `<kbq-progress-bar />`
- **THEN** the bar has the `kbq-progress-bar_determinate` and `kbq-theme` classes
- **AND** its fill is `0%` wide and its `aria-valuenow` is `0`

### Requirement: Value sets the fill

In determinate mode the filled part SHALL be `value` percent of the width of the track, and SHALL follow every new value. `value` defaults to `0`.

#### Scenario: Forty percent

- **WHEN** a determinate bar has `value` 40
- **THEN** its fill is `40%` wide

### Requirement: Value is clamped to the range

A `value` below `0` SHALL be treated as `0` and a `value` above `100` as `100`, both for the width of the fill and for `aria-valuenow`.

#### Scenario: Value below the range

- **WHEN** `value` is -50
- **THEN** the fill is `0%` wide

#### Scenario: Value above the range

- **WHEN** `value` is 140
- **THEN** the fill is `100%` wide and `aria-valuenow` is `100`

### Requirement: Non-finite value renders as zero

A `value` that is not a finite number (`NaN`, `Infinity` or `-Infinity`) SHALL be treated as `0`, both for the width of the fill and for `aria-valuenow`, and SHALL replace the width of the previous value instead of leaving it in place.

#### Scenario: NaN after a valid value

- **WHEN** `value` changes from 40 to `NaN`
- **THEN** the fill is `0%` wide

#### Scenario: Infinity

- **WHEN** `value` is `Infinity`
- **THEN** the fill is `0%` wide, not `100%`

### Requirement: Mode classes

The host SHALL carry exactly one of the `kbq-progress-bar_determinate` and `kbq-progress-bar_indeterminate` classes, matching the rendered mode. `mode` defaults to `'determinate'`.

#### Scenario: Determinate

- **WHEN** `mode` is `'determinate'`
- **THEN** the host has `kbq-progress-bar_determinate` and not `kbq-progress-bar_indeterminate`

#### Scenario: Indeterminate

- **WHEN** `mode` is `'indeterminate'`
- **THEN** the host has `kbq-progress-bar_indeterminate` and not `kbq-progress-bar_determinate`

### Requirement: Any other mode is determinate

Any `mode` other than `'indeterminate'`, including an explicitly bound `undefined`, SHALL render a determinate bar: the determinate class, a fill that follows `value` and the range attributes.

#### Scenario: Mode bound to undefined

- **WHEN** `mode` is bound to `undefined`
- **THEN** the bar renders the determinate fill and has the `kbq-progress-bar_determinate` class and not `kbq-progress-bar_indeterminate`

### Requirement: Indeterminate fill ignores the value

In indeterminate mode the filled part SHALL NOT follow `value`. It SHALL be a segment a quarter of the track wide before any motion is applied, so an indeterminate bar never looks like a complete one.

#### Scenario: Indeterminate next to a complete bar

- **WHEN** an indeterminate bar is shown without motion next to a determinate bar with `value` 100
- **THEN** the complete bar's fill covers the whole track
- **AND** the indeterminate fill is wider than zero and narrower than half of the track

#### Scenario: Value changes in indeterminate mode

- **WHEN** the `value` of an indeterminate bar changes from 0 to 100
- **THEN** the fill keeps its width

### Requirement: Indeterminate fill sweeps across the track

With motion on, the indeterminate segment SHALL sweep across the track from left to right and repeat. It SHALL start each iteration at the left edge of the track and leave past its right edge, with no part of the iteration in which it is parked outside the track.

#### Scenario: One iteration of the sweep

- **WHEN** an indeterminate bar animates with motion on
- **THEN** at the start of an iteration the right edge of the segment is at or past the left edge of the track
- **AND** halfway through the segment overlaps the track
- **AND** by the end of the iteration the right edge of the segment is past the right edge of the track

### Requirement: Color class

`color` SHALL add a `kbq-<color>` class to the host and SHALL replace the class of the previous color when it changes. The default color is `theme`. The colors `contrast`, `contrast-fade` and `error` SHALL change the color of the fill only; the track keeps the same color in every variant.

#### Scenario: Bound color

- **WHEN** `color` is `'error'`
- **THEN** the host has the `kbq-error` class and not `kbq-theme`

#### Scenario: Color variants side by side

- **WHEN** bars with `contrast`, `contrast-fade` and `error` are rendered at the same value
- **THEN** their fills differ in color and their tracks have the same color

### Requirement: Empty color falls back to the theme color

An empty string, `null` or `undefined` bound to `color` SHALL fall back to the `theme` color, so the bar keeps the `kbq-theme` class and stays visible.

#### Scenario: Color reset to null

- **WHEN** `color` changes from `'error'` to `null`
- **THEN** the host has the `kbq-theme` class

#### Scenario: Empty string

- **WHEN** `color` is bound to `''`
- **THEN** the bar is painted in the theme color

### Requirement: Host id

The host SHALL carry the `id` input as its `id` attribute and, without one, a generated id of the form `kbq-progress-bar-<n>`. No element rendered by the bar itself SHALL repeat that id.

#### Scenario: Supplied id

- **WHEN** `id` is `'foo'`
- **THEN** the host has `id="foo"` and it is the only element in the document with that id

#### Scenario: Generated id

- **WHEN** no `id` is bound
- **THEN** the host id matches `kbq-progress-bar-<n>`

### Requirement: Progressbar role

The host SHALL have `role="progressbar"` in both modes.

#### Scenario: Role of a bare bar

- **WHEN** a bar is rendered
- **THEN** its host has `role="progressbar"`

### Requirement: Display-only bar

The bar SHALL be display-only: it MUST NOT be focusable or take a place in the tab order, and it SHALL have no outputs and no keyboard or pointer handling of its own.

#### Scenario: Tabbing past a bar

- **WHEN** the user tabs through a page that contains a bar
- **THEN** focus never lands on the bar

### Requirement: Range attributes in determinate mode

In determinate mode the host SHALL have `aria-valuemin="0"`, `aria-valuemax="100"` and `aria-valuenow` set to the clamped value. A value of `0` SHALL be written out, not omitted.

#### Scenario: Clamped value

- **WHEN** a determinate bar has `value` 140
- **THEN** it has `aria-valuenow="100"`, `aria-valuemin="0"` and `aria-valuemax="100"`

#### Scenario: Zero

- **WHEN** a bar has no `value` binding
- **THEN** it has `aria-valuenow="0"`

### Requirement: No range in indeterminate mode

In indeterminate mode the host MUST NOT have `aria-valuenow`, `aria-valuemin` or `aria-valuemax`, so assistive technology reports the progress as unknown.

#### Scenario: Switching to indeterminate

- **WHEN** `mode` is `'indeterminate'`
- **THEN** the host has none of `aria-valuenow`, `aria-valuemin` and `aria-valuemax`

### Requirement: Accessible name from aria-label

A non-empty `aria-label` input SHALL be written to the host as `aria-label` and SHALL take precedence over a projected `[kbq-progress-bar-text]`: the host then MUST NOT have `aria-labelledby`.

#### Scenario: Bar without a projected label

- **WHEN** a bar without projected text has `aria-label` "Uploading"
- **THEN** its host has `aria-label="Uploading"`

#### Scenario: aria-label and a projected label

- **WHEN** a bar has a projected `[kbq-progress-bar-text]` and `aria-label` "Uploading"
- **THEN** its host has `aria-label="Uploading"` and no `aria-labelledby`

### Requirement: Accessible name from the projected label

Without an `aria-label`, a bar with a projected `[kbq-progress-bar-text]` SHALL be named by it: the host SHALL have `aria-labelledby` set to the id of that element and no `aria-label`. The element SHALL keep a supplied `id` or get a generated one of the form `kbq-progress-bar-text-<n>`, unique per element.

#### Scenario: Generated label id

- **WHEN** a bar has a projected `[kbq-progress-bar-text]` without an id
- **THEN** that element gets an id matching `kbq-progress-bar-text-<n>`
- **AND** the host's `aria-labelledby` is that id and the host has no `aria-label`

#### Scenario: Supplied label id

- **WHEN** the projected `[kbq-progress-bar-text]` has `id="upload-label"`
- **THEN** the host's `aria-labelledby` is `upload-label`

#### Scenario: Two bars on one page

- **WHEN** two bars each project their own `[kbq-progress-bar-text]`
- **THEN** the two labels have different ids and each bar's `aria-labelledby` points at its own label

### Requirement: Fallback accessible name

A bar with neither an `aria-label` nor a projected `[kbq-progress-bar-text]` SHALL get the `a11y.progressBar` string of the locale as its `aria-label` and SHALL have no `aria-labelledby`. A projected caption alone MUST NOT name the bar.

#### Scenario: Unlabelled bar

- **WHEN** a bar has no `aria-label` and no projected text
- **THEN** its `aria-label` is the `a11y.progressBar` string of the locale and it has no `aria-labelledby`

#### Scenario: Caption without a label

- **WHEN** a bar projects only a `[kbq-progress-bar-caption]`
- **THEN** its `aria-label` is the `a11y.progressBar` string of the locale and it has no `aria-labelledby`

### Requirement: Caption describes the bar

A bar with a projected `[kbq-progress-bar-caption]` SHALL have `aria-describedby` set to the id of that element, which SHALL keep a supplied `id` or get a generated one of the form `kbq-progress-bar-caption-<n>`. Without a caption the host MUST NOT have `aria-describedby`.

#### Scenario: Projected caption

- **WHEN** a bar projects a `[kbq-progress-bar-caption]` without an id
- **THEN** that element gets an id matching `kbq-progress-bar-caption-<n>` and the host's `aria-describedby` is that id

#### Scenario: Label without a caption

- **WHEN** a bar projects only a `[kbq-progress-bar-text]`
- **THEN** its host has no `aria-describedby`

### Requirement: Placement of projected content

A projected `[kbq-progress-bar-text]` SHALL be rendered above the track with the `kbq-progress-bar-text` class, and a projected `[kbq-progress-bar-caption]` below it with the `kbq-progress-bar-caption` class. Both are optional. Projected content that matches neither selector MUST NOT be rendered.

#### Scenario: Label and caption together

- **WHEN** a bar projects a `[kbq-progress-bar-text]` and a `[kbq-progress-bar-caption]`
- **THEN** the label is rendered above the track and the caption below it

#### Scenario: Other projected content

- **WHEN** a bar projects a `<span>` without either attribute
- **THEN** the span is not rendered

### Requirement: Accessibility audit

A bar with a projected label and caption SHALL have no axe-core violations in determinate and in indeterminate mode, including when another element references the bar's id through an ARIA attribute.

#### Scenario: Labelled determinate bar

- **WHEN** axe-core audits a determinate bar with a projected label and caption next to a button whose `aria-controls` is the bar's id
- **THEN** it reports no violations

#### Scenario: Labelled indeterminate bar

- **WHEN** axe-core audits an indeterminate bar with a projected label and caption
- **THEN** it reports no violations

### Requirement: Animated value change

With motion on, a new `value` of a determinate bar SHALL move the fill to its new width through a short width transition (0.3 s) instead of jumping.

#### Scenario: Value change with motion on

- **WHEN** motion is on and the `value` of a determinate bar changes from 20 to 60
- **THEN** the fill grows to `60%` through a transition

### Requirement: Motion turned off

Motion SHALL be off for a bar created while `KBQ_ANIMATIONS_CONFIG` sets `animationsDisabled: true`, `provideNoopAnimations()` is in effect or the user prefers reduced motion, and also whenever `prefers-reduced-motion: reduce` matches later. With motion off, a new `value` SHALL take effect at once, without a transition.

#### Scenario: Animations disabled by configuration

- **WHEN** a bar is created with `KBQ_ANIMATIONS_CONFIG` set to `{ animationsDisabled: true }` and its `value` changes
- **THEN** the fill takes the new width without a transition

#### Scenario: Reduced motion preference

- **WHEN** the user prefers reduced motion and the `value` of a determinate bar changes
- **THEN** the fill takes the new width without a transition

### Requirement: Indeterminate fill pulses without motion

With motion off, the indeterminate segment SHALL stay at the start of the track and pulse its opacity in place instead of sweeping, so the bar still reads as running.

#### Scenario: Indeterminate bar with animations disabled

- **WHEN** an indeterminate bar is created with `KBQ_ANIMATIONS_CONFIG` set to `{ animationsDisabled: true }`
- **THEN** its fill stays in place at a quarter of the track and fades in and out repeatedly

### Requirement: Fallback name follows the locale

The fallback accessible name SHALL be the `a11y.progressBar` string of the active locale and SHALL follow a locale change while the locale service is provided (for example through `KbqLocaleServiceModule`). Without a locale service it SHALL be the `ru-RU` string. The `en-US` string is "Progress".

#### Scenario: Switching the locale

- **WHEN** the application registers and activates a locale whose `a11y.progressBar` is "Loading"
- **THEN** an unlabelled bar's `aria-label` becomes "Loading"

#### Scenario: English locale

- **WHEN** the active locale is `en-US`
- **THEN** an unlabelled bar's `aria-label` is "Progress"

### Requirement: Overriding the fallback name

`kbqA11yLocaleConfigurationProvider({ progressBar })` in an injector above the bar, and `[kbqLocaleOverrides]` with an `a11y.progressBar` key on an ancestor element, SHALL replace the fallback accessible name for the bars in their scope, while every other key keeps following the active locale.

#### Scenario: Override through a provider

- **WHEN** a component provides `kbqA11yLocaleConfigurationProvider({ progressBar: 'Upload progress' })` and renders an unlabelled bar
- **THEN** the bar's `aria-label` is "Upload progress"

#### Scenario: Override through an ancestor element

- **WHEN** an unlabelled bar sits inside an element with `[kbqLocaleOverrides]="{ a11y: { progressBar: 'Upload progress' } }"`
- **THEN** the bar's `aria-label` is "Upload progress"
