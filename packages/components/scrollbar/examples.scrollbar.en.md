## Scrollbar visibility

The `kbqScrollbarVisibility` input controls when the custom track/thumb are shown — `hover`, `always`, `scroll`, or `hidden`; scrolling itself always stays functional.

<!-- example(private-scrollbar-visibility) -->

## Virtual scroll

The `kbqScrollbarVirtualViewport` directive marks a nested `cdk-virtual-scroll-viewport` as the element `kbqScrollbar` should measure, listen to, and scroll — instead of its own host.

<!-- example(private-scrollbar-virtual-scroll) -->

## Programmatic scrollbar control

Via `exportAs="kbqScrollbar"`, the directive exposes `scrollTo`, `scrollToElement`, `scrollToTop`/`scrollToBottom`, `scrollStart`/`scrollEnd`, and the `isTopReached`/`isBottomReached`/`isStartReached`/`isEndReached` signals.

<!-- example(private-scrollbar-scroll-to) -->

## RTL support

The scrollbar tracks ancestor direction (e.g. `Directionality`/`dir`) and adjusts drag, `scrollStart`/`scrollEnd`, and edge-reached state accordingly.

<!-- example(private-scrollbar-rtl) -->

## Native fallback

Setting `native: true` via `kbqScrollbarConfigProvider` makes the directive fall back to the browser's native scrollbar entirely, bypassing the custom track/thumb — the same behavior applied automatically on coarse-pointer (touch) devices.

<!-- example(private-scrollbar-native) -->

## Disabling interaction

The `kbqScrollbarDisableInteraction` input keeps scrolling functional while disabling drag-on-thumb and click-on-track.

<!-- example(private-scrollbar-disable-interaction) -->
