# Spec Delta

## Purpose

Describes what `kbq-flag` from `@koobiq/components/flag` guarantees to consumers: how flag markup is passed to it, the box the flag is sized and cropped to, the shape, shadow and placeholder decorations, and how the flag is exposed to assistive technology.

## ADDED Requirements

### Requirement: Flag element

The flag SHALL be the `kbq-flag` element, available as the standalone `KbqFlag` and through `KbqFlagModule`, with the template reference name `kbqFlag`. Its host SHALL always carry the `kbq-flag` class. The component MUST NOT ship flag images of its own: it renders only the markup the consumer passes to it.

#### Scenario: Rendering a flag

- **WHEN** a template renders `<kbq-flag>` with an image inside
- **THEN** the host element has the `kbq-flag` class

#### Scenario: NgModule consumer

- **WHEN** an NgModule imports `KbqFlagModule` and its template uses `<kbq-flag #flag="kbqFlag">`
- **THEN** the flag renders and `flag` refers to the component instance

### Requirement: Projected flag markup

Content placed inside `<kbq-flag>`, such as an `<img>` or an inline `<svg>` written in the template, SHALL be rendered inside the flag as it is given, without sanitization or any change to its attributes.

#### Scenario: Projected image

- **WHEN** the consumer writes `<kbq-flag><img src="AL.svg" alt="" /></kbq-flag>`
- **THEN** the image is rendered inside the flag

#### Scenario: Projected inline SVG

- **WHEN** the consumer writes an inline `<svg viewBox="0 0 5 3">` inside `<kbq-flag>`
- **THEN** the SVG is rendered inside the flag without being sanitized

### Requirement: Flag markup from the svg input

The `svg` input SHALL render its markup into an element of its own with the class `kbq-flag__svg`, placed after the projected content. Setting it MUST NOT remove or replace the projected content: both are rendered.

#### Scenario: Trusted SVG string

- **WHEN** `svg` is bound to `DomSanitizer.bypassSecurityTrustHtml('<svg>…</svg>')`
- **THEN** the flag contains a `.kbq-flag__svg` element with that `<svg>` inside

#### Scenario: Projected content and the svg input together

- **WHEN** the flag has a projected `<img>` and `svg` is set as well
- **THEN** both the image and the SVG from the input are rendered

### Requirement: No svg slot without markup

While `svg` is unset, `undefined` or an empty string, the flag SHALL NOT render the `kbq-flag__svg` element.

#### Scenario: Input unset

- **WHEN** a flag is rendered without the `svg` input
- **THEN** it contains no `.kbq-flag__svg` element

#### Scenario: Input cleared

- **WHEN** `svg` changes from a trusted value to `undefined`
- **THEN** the `.kbq-flag__svg` element and the SVG inside it are removed

### Requirement: Sanitization of the svg input

A plain string bound to `svg` SHALL pass through Angular's HTML sanitizer before it is rendered. The sanitizer does not allow `<svg>`, so an SVG passed as a plain string is stripped and no flag image appears. A value marked trusted with `DomSanitizer.bypassSecurityTrustHtml` SHALL be rendered as given.

#### Scenario: SVG as a plain string

- **WHEN** `svg` is bound to the plain string `'<svg viewBox="0 0 3 2"><rect width="3" height="2" /></svg>'`
- **THEN** no `<svg>` element is rendered inside the flag

#### Scenario: SVG marked trusted

- **WHEN** the same markup is passed through `bypassSecurityTrustHtml`
- **THEN** the `<svg>` element is rendered inside the flag

### Requirement: Size follows the text

The flag SHALL render as an inline block, vertically centred on the line, whose height is `1em` of its own font size and whose width follows from its proportions, so a default rectangle is 1.5 em wide. Changing the flag's `font-size` or setting its `height` SHALL resize it with its proportions kept.

#### Scenario: Flag in body text

- **WHEN** a rectangle flag without `aspectRatio` sits in text whose font size is 16 px
- **THEN** the flag is 16 px high and 24 px wide and is centred on the line

#### Scenario: Explicit height

- **WHEN** the consumer sets `height: 12px` on a rectangle flag
- **THEN** the flag is 18 px wide

### Requirement: Flag cropped to its box

Whatever the proportions of the box, the flag SHALL fill the box completely, centred and without distortion, and anything outside the box SHALL be clipped. A projected `<img>`, a projected inline `<svg>` and markup passed through `svg` SHALL be cropped the same way, never letterboxed.

#### Scenario: Source wider than the box

- **WHEN** a flag drawn at 11:8 is shown in a square flag
- **THEN** it fills the square, centred, and its left and right edges are cut off

#### Scenario: Image and inline SVG crop alike

- **WHEN** the same flag is passed once as a projected `<img>` and once through `svg` into two square flags
- **THEN** both flags show the same crop

### Requirement: Shape modifier classes

The `shape` input SHALL accept `rectangle`, `square` and `circle`, defaulting to `rectangle`. The host SHALL carry `kbq-flag_square` for `square` and `kbq-flag_circle` for `circle`; `rectangle` SHALL add neither class.

#### Scenario: Default shape

- **WHEN** a flag is rendered without `shape`
- **THEN** the host has neither `kbq-flag_square` nor `kbq-flag_circle`

#### Scenario: Square

- **WHEN** `shape` is `square`
- **THEN** the host has `kbq-flag_square` and not `kbq-flag_circle`

#### Scenario: Circle

- **WHEN** `shape` is `circle`
- **THEN** the host has `kbq-flag_circle` and not `kbq-flag_square`

### Requirement: Shape sets the proportions

Without `aspectRatio` and without a consumer override, a `rectangle` flag SHALL have 3:2 proportions, and `square` and `circle` flags SHALL have 1:1 proportions. A `circle` flag SHALL be clipped to a circle; `rectangle` and `square` flags SHALL have square corners by default.

#### Scenario: Square flag

- **WHEN** a `square` flag is rendered at a font size of 48 px
- **THEN** it is 48 px wide and 48 px high with square corners

#### Scenario: Circle flag

- **WHEN** a `circle` flag is rendered
- **THEN** the flag is clipped to a circle

### Requirement: Aspect ratio input

The `aspectRatio` input SHALL accept a CSS `aspect-ratio` value (such as `4 / 3` or `1.5`) and set it as the `--kbq-flag-aspect-ratio` custom property in the host's inline style. It SHALL outrank both the proportions the shape implies and any stylesheet rule. While it is unset, and after it is cleared, the host SHALL have no inline declaration of that property.

#### Scenario: Custom ratio

- **WHEN** `aspectRatio` is `4 / 3`
- **THEN** the host's inline style sets `--kbq-flag-aspect-ratio` to `4 / 3`

#### Scenario: Ratio on a square flag

- **WHEN** `shape` is `square` and `aspectRatio` is `4 / 3`
- **THEN** the flag has 4:3 proportions and is no longer square

#### Scenario: Clearing the ratio

- **WHEN** `aspectRatio` changes from `4 / 3` to `undefined`
- **THEN** the host's inline style no longer declares `--kbq-flag-aspect-ratio`

### Requirement: Proportions from a stylesheet

The `--kbq-flag-aspect-ratio` custom property SHALL be declared by the component at zero specificity, so that a plain class rule of the consumer that redefines it SHALL set the proportions of every flag it matches, for any shape, without `!important`.

#### Scenario: Class rule for a group of flags

- **WHEN** the consumer's stylesheet has `.my-flag { --kbq-flag-aspect-ratio: 4 / 3; }` and a flag has the class `my-flag`
- **THEN** the flag has 4:3 proportions, the same box as a flag with `aspectRatio="4 / 3"`

### Requirement: Corner radius from a stylesheet

The `--kbq-flag-border-radius` custom property SHALL set the corner radius of the box, `0` by default and `50%` for a `circle` flag. It SHALL be declared at zero specificity, so that a plain class rule of the consumer redefines it. Where the browser supports `corner-shape`, corners other than those of a `circle` flag SHALL use the smoothed corner shape the library uses for rounded components.

#### Scenario: Rounded rectangle

- **WHEN** the consumer's class rule on a rectangle flag sets `--kbq-flag-border-radius` to a length
- **THEN** the flag and its inset shadow have rounded corners

### Requirement: Inset shadow

The `shadow` input SHALL accept `inset` and `none`, defaulting to `inset`. With `inset` the host SHALL carry the `kbq-flag_shadow-inset` class and the flag SHALL show a 1 px inset hairline over its edge, following the corners of the box, in a color that follows the theme. With `none` the class and the hairline SHALL be absent.

#### Scenario: Default shadow

- **WHEN** a flag is rendered without `shadow`
- **THEN** the host has the `kbq-flag_shadow-inset` class

#### Scenario: Shadow turned off

- **WHEN** `shadow` is `none`
- **THEN** the host does not have the `kbq-flag_shadow-inset` class

### Requirement: Empty placeholder

The `empty` input, `false` by default, SHALL add the `kbq-flag_empty` class to the host and fill the box with an opaque neutral background. It MUST NOT remove the projected content or the `svg` markup: whatever the flag contains is still rendered over the fill.

#### Scenario: Placeholder for an unknown code

- **WHEN** `empty` is set on a flag with no content
- **THEN** the host has the `kbq-flag_empty` class and the box shows the neutral fill in the flag's shape

#### Scenario: Not set

- **WHEN** a flag is rendered without `empty`
- **THEN** the host does not have the `kbq-flag_empty` class

### Requirement: Boolean attribute inputs

The `decorative` and `empty` inputs SHALL accept the attribute form: the attribute written without a value, or with any value other than `"false"`, SHALL mean `true`, and the value `"false"` SHALL mean `false`.

#### Scenario: Bare attribute

- **WHEN** the consumer writes `<kbq-flag empty />`
- **THEN** the flag is treated as empty

#### Scenario: String false

- **WHEN** the consumer writes `<kbq-flag decorative="false" label="Germany" />`
- **THEN** the flag is not decorative and is exposed as an image named "Germany"

### Requirement: Labelled flag is an image

When `label` is a non-empty string and the flag is not `decorative`, the host SHALL have `role="img"` and `aria-label` set to the label, and SHALL NOT have `aria-hidden`.

#### Scenario: Flag without adjacent text

- **WHEN** the consumer writes `<kbq-flag label="Germany">` with a projected image
- **THEN** the host has `role="img"` and `aria-label="Germany"` and no `aria-hidden` attribute

### Requirement: Decorative flag is hidden

When `decorative` is `true`, the host SHALL have `aria-hidden="true"` and SHALL have neither `role` nor `aria-label`, even when `label` is set.

#### Scenario: Decorative flag with a label

- **WHEN** the consumer writes `<kbq-flag decorative label="Germany" />`
- **THEN** the host has `aria-hidden="true"` and no `role` or `aria-label` attribute

### Requirement: Unnamed flag is hidden by default

When `label` is unset or an empty string, the host SHALL have `aria-hidden="true"` and neither `role` nor `aria-label`, whether or not `decorative` is set. A name carried by the projected markup itself, such as an `alt` attribute or an SVG `<title>`, SHALL be hidden with it.

#### Scenario: No label

- **WHEN** a flag is rendered without `label` and without `decorative`
- **THEN** the host has `aria-hidden="true"` and no `role` or `aria-label` attribute

#### Scenario: Empty label

- **WHEN** `label` is an empty string
- **THEN** the host has `aria-hidden="true"` and no `role` or `aria-label` attribute

#### Scenario: Name from the image only

- **WHEN** the flag has no `label` and its projected image has `alt="Germany"`
- **THEN** the flag, image included, is hidden from assistive technology

### Requirement: Accessibility attributes follow the inputs

`role`, `aria-label` and `aria-hidden` SHALL be recomputed whenever `label` or `decorative` changes, so that the host always matches the rules for the current values.

#### Scenario: Label added, then decorative set

- **WHEN** a flag starts with no `label`, then gets `label="Germany"`, then gets `decorative` set to `true`
- **THEN** the host is first hidden, then has `role="img"` and `aria-label="Germany"`, then is hidden again with no `role` or `aria-label`

### Requirement: Documented markup passes axe

The three documented forms — a flag with `label`, a `decorative` flag next to its text, and a flag with neither — SHALL produce no axe-core violations, the third because the flag is hidden by default.

#### Scenario: The three forms on one page

- **WHEN** a labelled flag, a decorative flag followed by the text "Germany" and an unlabelled flag, each with a projected `<img alt="">`, are rendered together
- **THEN** axe-core reports no violations

### Requirement: Flag is not interactive

The flag MUST NOT be focusable and MUST NOT emit any output: it has no `tabindex`, no keyboard or pointer handling and no outputs.

#### Scenario: Tabbing through a page with flags

- **WHEN** the user presses Tab through a page that contains flags
- **THEN** focus never stops on a flag
