# Spec Delta

## Purpose

Describes what `@koobiq/components/scrollbar` guarantees to consumers: how `kbq-scrollbar` and the `kbqScrollbarViewport` directive draw a custom scrollbar over a scrollable area in each display mode, how they are configured and scrolled from code, how users operate the bars with a pointer or assistive technology, and how `kbqNativeScrollbar` customizes the browser's own scrollbar.

## ADDED Requirements

### Requirement: The scrollbar element is the scroll container

The `kbq-scrollbar` element SHALL itself be the scrolling element: it scrolls on both axes (`overflow: auto`) and places its projected content inside one wrapper element. `getNativeElement()` SHALL return that element, and the component SHALL be reachable in a template through the `kbqScrollbar` export name.

#### Scenario: Scrolling the host

- **WHEN** content taller than a `kbq-scrollbar` is projected into it and its `scrollTop` is set
- **THEN** the `kbq-scrollbar` element scrolls and `getNativeElement()` returns that element

#### Scenario: Overflow shadow on the same element

- **WHEN** `kbqOverflowShadowContainer` is placed on the same `kbq-scrollbar` element and the element is scrolled
- **THEN** the shadow container reports the overflow of the scrollbar's content without further wiring

### Requirement: Custom track replaces the native scrollbar

In `hover` and `always` modes the scrolling element SHALL get a custom track, a `kbq-scrollbar-track` element inserted as its first child, and the class `kbq-scrollbar-viewport_native-scrollbar-hidden`, which hides the browser's own scrollbar. The scrolling element SHALL always carry the class `kbq-scrollbar-viewport`.

#### Scenario: Default rendering

- **WHEN** a `kbq-scrollbar` renders with the default options
- **THEN** its first child is a `kbq-scrollbar-track` element
- **AND** it has the classes `kbq-scrollbar-viewport` and `kbq-scrollbar-viewport_native-scrollbar-hidden`

### Requirement: Default display mode

Without an input or a provider, the display mode SHALL be `hover` and the hide delay SHALL be 1000 ms. Both defaults SHALL come from `KBQ_SCROLLBAR_OPTIONS`, which `kbq-scrollbar` and `kbqScrollbarViewport` read from their injector.

#### Scenario: No configuration

- **WHEN** a `kbq-scrollbar` renders with no `kbqScrollbarMode` and no provider
- **THEN** its `mode()` is `hover`

### Requirement: Per-instance display mode

`kbqScrollbarMode` SHALL set the display mode of one scrollbar or viewport to `hover`, `always`, `native` or `hidden`, overriding the injected default.

#### Scenario: Input wins over the provider

- **WHEN** `kbqScrollbarOptionsProvider({ mode: 'always' })` is provided and a scrollbar binds `kbqScrollbarMode="native"`
- **THEN** that scrollbar's `mode()` is `native`

### Requirement: Options provider

`kbqScrollbarOptionsProvider(options)` SHALL provide `KBQ_SCROLLBAR_OPTIONS` for the injector it is placed in and its descendants. The keys it is given SHALL be merged over the library defaults (`hover`, 1000 ms), not over options provided by an outer injector, so a key left out falls back to the library default.

#### Scenario: Application-wide mode

- **WHEN** `kbqScrollbarOptionsProvider({ mode: 'always' })` is provided at the root and a scrollbar has no `kbqScrollbarMode`
- **THEN** its `mode()` is `always`

#### Scenario: Partial provider in a nested injector

- **WHEN** the root provides `{ mode: 'always' }` and a component below it provides `kbqScrollbarOptionsProvider({ hideDelay: 500 })`
- **THEN** scrollbars inside that component use the `hover` mode

### Requirement: Hover mode

In `hover` mode the track SHALL be transparent until the pointer is over the scrolling element, while the element scrolls, after `flashScrollIndicators()`, or while a bar is pressed. Focusing an element inside the scrollbar MUST NOT reveal the track on its own.

#### Scenario: Pointer over the scrollbar

- **WHEN** the pointer is away from a `hover`-mode scrollbar whose content overflows, and then moves over it
- **THEN** the track's opacity goes from 0 to 1

#### Scenario: Focus inside the scrollbar

- **WHEN** an element inside a `hover`-mode scrollbar receives focus and the pointer is away
- **THEN** the track stays transparent

#### Scenario: Keyboard scrolling

- **WHEN** a focused element inside a `hover`-mode scrollbar lets an arrow key scroll the scrollbar
- **THEN** the track becomes visible

### Requirement: Reveal on scroll ends after the hide delay

Every scroll of the scrolling element, by the user or from code, SHALL reveal the track and set the class `kbq-scrollbar-track_revealed` on it. The class SHALL be removed once the hide delay has passed without another scroll; each scroll restarts the delay. `kbqScrollbarHideDelay` SHALL set the delay in milliseconds per instance and accepts a number or a numeric string.

#### Scenario: Scrolling then stopping

- **WHEN** the scrolling element emits a `scroll` event with the default hide delay
- **THEN** the track has the class `kbq-scrollbar-track_revealed`
- **AND** the class is gone 1000 ms later

### Requirement: Always mode

In `always` mode the track SHALL be visible without hovering or scrolling, for every axis that gets a bar.

#### Scenario: Pointer away

- **WHEN** a scrollbar in `always` mode has overflowing content and the pointer is away from it
- **THEN** the track's opacity is 1

### Requirement: Native mode

In `native` mode the scrollbar SHALL render no custom track and MUST NOT hide the browser's own scrollbar: the class `kbq-scrollbar-viewport_native-scrollbar-hidden` is absent.

#### Scenario: Switching to native

- **WHEN** a scrollbar's mode is `native`
- **THEN** there is no `kbq-scrollbar-track` element inside it
- **AND** it does not have the class `kbq-scrollbar-viewport_native-scrollbar-hidden`

### Requirement: Hidden mode

In `hidden` mode the scrollbar SHALL render no custom track and SHALL hide the browser's own scrollbar, while the content stays scrollable by wheel, touch, keyboard and code.

#### Scenario: Switching to hidden

- **WHEN** a scrollbar's mode is `hidden`
- **THEN** there is no `kbq-scrollbar-track` element inside it
- **AND** it has the class `kbq-scrollbar-viewport_native-scrollbar-hidden`

### Requirement: Changing the mode at runtime

A change of the mode SHALL take effect without recreating the scrollbar. Switching between `hover` and `always` SHALL keep the same track element. Switching to `native` or `hidden` SHALL remove the track, and switching back to `hover` or `always` SHALL create a new one.

#### Scenario: Hover to always and back

- **WHEN** the mode switches from `hover` to `always`, back to `hover` and to `always` again
- **THEN** the same track element stays in place and its visibility follows each mode

#### Scenario: Through hidden

- **WHEN** the mode switches from `hover` to `hidden` and then to `always`
- **THEN** the track is removed and a different track element is created

### Requirement: Bars only for overflowing axes

The track SHALL draw a vertical bar only while the content overflows vertically, and a horizontal bar only while it overflows horizontally. An axis counts as overflowing when the visible part is at most 99 % of the content along it. Without overflow the track MUST draw no bar and no thumb, in `always` mode too.

#### Scenario: Vertical overflow only

- **WHEN** the content is taller than the scrolling element but not wider
- **THEN** only the vertical bar is drawn

#### Scenario: Horizontal overflow only

- **WHEN** the content is wider than the scrolling element but not taller
- **THEN** only the horizontal bar is drawn

#### Scenario: No overflow

- **WHEN** the content fits on both axes in `always` mode
- **THEN** the track draws no bar and no thumb

### Requirement: No bar for an axis the user cannot scroll

An axis whose computed `overflow` is `hidden`, `clip` or `visible` MUST NOT get a bar or a thumb, however far its content overflows. The track element SHALL stay in place, and a bar SHALL appear once that axis becomes scrollable again.

#### Scenario: Overflow hidden on both axes

- **WHEN** the content overflows both axes of a viewport whose `overflow` is `hidden`
- **THEN** the track is attached but draws no bar and no thumb

#### Scenario: Only one axis hidden

- **WHEN** the content overflows both axes, `overflow-x` is `hidden` and `overflow-y` is `auto`
- **THEN** only the vertical bar is drawn

#### Scenario: Overflow locked and unlocked

- **WHEN** a viewport with a vertical bar gets `overflow: hidden` and later gets it removed
- **THEN** the bar disappears and then comes back

### Requirement: Bars follow content changes

The bars and the thumb SHALL follow changes of the content without a scroll or hover: nodes inserted or removed at any depth, text changes, attribute and style changes inside the viewport, styles applied from outside that resize the content, images and fonts that finish loading, and boxes that resize. A change that grows the content without any of these SHALL be picked up on the next scroll, hover or focus.

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

### Requirement: Idle scrollbar schedules no work

Once it has measured, a scrollbar whose content does not change MUST NOT keep scheduling animation frames or timers, so an application with idle scrollbars can become stable.

#### Scenario: Settling after the first measurement

- **WHEN** a scrollbar has rendered and measured, and nothing changes afterwards
- **THEN** all pending timers and animation frames run out and the application becomes stable

### Requirement: Viewport directive

`kbqScrollbarViewport` SHALL give any element, including `cdk-virtual-scroll-viewport`, the same custom scrollbar as `kbq-scrollbar`: the same modes, the `kbqScrollbarMode` and `kbqScrollbarHideDelay` inputs, the same defaults and classes, and a track inserted as the host's first child. Unlike `kbq-scrollbar`, it MUST NOT set the host's overflow and has no template export name.

#### Scenario: Directive on a plain element

- **WHEN** `kbqScrollbarViewport` is placed on an element in `hover` or `always` mode
- **THEN** a `kbq-scrollbar-track` element is the element's first child

#### Scenario: Directive in native or hidden mode

- **WHEN** the directive's mode is `native` or `hidden`
- **THEN** no track is created inside the element

#### Scenario: Virtual scroll viewport

- **WHEN** `kbqScrollbarViewport` is placed on a `cdk-virtual-scroll-viewport` and items are appended while it is scrolled to the bottom
- **THEN** the thumb gets shorter and moves up

### Requirement: The viewport is one CDK scroll container

The scrolling element of `kbq-scrollbar` and of `kbqScrollbarViewport` SHALL be a CDK scroll container that `CdkScrollable` can be injected from. It SHALL be registered with `ScrollDispatcher` exactly once, also on a `cdk-virtual-scroll-viewport`, so one native scroll produces one `ScrollDispatcher.scrolled()` emission.

#### Scenario: Standalone viewport

- **WHEN** `CdkScrollable` is queried on an element with `kbqScrollbarViewport`
- **THEN** its element is that same element

#### Scenario: Virtual scroll viewport

- **WHEN** a `cdk-virtual-scroll-viewport` with `kbqScrollbarViewport` is scrolled once
- **THEN** `ScrollDispatcher.scrolled()` emits once
- **AND** the dispatcher holds one registration for that element

### Requirement: Scrolling to offsets

`scrollTo(options)` on `kbq-scrollbar` and on `kbqScrollbarViewport` SHALL scroll the scrolling element with the options of CDK's `CdkScrollable.scrollTo`: `top`, `left`, `right`, `bottom`, `start`, `end` and `behavior` (`auto`, `instant` or `smooth`), where `start` and `end` follow the text direction.

#### Scenario: Offsets with smooth behavior

- **WHEN** `scrollTo({ top: 10, left: 20, behavior: 'smooth' })` is called
- **THEN** the scroll container is asked to scroll to those offsets with smooth behavior

### Requirement: Scrolling to the vertical edges

`scrollToTop(behavior?)` SHALL scroll to the top edge. `scrollToBottom(behavior?)` SHALL scroll to the bottom edge by requesting a top offset equal to the content height.

#### Scenario: Bottom and back

- **WHEN** the content is 750 px tall in a 150 px scrollbar and `scrollToBottom()` then `scrollToTop()` are called
- **THEN** `scrollTop` becomes 600 and then 0

### Requirement: Scrolling to the horizontal edges

`scrollStart(behavior?)` SHALL scroll to the logical start of the horizontal axis and `scrollEnd(behavior?)` to its logical end: the left and right edges in a left-to-right layout, the right and left edges in a right-to-left one.

#### Scenario: End and back in a left-to-right layout

- **WHEN** the content is 300 px wide in a 150 px scrollbar and `scrollEnd()` then `scrollStart()` are called
- **THEN** `scrollLeft` becomes 150 and then 0

### Requirement: Scrolling to an element

`scrollToElement(target, options?)` SHALL align the target's top and left edges with the top and left edges of the visible area, less the `top` and `left` gaps in pixels, with the given `behavior`. A string target SHALL be resolved as a CSS selector inside the scrolling element; a selector that matches nothing MUST do nothing.

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

`scrollIntoView(target, behavior?)` SHALL scroll so that the centre of the target is at the centre of the visible area on both axes.

#### Scenario: Centering a block

- **WHEN** a 50 px target 200 px from the top and the left is centred in a 100 px viewport
- **THEN** the scroll offsets requested are 175 px on both axes

### Requirement: Scroll indicator

`flashScrollIndicators()` on `kbq-scrollbar` or `kbqScrollbarViewport` SHALL reveal the track for the hide delay without scrolling, as a scroll would, and SHALL re-measure the content. It MUST NOT draw a bar when the content does not overflow. `kbqScrollbarViewport` SHALL emit on its `flashes` stream for each call.

#### Scenario: Flashing an overflowing scrollbar

- **WHEN** `flashScrollIndicators()` is called with the default hide delay
- **THEN** the track has the class `kbq-scrollbar-track_revealed`
- **AND** the class is gone 1000 ms later

#### Scenario: Flashing without overflow

- **WHEN** `flashScrollIndicators()` is called on a scrollbar whose content fits
- **THEN** no bar and no thumb are drawn

### Requirement: Browser scrollbar directive

`kbqNativeScrollbar` SHALL style the browser's own scrollbar of its host without replacing native scrolling: it adds the class `kbq-native-scrollbar` and renders no custom track. By default it MUST NOT change the scrollbars of descendant elements. It SHALL be reachable through the `kbqNativeScrollbar` export name.

#### Scenario: Host only

- **WHEN** an element with `kbqNativeScrollbar` contains another scrollable element
- **THEN** the host's scrollbar is 14 px wide
- **AND** the nested element keeps the browser's default scrollbar

### Requirement: Customizing descendant scrollbars

`kbqNativeScrollbarDescendants` SHALL extend the customization to every descendant scrollbar and add the class `kbq-native-scrollbar_descendants`. It SHALL accept boolean attribute values. Its default SHALL come from `KBQ_NATIVE_SCROLLBAR_OPTIONS` (`false`), which `kbqNativeScrollbarOptionsProvider` overrides; the input SHALL win over the provider.

#### Scenario: Attribute present

- **WHEN** `kbqNativeScrollbarDescendants` is set to an empty string
- **THEN** `descendants()` is `true` and the host has the class `kbq-native-scrollbar_descendants`
- **AND** nested scrollbars look like the host's

#### Scenario: String "false"

- **WHEN** `kbqNativeScrollbarDescendants` is set to `"false"`
- **THEN** `descendants()` is `false` and the class is absent

#### Scenario: Provider default

- **WHEN** `kbqNativeScrollbarOptionsProvider({ descendants: true })` is provided and the input is not bound
- **THEN** the host has the class `kbq-native-scrollbar_descendants`

#### Scenario: Host directive of a component

- **WHEN** a component uses `KbqNativeScrollbar` as a host directive and provides `kbqNativeScrollbarOptionsProvider({ descendants: true })` itself
- **THEN** its host has both `kbq-native-scrollbar` and `kbq-native-scrollbar_descendants`

### Requirement: Browser scrollbar on a native-mode scrollbar

`kbqNativeScrollbar` combined with `kbq-scrollbar` or `kbqScrollbarViewport` in `native` mode SHALL style the browser's scrollbar of that element, with no custom track and without hiding the native scrollbar.

#### Scenario: Combined directives

- **WHEN** an element has `kbqScrollbarViewport`, `kbqScrollbarMode="native"` and `kbqNativeScrollbar`
- **THEN** its native scrollbar is 14 px wide
- **AND** it has no `kbq-scrollbar-track` and no class `kbq-scrollbar-viewport_native-scrollbar-hidden`

### Requirement: Scroll events

`scrollChanges` on `kbq-scrollbar` and on `kbqScrollbarViewport` SHALL emit the native `scroll` event of the scrolling element once per event.

#### Scenario: One scroll event

- **WHEN** a subscriber listens to `scrollChanges` and the scrolling element dispatches one `scroll` event
- **THEN** the subscriber is called once

### Requirement: Dragging a thumb

Pressing a thumb and moving the mouse SHALL scroll the thumb's axis only, keeping the point where the thumb was grabbed under the pointer, until the mouse button is released anywhere in the document. The scroll SHALL be instant even when the scrolling element has smooth `scroll-behavior`.

#### Scenario: Vertical drag

- **WHEN** the user presses the vertical thumb and moves the mouse down half the bar
- **THEN** `scrollTop` moves to half the scroll range and `scrollLeft` is unchanged

#### Scenario: Horizontal drag

- **WHEN** the user presses the horizontal thumb and moves the mouse right
- **THEN** `scrollLeft` changes and `scrollTop` is unchanged

### Requirement: Pressing a bar outside the thumb

Pressing a bar outside its thumb SHALL scroll at once to the position that centres the thumb under the pointer, whatever the thumb's size and whichever mouse button is pressed. In a right-to-left layout the horizontal position SHALL be measured from the bar's right edge.

#### Scenario: Middle of the vertical bar

- **WHEN** the user presses the middle of the vertical bar
- **THEN** the content scrolls to the middle of its range

#### Scenario: Right mouse button

- **WHEN** the user presses the middle of the bar with the right or middle mouse button
- **THEN** the content scrolls to the middle of its range as with the left button

#### Scenario: Right-to-left layout

- **WHEN** the scrollbar is in a `dir="rtl"` container, with or without CDK's `Dir` directive, and the user presses the middle of the horizontal bar
- **THEN** the content scrolls to the middle of its range, with a negative `scrollLeft`

### Requirement: Bar gestures do not click the content

Pressing a bar or a thumb MUST NOT move focus or start a text selection. The click that the browser produces when that press is released SHALL be stopped before it reaches any element. Only that click is stopped: a press released outside the window, or a release followed by no click before the next task, MUST NOT stop a later click.

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

The thumb SHALL take the share of its bar that the visible part takes of the content, rounded up to a whole percent, and SHALL move along the bar in proportion to the scroll position. Its box MUST NOT be smaller than 38 px (32 px painted), and at the end of the range it MUST NOT reach past the bar's end.

#### Scenario: Long content

- **WHEN** many items are added to a virtual scroll viewport
- **THEN** the thumb's box stays at least 38 px tall

#### Scenario: End of a long range

- **WHEN** a long list is scrolled to the bottom
- **THEN** the thumb's bottom edge is within 1 px of the bar's bottom edge

### Requirement: Track covers the visible area without taking space

The track MUST NOT take layout space or move the content, and SHALL cover the visible area, including the scrolling element's padding, at every scroll position. A vertical bar SHALL run the full height and a horizontal bar the full width, flush with the edges.

#### Scenario: Padded viewport

- **WHEN** a viewport with 16 px padding is scrolled from the top to the bottom
- **THEN** the vertical bar stays flush with the viewport's top, bottom and end edges

#### Scenario: Zero-sized viewport

- **WHEN** the scrolling element has no size
- **THEN** the track has a size of zero and adds no layout space

### Requirement: Bars meet at the corner

When both bars are drawn, each SHALL stop short of the corner by the other bar's thickness, so the bars do not overlap.

#### Scenario: Both axes overflow

- **WHEN** a scrollbar draws both bars
- **THEN** the vertical bar ends where the horizontal bar begins and the horizontal bar ends where the vertical bar begins

### Requirement: Track stacking

The track SHALL paint above content positioned inside the scrolling element, including content with its own `z-index`, and MUST NOT paint above elements outside the scrolling element. Apart from the bars, the track MUST NOT intercept the pointer.

#### Scenario: Sticky header inside

- **WHEN** a sticky header with `z-index: 100` inside the viewport sits under the vertical bar
- **THEN** a pointer at that point hits the track

#### Scenario: Layer outside

- **WHEN** a sibling element with `z-index: 1` after the viewport overlaps the vertical bar
- **THEN** a pointer at that point hits the sibling

### Requirement: Nested scrollbars

A scrollbar inside another SHALL keep its own track and scroll position: scrolling either one MUST NOT scroll the other.

#### Scenario: Scrolling the outer one

- **WHEN** the outer scrollbar is scrolled to the bottom
- **THEN** the inner one stays at the top

#### Scenario: Scrolling the inner one

- **WHEN** the inner scrollbar is scrolled to the bottom
- **THEN** the outer one stays at the top

### Requirement: Thumb semantics

Each thumb SHALL have `role="scrollbar"`, `aria-orientation` set to `vertical` or `horizontal`, and `aria-controls` set to the id of the scrolling element.

#### Scenario: Vertical thumb

- **WHEN** a vertical thumb is drawn
- **THEN** it has `role="scrollbar"`, `aria-orientation="vertical"` and `aria-controls` equal to the viewport's id

### Requirement: Viewport id

The scrolling element SHALL keep an id the consumer sets, statically or through an `[id]` binding. Without one, it SHALL get a generated id starting with `kbq-scrollbar-viewport-`, unique per instance.

#### Scenario: Consumer id

- **WHEN** the consumer binds `[id]` on an element with `kbqScrollbarViewport`
- **THEN** the element keeps that id

#### Scenario: Generated ids

- **WHEN** two viewport elements without ids render
- **THEN** each has a non-empty id and the ids differ

### Requirement: Thumb value

Each thumb SHALL expose the scroll position as a percentage: `aria-valuemin="0"`, `aria-valuemax="100"`, and `aria-valuenow` set when the thumb is drawn and updated on every scroll to the rounded share of the range scrolled. With nothing to scroll, `aria-valuenow` SHALL be `0`.

#### Scenario: Scrolling a 300 px content in a 100 px viewport

- **WHEN** `scrollTop` is 0, then 100, then 200
- **THEN** `aria-valuenow` is `0`, then `50`, then `100`

#### Scenario: Nothing to scroll

- **WHEN** the content height equals the viewport height and a scroll event fires
- **THEN** `aria-valuenow` is `0`

### Requirement: Motion

The track, the bars and the thumbs SHALL fade and change color with a transition. When animations are turned off through `KBQ_ANIMATIONS_CONFIG`, an `ANIMATION_MODULE_TYPE` of `NoopAnimations` or `prefers-reduced-motion: reduce` when the track is created, each of them SHALL carry the class `kbq-animations-disabled` and show changes without motion.

#### Scenario: Default

- **WHEN** both bars are drawn with the default configuration
- **THEN** none of the track, the bars and the thumbs has the class `kbq-animations-disabled`

#### Scenario: Animations disabled

- **WHEN** `KBQ_ANIMATIONS_CONFIG` sets `animationsDisabled: true`
- **THEN** the track, both bars and both thumbs have the class `kbq-animations-disabled`

### Requirement: NgModule

`KbqScrollbarModule` SHALL import and export `KbqScrollbar`, `KbqScrollbarViewport` and `KbqNativeScrollbar` for applications that use NgModules.

#### Scenario: Module import

- **WHEN** an NgModule imports `KbqScrollbarModule`
- **THEN** its templates can use `kbq-scrollbar`, `kbqScrollbarViewport` and `kbqNativeScrollbar`
