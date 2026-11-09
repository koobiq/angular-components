import { InjectionToken } from '@angular/core';

/**
 * Default options inherited by every tooltip in the token's scope. A bound input still wins: `kbqTooltipOffset`
 * overrides `offset`, and a binding that changes to `undefined` restores the inherited value.
 */
export interface KbqTooltipDefaultOptions {
    /**
     * Distance in pixels between the tooltip and its trigger, used while `kbqTooltipOffset` is not bound.
     * `null` keeps the gap of the stylesheet.
     */
    readonly offset?: number | null;

    /** Extra CSS class applied to the tooltip's overlay panel. */
    readonly panelClass?: string | string[];
}

/**
 * Default options for the tooltips in the token's scope. Provided in root with an empty-object factory, so
 * behavior stays unchanged unless a component tree — e.g. a navbar, so its items' tooltips inherit the
 * horizontal-navbar panel class and a zero offset — provides its own values.
 *
 * @docs-private
 */
export const KBQ_TOOLTIP_DEFAULT_OPTIONS = new InjectionToken<KbqTooltipDefaultOptions>('kbq-tooltip-default-options', {
    providedIn: 'root',
    factory: () => ({})
});
