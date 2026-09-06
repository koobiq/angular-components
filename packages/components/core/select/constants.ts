import { Overlay, RepositionScrollStrategy, ScrollStrategy } from '@angular/cdk/overlay';
import { inject, InjectionToken } from '@angular/core';

/**
 * Minimum option count threshold for displaying select search.
 * Search is hidden when fewer options are available.
 */
export const KBQ_SELECT_SEARCH_MIN_OPTIONS_THRESHOLD = 10;

/**
 * The select panel will only "fit" inside the viewport if it is positioned at
 * this value or more away from the viewport boundary.
 */
export const SELECT_PANEL_VIEWPORT_PADDING = 8;

/**
 * Injection token that determines the scroll handling while a select is open.
 *
 * The root default keeps the select usable when it is reached outside `KbqSelectModule`'s injector - imported
 * as a bare standalone component, pulled in through another standalone component (`KbqTimezoneSelect`,
 * `KbqCalendarHeader`), or rendered in a component built from the root injector, as `KbqModalService` does.
 * Providing the token anywhere still wins over this default.
 */
export const KBQ_SELECT_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>('kbq-select-scroll-strategy', {
    providedIn: 'root',
    factory: () => kbqSelectScrollStrategyProviderFactory(inject(Overlay))
});

/** @docs-private */
export function kbqSelectScrollStrategyProviderFactory(overlay: Overlay): () => RepositionScrollStrategy {
    return () => overlay.scrollStrategies.reposition();
}

/** @docs-private */
export const KBQ_SELECT_SCROLL_STRATEGY_PROVIDER = {
    provide: KBQ_SELECT_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: kbqSelectScrollStrategyProviderFactory
};
