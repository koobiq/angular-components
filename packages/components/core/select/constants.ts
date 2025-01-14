import { Overlay, RepositionScrollStrategy, ScrollStrategy } from '@angular/cdk/overlay';
import { InjectionToken } from '@angular/core';

/**
 * @TODO: should be removed within refactoring (#DS-3298)
 * The max height of the select's overlay panel
 * @deprecated
 */
export const SELECT_PANEL_MAX_HEIGHT = 224;

/**
 * @TODO: should be removed within refactoring (#DS-3298)
 * The panel's padding on the x-axis
 * @deprecated
 */
export const SELECT_PANEL_PADDING_X = 0;

/**
 * @TODO: should be removed within refactoring (#DS-3298)
 * The panel's x-axis padding if it is indented (e.g. there is an option group).
 * @deprecated
 */
export const SELECT_PANEL_INDENT_PADDING_X = SELECT_PANEL_PADDING_X * 2;

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
