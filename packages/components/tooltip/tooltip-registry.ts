import { Injectable, InjectionToken } from '@angular/core';

/**
 * Default value of the `kbqTooltipSingleInstance` input. Provide `false` at the application level to
 * globally disable the "only one tooltip is visible at a time" behavior.
 */
export const KBQ_TOOLTIP_SINGLE_INSTANCE_DEFAULT = new InjectionToken<boolean>('KbqTooltipSingleInstanceDefault', {
    providedIn: 'root',
    factory: () => true
});

/**
 * Contract of a tooltip taking part in the "only one tooltip is visible at a time" group.
 * @docs-private
 */
export interface KbqExclusiveTooltip {
    /** Hides the tooltip because another one has taken its place. */
    hideAsInactive(): void;
}

/**
 * Keeps track of the single tooltip that is currently visible, so that showing a new one hides the
 * previous. Holds the *trigger*, not the overlay component — the latter is re-created on every show.
 */
@Injectable({ providedIn: 'root' })
export class KbqTooltipRegistry {
    /** Tooltip that currently owns the screen, or `null` when nothing is visible. */
    private visibleTooltip: KbqExclusiveTooltip | null = null;

    /** Marks the tooltip as the only visible one, hiding the previously visible tooltip. */
    setVisible(tooltip: KbqExclusiveTooltip): void {
        if (this.visibleTooltip && this.visibleTooltip !== tooltip) {
            this.visibleTooltip.hideAsInactive();
        }

        this.visibleTooltip = tooltip;
    }

    /**
     * Clears the registry, but only when the given tooltip is still the registered one. The guard
     * matters because hiding the previous tooltip is asynchronous: its `visibleChange(false)` arrives
     * after the new tooltip has already been registered, and must not wipe that newer entry.
     */
    clearVisible(tooltip: KbqExclusiveTooltip): void {
        if (this.visibleTooltip === tooltip) {
            this.visibleTooltip = null;
        }
    }
}
