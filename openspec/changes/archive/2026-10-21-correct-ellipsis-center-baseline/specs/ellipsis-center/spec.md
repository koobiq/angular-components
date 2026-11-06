# Spec Delta

## MODIFIED Requirements

### Requirement: Tail length follows the host width and the glyph width

When it splits, the directive SHALL give the end half `round(W / 2 / g)` characters, clamped so that each half keeps at least one character, where `W` is the host's `clientWidth` in pixels and `g` is the larger of `charWidth` (default `7`) and the text's measured width divided by its length. An underestimated `charWidth` MUST NOT lengthen the tail. A `charWidth` above the measured width SHALL be used as `g`, so it shortens the tail only when it lowers the rounded, clamped count.

#### Scenario: Underestimated glyph width

- **WHEN** `charWidth` is `1`, the host is 150 px wide, and a 60-character text renders 420 px wide
- **THEN** the measured 7 px per character is used
- **AND** the end half holds 11 characters, half of the 150 px at 7 px per character, rounded

#### Scenario: Larger glyph width

- **WHEN** `charWidth` is `14`, the host is 150 px wide, and a 60-character text renders 420 px wide
- **THEN** `charWidth` is used instead of the measured 7 px per character
- **AND** the end half holds 5 characters, `round(150 / 2 / 14)`, fewer than the 11 the measurement alone gives

#### Scenario: Slightly larger glyph width

- **WHEN** `charWidth` is `7.1`, the host is 150 px wide, and a 60-character text renders 420 px wide
- **THEN** `charWidth` is used
- **AND** the end half still holds 11 characters, since `round(150 / 2 / 7.1)` is 11 as well

### Requirement: Tooltip does not capture the pointer by default

`ignoreTooltipPointerEvents` SHALL default to `true`, unlike a plain tooltip: the overlay pane of the open tooltip gets the class `cdk-overlay-pane_ignore-pointer-events`, so pointer events pass through it to the content underneath. Binding it to `false` before the tooltip first opens SHALL make the pane receive pointer events like a plain tooltip. The value SHALL be read once, when the first opening creates the overlay; the pane is reused, so a later change has no effect.

#### Scenario: Default

- **WHEN** `ignoreTooltipPointerEvents` is not set
- **THEN** it reads `true`
- **AND** the pane of the open tooltip has the class `cdk-overlay-pane_ignore-pointer-events`

#### Scenario: Opting out

- **WHEN** `[ignoreTooltipPointerEvents]="false"` is set before the tooltip first opens, and the tooltip opens
- **THEN** its overlay pane does not have the class `cdk-overlay-pane_ignore-pointer-events`

#### Scenario: Changing the input after the first opening

- **WHEN** the tooltip has opened once with the default and `ignoreTooltipPointerEvents` then becomes `false`
- **THEN** its overlay pane keeps the class `cdk-overlay-pane_ignore-pointer-events` on the next opening

### Requirement: Full text stays available to assistive technology

Because the two halves hold the whole text in the DOM, the directive SHALL leave the full text readable by assistive technology whatever the split. While the host's text content, trimmed, equals the full text, trimmed, the open tooltip MUST NOT add its id to the host's `aria-describedby`, since it only repeats the host's own text. When other content of the host adds text of its own, the two differ and the open tooltip's id is added.

#### Scenario: Tooltip open on a split name

- **WHEN** the tooltip of a host with split text and no other content is open
- **THEN** the text content of the host is the full text
- **AND** the host has no `aria-describedby` pointing at the tooltip

#### Scenario: Host with text of its own

- **WHEN** the host also contains a child element with text of its own and its tooltip is open
- **THEN** the host's `aria-describedby` contains the id of the tooltip element
