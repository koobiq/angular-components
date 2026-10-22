# scrollbar Specification Delta

## MODIFIED Requirements

### Requirement: No bar for an axis the user cannot scroll

An axis whose computed `overflow` is `hidden`, `clip` or `visible` MUST NOT get a bar or a thumb, however far its content overflows. The track element SHALL stay in place. A change of `overflow` made through an attribute of the scrolling element, such as `class` or `style`, SHALL add or remove the bar without a scroll or hover; one made only from outside, such as a class on an ancestor, SHALL be picked up on the next scroll, hover or focus.

#### Scenario: Overflow hidden on both axes

- **WHEN** the content overflows both axes of a viewport whose `overflow` is `hidden`
- **THEN** the track is attached but draws no bar and no thumb

#### Scenario: Only one axis hidden

- **WHEN** the content overflows both axes, `overflow-x` is `hidden` and `overflow-y` is `auto`
- **THEN** only the vertical bar is drawn

#### Scenario: Overflow locked and unlocked

- **WHEN** a viewport with a vertical bar gets `overflow: hidden` through a class on itself and later loses that class
- **THEN** the bar disappears and then comes back

### Requirement: Bars follow content changes

The bars and the thumb SHALL follow changes of the content without a scroll or hover: nodes inserted or removed at any depth, text, attribute and style changes inside the viewport, images and fonts that finish loading, and resizes of the scrolling element or of a box directly inside its content, from outside styles too. A change none of these reports, such as an outside style that grows only an inline element's content, or a transform, SHALL be picked up on the next scroll, hover or focus.

#### Scenario: Content inserted deep inside

- **WHEN** an `always`-mode scrollbar without overflow gets enough content inserted deep inside to overflow
- **THEN** a vertical bar appears without a scroll or hover

#### Scenario: Content removed

- **WHEN** that content is destroyed again
- **THEN** the bar disappears

#### Scenario: Image loads

- **WHEN** an image inside the scrollbar finishes loading and makes the content overflow
- **THEN** a vertical bar appears

#### Scenario: More content arrives

- **WHEN** more content is added to a scrollbar that already overflows
- **THEN** the thumb gets shorter

#### Scenario: Change nothing reports

- **WHEN** a transform grows the scrollable area and the viewport is then scrolled
- **THEN** a vertical bar appears

### Requirement: Scrolling to offsets

`scrollTo(options)` on `kbq-scrollbar` and on `kbqScrollbarViewport` SHALL scroll the scrolling element with the options of CDK's `CdkScrollable.scrollTo`: `top`, `left`, `right`, `bottom`, `start`, `end` and `behavior` (`auto`, `instant` or `smooth`). `start` and `end` SHALL follow the direction CDK's `Directionality` reports: a `Dir` directive on the element or an ancestor, else the `dir` of `body` or `html` read once at startup. A bare `dir="rtl"` on another ancestor is not seen.

#### Scenario: Offsets with smooth behavior

- **WHEN** `scrollTo({ top: 10, left: 20, behavior: 'smooth' })` is called
- **THEN** the scroll container is asked to scroll to those offsets with smooth behavior

### Requirement: Scrolling to the horizontal edges

`scrollStart(behavior?)` SHALL scroll to the logical start of the horizontal axis and `scrollEnd(behavior?)` to its logical end: the left and right edges in a left-to-right layout, the right and left edges in a right-to-left one that CDK's `Directionality` reports. Under a bare `dir="rtl"` on an ancestor other than `html` or `body`, without the `Dir` directive, both resolve as in a left-to-right layout, so `scrollEnd()` does not reach the left edge.

#### Scenario: End and back in a left-to-right layout

- **WHEN** the content is 300 px wide in a 150 px scrollbar and `scrollEnd()` then `scrollStart()` are called
- **THEN** `scrollLeft` becomes 150 and then 0

### Requirement: Scrolling to an element

`scrollToElement(target, options?)` SHALL request the target's offset summed along its `offsetParent` chain up to the scrolling element, less the `top` and `left` gaps, with the given `behavior`. On a positioned host (`kbq-scrollbar`, `cdk-virtual-scroll-viewport`) this aligns the target's top-left corner with the visible area's; a non-positioned host is skipped and its own offset added. A string target SHALL be a selector matched inside the scrolling element; no match MUST do nothing.

#### Scenario: Element target

- **WHEN** the target is the third of five 150 px blocks and `scrollToElement(target)` is called
- **THEN** `scrollTop` becomes 300

#### Scenario: Gaps

- **WHEN** the target is 100 px from the top and the left and `scrollToElement(target, { top: 16, left: 16 })` is called
- **THEN** the scroll offsets requested are 84 px on both axes

#### Scenario: Unmatched selector

- **WHEN** `scrollToElement('.does-not-exist')` is called
- **THEN** the scrollbar does not scroll

### Requirement: Centering an element

`scrollIntoView(target, behavior?)` SHALL request the offsets that put the centre of the target at the centre of the visible area on both axes, measuring the target along its `offsetParent` chain as `scrollToElement` does. On a non-positioned `kbqScrollbarViewport` host the chain skips the host, so the host's own offset is added and the target is not centred.

#### Scenario: Centering a block

- **WHEN** a 50 px target 200 px from the top and the left is centred in a 100 px viewport
- **THEN** the scroll offsets requested are 175 px on both axes

### Requirement: Bar gestures do not click the content

Pressing a bar or a thumb MUST NOT move focus or start a text selection. The click that the browser produces when that press is released SHALL be stopped before it reaches any element. Once the release reaches the window as a mouse-up event, only a click that follows it before the next task is stopped. A press whose release never reaches the window as a mouse-up event leaves the suppression waiting: the click that follows the next mouse-up event in the window is stopped instead.

#### Scenario: Drag released over content

- **WHEN** the user presses a bar, releases the button over a button inside the scrollbar, and the browser dispatches a click
- **THEN** no click handler of the page receives that click

#### Scenario: Later click

- **WHEN** a second click follows the suppressed one
- **THEN** it reaches its handlers

#### Scenario: Track removed mid-gesture

- **WHEN** the track is removed between the release and the click
- **THEN** the click reaches its handlers

### Requirement: Thumb size and position

The thumb SHALL take the share of its bar that the visible part takes of the content, rounded up to a whole percent, and SHALL move along the bar in proportion to the scroll position. Its box MUST NOT be smaller than 38 px (32 px painted). With only its bar drawn, at the end of the range it MUST NOT reach more than 1 px past the bar's end; with both bars drawn, a minimum-size thumb is placed against the client size, not the shorter bar, and reaches a few pixels past it.

#### Scenario: Long content

- **WHEN** many items are added to a virtual scroll viewport
- **THEN** the thumb's box stays at least 38 px tall

#### Scenario: End of a long range

- **WHEN** a long list that overflows only vertically is scrolled to the bottom
- **THEN** the thumb's bottom edge is within 1 px of the bar's bottom edge

### Requirement: Track covers the visible area without taking space

The track SHALL cover the visible area, padding included, at every scroll position: flush with its top and start edges and, one pixel smaller than the client size, about 1 px short of its bottom and end edges. In a block or flex scrolling element without `gap` it MUST NOT take layout space or move the content; as an in-flow first child it takes a grid's first cell and a flex container's `gap`. Each bar SHALL run the track's full length, short of the corner when both are drawn.

#### Scenario: Padded viewport

- **WHEN** a viewport with 16 px padding is scrolled from the top to the bottom
- **THEN** the vertical bar stays within 1 px of the viewport's top and end edges and ends at most 2 px above its bottom edge

#### Scenario: Zero-sized viewport

- **WHEN** the scrolling element has no size
- **THEN** the track has a size of zero and adds no layout space

### Requirement: Track stacking

The track SHALL paint above content positioned inside the scrolling element whose `z-index` is below `--kbq-scrollbar-track-z-index` (1000 by default), and inside `kbq-scrollbar`, whose content wrapper isolates the content, above any `z-index`. Its `z-index` SHALL stay confined to the scrolling element, so it MUST NOT paint above an element outside that paints above the scrolling element. Apart from the bars, the track MUST NOT intercept the pointer.

#### Scenario: Sticky header inside

- **WHEN** a sticky header with `z-index: 100` inside the viewport sits under the vertical bar
- **THEN** a pointer at that point hits the track

#### Scenario: Layer outside

- **WHEN** a sibling element with `z-index: 1` after the viewport overlaps the vertical bar
- **THEN** a pointer at that point hits the sibling
