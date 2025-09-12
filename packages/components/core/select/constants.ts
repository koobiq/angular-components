import { Overlay, RepositionScrollStrategy, ScrollStrategy } from '@angular/cdk/overlay';
import { InjectionToken } from '@angular/core';

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

/** Injection token that determines the scroll handling while a select is open. */
export const KBQ_SELECT_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>('kbq-select-scroll-strategy');

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
