import { animate, AnimationTriggerMetadata, state, style, transition, trigger } from '@angular/animations';
import { KbqAnimationCurves, KbqAnimationDurations } from '@koobiq/components/core';

/**
 * Note: `KbqAppSwitcherComponent` registers this trigger but never binds `[@state]`, so the popup currently
 * appears without motion. Wiring it up (as the popover and tooltip templates do) must also gate the animation
 * behind `prefers-reduced-motion`, e.g. with an `[@.disabled]` host binding.
 * @docs-private
 */
export const kbqAppSwitcherAnimations: {
    readonly state: AnimationTriggerMetadata;
} = {
    /** Animation that transitions a tooltip in and out. */
    state: trigger('state', [
        state(
            'initial',
            style({
                opacity: 0,
                transform: 'scale(1, 0.8)'
            })
        ),
        transition(
            '* => visible',
            animate(
                `120ms ${KbqAnimationCurves.DecelerationCurve}`,
                style({
                    opacity: 1,
                    transform: 'scale(1, 1)'
                })
            )
        ),
        transition('* => hidden', animate(`${KbqAnimationDurations.Rapid} linear`, style({ opacity: 0 })))
    ])
};
