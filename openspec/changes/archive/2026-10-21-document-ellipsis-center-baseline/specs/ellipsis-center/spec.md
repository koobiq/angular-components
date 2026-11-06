# Spec Delta

## Purpose

Describes what the `kbqEllipsisCenter` directive from `@koobiq/components/ellipsis-center` guarantees to consumers: how it renders a single line of text into an element of limited width, when and where it moves the ellipsis into the middle so the end of the text stays visible, and how its tooltip spells out the full text.

## ADDED Requirements

### Requirement: Directive and module

`KbqEllipsisCenterDirective` SHALL be a standalone directive that attaches to any element with the `kbqEllipsisCenter` attribute. `KbqEllipsisCenterModule` SHALL import and export it, so NgModule consumers get the same directive.

#### Scenario: Standalone import

- **WHEN** a standalone component imports `KbqEllipsisCenterDirective` and renders `<span [kbqEllipsisCenter]="name"></span>`
- **THEN** the directive is created on the span

#### Scenario: Module import

- **WHEN** a component imports `KbqEllipsisCenterModule` and renders `<div [kbqEllipsisCenter]="name"></div>`
- **THEN** the directive is created on the div

### Requirement: Host class

The directive SHALL add the class `kbq-ellipsis-center` to its host element.

#### Scenario: Class on the host

- **WHEN** `kbqEllipsisCenter` is placed on an element
- **THEN** the element has the class `kbq-ellipsis-center`

### Requirement: Text is rendered into two halves

The directive SHALL render the text given to `kbqEllipsisCenter` itself, as two `span` children appended to the host: a start half with the class `kbq-ellipsis-center_data-text-start` and an end half with the class `kbq-ellipsis-center_data-text-end`. The two halves together SHALL always hold the whole text, in order. Each render replaces the previous pair of halves and keeps any other children of the host.

#### Scenario: Halves hold the whole text

- **WHEN** the directive has rendered a text
- **THEN** the host contains one start half and one end half
- **AND** the text of the start half followed by the text of the end half equals the full text

#### Scenario: Static attribute value

- **WHEN** the text is given as a static attribute, `kbqEllipsisCenter="Report dated 28.08.2018"`
- **THEN** the halves render that text

#### Scenario: Other content of the host

- **WHEN** the host already contains other child nodes
- **THEN** they are kept, and the two halves are appended after them

### Requirement: Text follows the binding

Changing the value bound to `kbqEllipsisCenter` SHALL render the new text and split it again. A bound `undefined` SHALL clear the text, leaving both halves empty.

#### Scenario: Bound text changes

- **WHEN** the bound text changes and change detection runs
- **THEN** the halves hold the new text
- **AND** the tooltip content becomes the new text

#### Scenario: Bound text becomes undefined

- **WHEN** the bound value turns `undefined` and the split has been applied
- **THEN** the text content of the host is empty

### Requirement: Text written from code

Assigning the `kbqEllipsisCenter` property of the directive instance in code SHALL render and split the new text the same way a binding change does. A later change of the bound value SHALL replace it; a binding whose value does not change MUST NOT overwrite it.

#### Scenario: Code assigns the text

- **WHEN** code holding the directive instance assigns `kbqEllipsisCenter = 'quarterly-report.pdf'`
- **THEN** the halves hold `quarterly-report.pdf`

#### Scenario: Binding changes afterwards

- **WHEN** code has assigned a text and the bound value then changes
- **THEN** the halves hold the newly bound value

### Requirement: Split is applied after a zero-delay timer

Every render SHALL first put the full text into the start half and leave the end half empty, then measure the host and apply the split later, in the callback of a zero-delay timer. A render that starts before the pending measurement has run SHALL cancel it, so only the latest text is split.

#### Scenario: State right after a change

- **WHEN** the text changes
- **THEN** synchronously after the change the start half holds the full text and the end half is empty
- **AND** once the zero-delay timer has run, the halves hold the split

### Requirement: Text that fits is not split

When the full text's rendered width does not exceed the host's `clientWidth`, the directive SHALL leave the whole text in the start half and the end half empty.

#### Scenario: Short name in a wide container

- **WHEN** `report.pdf` is rendered in a 600 px wide container and fits
- **THEN** the start half holds `report.pdf`
- **AND** the end half is empty

### Requirement: Overflowing text is split with its end kept visible

When the full text is wider than the host's `clientWidth` and at least `minVisibleLength` characters long, the directive SHALL move the trailing characters into the end half, which does not shrink, and leave the rest in the start half, which is cut with an ellipsis. The ellipsis then sits in the middle and the end of the text, such as a file extension, stays visible.

#### Scenario: Long file name in a narrow cell

- **WHEN** `annual-report-for-the-fiscal-year-2024-final-approved.pdf` is rendered in a 200 px wide cell
- **THEN** the end half contains `.pdf`
- **AND** the start half contains `annual-report`
- **AND** the start half followed by the end half equals the full name

### Requirement: Tail length follows the host width and the glyph width

When it splits, the directive SHALL give the end half `round(W / 2 / g)` characters, clamped so that each half keeps at least one character, where `W` is the host's `clientWidth` in pixels and `g` is the larger of `charWidth` (default `7`) and the text's measured width divided by its length. An underestimated `charWidth` MUST NOT lengthen the tail; a larger `charWidth` SHALL shorten it.

#### Scenario: Underestimated glyph width

- **WHEN** `charWidth` is `1`, the host is 150 px wide, and a 60-character text renders 420 px wide
- **THEN** the measured 7 px per character is used
- **AND** the end half holds 11 characters, half of the 150 px at 7 px per character, rounded

#### Scenario: Larger glyph width

- **WHEN** `charWidth` is larger than the measured width per character
- **THEN** `charWidth` is used and the end half holds fewer characters than the measurement alone would give

### Requirement: Each half keeps at least one character

When a text of two or more characters is split, the start half and the end half SHALL each hold at least one character, however narrow the host is.

#### Scenario: Host far narrower than the text

- **WHEN** a 60-character text that renders 420 px wide is split in a 5 px wide host
- **THEN** both halves are non-empty
- **AND** together they equal the full text

### Requirement: Minimum length to split

`minVisibleLength` (default `0`) SHALL set the shortest text that is split. A text shorter than it MUST NOT be split even when it overflows: it stays whole in the start half and is cut at its end with an ellipsis. A text exactly `minVisibleLength` characters long SHALL be split.

#### Scenario: Text shorter than the minimum

- **WHEN** `minVisibleLength` is `11` and the 10-character text `abcdef.pdf` overflows the host
- **THEN** the start half holds `abcdef.pdf`
- **AND** the end half is empty

#### Scenario: Text exactly at the minimum

- **WHEN** `minVisibleLength` is `10` and the 10-character text `abcdef.pdf` overflows the host
- **THEN** both halves are non-empty and together equal `abcdef.pdf`

#### Scenario: Default minimum

- **WHEN** `minVisibleLength` is not set and a text of two or more characters overflows the host
- **THEN** the text is split

### Requirement: Split options apply at the next split

`minVisibleLength` and `charWidth` SHALL be read when a split is measured. Changing either of them alone MUST NOT split the text again; the new value takes effect at the next text change or the next width change of the host.

#### Scenario: Minimum changed alone

- **WHEN** a text has been split and only `minVisibleLength` is then raised above its length
- **THEN** the halves keep the previous split
- **AND** the new minimum applies only from the next text change or width change of the host

### Requirement: Tooltip shows the full text

The directive SHALL act as a tooltip trigger for its host whose content is the full, unsplit text, kept up to date with every text change. Hovering the host while the tooltip is enabled SHALL show that text after the tooltip's enter delay.

#### Scenario: Hovering a split name

- **WHEN** the user hovers a host whose long file name has been split
- **THEN** a tooltip appears
- **AND** it contains the full file name

### Requirement: Tooltip is enabled only while the text overflows

After each measurement the directive SHALL enable its tooltip when the full text is wider than the host and disable it otherwise. A text left unsplit because it is shorter than `minVisibleLength` SHALL still get the tooltip while it overflows.

#### Scenario: Text that fits

- **WHEN** the text fits in the host and the user hovers it for longer than the enter delay
- **THEN** no tooltip appears

#### Scenario: Text that stops fitting

- **WHEN** `kbqTooltipDisabled` is not set and a measurement finds the text wider than the host
- **THEN** the tooltip is enabled

#### Scenario: Overflowing text below the minimum

- **WHEN** a text shorter than `minVisibleLength` overflows the host and the user hovers it
- **THEN** the tooltip with the full text appears
- **AND** the end half is empty

### Requirement: `kbqTooltipDisabled` can suppress the tooltip but not force it

Binding `kbqTooltipDisabled` to `true` SHALL keep the tooltip disabled even while the text overflows. Binding it to `false` MUST NOT enable the tooltip for text that fits. The directive's `disabled` property SHALL read back the effective state.

#### Scenario: Suppressed for overflowing text

- **WHEN** `kbqTooltipDisabled` is `true` and a measurement finds the text wider than the host
- **THEN** `disabled` is `true` and no tooltip appears

#### Scenario: Released for text that fits

- **WHEN** the text fits and `kbqTooltipDisabled` is set to `true` and then back to `false`
- **THEN** `disabled` stays `true`

### Requirement: Tooltip does not capture the pointer by default

`ignoreTooltipPointerEvents` SHALL default to `true`, unlike a plain tooltip: the overlay pane of the open tooltip gets the class `cdk-overlay-pane_ignore-pointer-events`, so pointer events pass through it to the content underneath. Binding it to `false` SHALL make the pane receive pointer events like a plain tooltip.

#### Scenario: Default

- **WHEN** `ignoreTooltipPointerEvents` is not set
- **THEN** it reads `true`
- **AND** the pane of the open tooltip has the class `cdk-overlay-pane_ignore-pointer-events`

### Requirement: Tooltip inputs and outputs are inherited

The directive SHALL accept the inputs and outputs of the tooltip trigger it extends, for example `kbqPlacement`, `kbqPlacementPriority`, `kbqTooltipArrow`, `kbqEnterDelay`, `kbqLeaveDelay`, `kbqTooltipClass`, `kbqTrigger`, `kbqVisibleChange` and `kbqPlacementChange`, and apply them to its tooltip, without a separate `kbqTooltip` directive on the host.

#### Scenario: Placement priority

- **WHEN** the host also binds `[kbqPlacementPriority]="'bottom'"`, its text overflows, and there is room below it
- **THEN** hovering it shows the tooltip below the host

#### Scenario: Visibility output

- **WHEN** the host binds `(kbqVisibleChange)` and the tooltip opens and closes
- **THEN** the output emits `true` and then `false`

### Requirement: Width changes re-split the text

The directive SHALL observe the size of its host, including resizes of a container that leave the window size unchanged. Once resizes have paused for `debounceInterval` milliseconds, it SHALL measure and split the text again if the host's `clientWidth` differs from the last measured width. A resize that leaves the host's width unchanged MUST NOT split the text again.

#### Scenario: Container widened

- **WHEN** the container of a host with split text is widened until the text fits, for example by dragging a splitter
- **THEN** after the debounce interval the whole text is in the start half and the tooltip is disabled

#### Scenario: Height change only

- **WHEN** only the height of the host changes
- **THEN** the halves keep their current split

### Requirement: Resize debounce interval

`debounceInterval` SHALL set the pause, in milliseconds, after which a resize is handled. It SHALL default to `50` and accept a number or a numeric string. Its value SHALL be read once, after the host's view is initialized; changing it later MUST NOT change the debounce.

#### Scenario: Numeric string

- **WHEN** the host sets `debounceInterval="200"`
- **THEN** a resize is handled 200 ms after the last size change

#### Scenario: Value changed later

- **WHEN** the bound `debounceInterval` changes after the view is initialized
- **THEN** resizes are still handled after the initial interval

### Requirement: The directive loads its own layout

The directive SHALL load the layout it depends on, without styles from the consumer: the host is a flex container with `overflow: hidden`, `max-width: 100%` and `min-width: 0`; the start half shrinks, hides its overflow and ends with an ellipsis (`text-overflow: ellipsis`); the end half does not shrink. Both halves use `white-space: pre`.

#### Scenario: Host without styles of its own

- **WHEN** the directive is used on a bare `span` inside a 200 px wide flex container, with no styles for it in the page
- **THEN** the host computes `display: flex`, `overflow: hidden` and `min-width: 0px`
- **AND** the start half computes `text-overflow: ellipsis`
- **AND** the end half computes `white-space: pre`

### Requirement: Text stays on one line

The directive SHALL keep the text on a single line: a text without line breaks MUST NOT wrap inside the host, however narrow the host is.

#### Scenario: Long name in a narrow cell

- **WHEN** a long file name is rendered in a 200 px wide cell with a 14 px font
- **THEN** the host is less than 24 px high

### Requirement: Full text stays available to assistive technology

Because the two halves hold the whole text in the DOM, the directive SHALL leave the full text readable by assistive technology whatever the split. The open tooltip MUST NOT add its id to the host's `aria-describedby`, since it only repeats the host's own text.

#### Scenario: Tooltip open on a split name

- **WHEN** the tooltip of a host with split text is open
- **THEN** the text content of the host is the full text
- **AND** the host has no `aria-describedby` pointing at the tooltip

### Requirement: Making the host focusable is left to the consumer

The directive MUST NOT add a `tabindex` or a `role` to its host, unless the inherited `forDisabledComponent` input is bound, which the directive's JSDoc advises against. With the default triggers, the tooltip SHALL open on keyboard focus only when the consumer has made the host focusable.

#### Scenario: Plain host

- **WHEN** the directive is placed on a `span` without a `tabindex`
- **THEN** the span has no `tabindex` and no `role`, and is not in the tab order

#### Scenario: Focusable host

- **WHEN** the host has `tabindex="0"`, its text overflows, and the user tabs onto it
- **THEN** the tooltip with the full text appears after the enter delay
