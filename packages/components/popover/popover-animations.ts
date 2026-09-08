import { animate, AnimationTriggerMetadata, state, style, transition, trigger } from '@angular/animations';
import { KbqAnimationCurves, KbqAnimationDurations } from '@koobiq/components/core';

/** Duration of the opening animation. */
const enterDuration = '120ms';

/** Duration of the closing animation. */
const exitDuration = KbqAnimationDurations.Rapid;

/**
 * Animation that transitions a popover in and out.
 *
 * Motion is opt-out rather than unconditional: `KbqPopoverComponent` binds `[@.disabled]` to the user's
 * `prefers-reduced-motion` setting, so the same trigger renders instantly for those users.
 *
 * @docs-private
 */
export const kbqPopoverAnimations: {
    readonly popoverState: AnimationTriggerMetadata;
} = {
    /** Animation that transitions a popover in and out. */
    popoverState: trigger('state', [
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
                `${enterDuration} ${KbqAnimationCurves.DecelerationCurve}`,
                style({
                    opacity: 1,
                    transform: 'scale(1, 1)'
                })
            )
        ),
        transition('* => hidden', animate(`${exitDuration} linear`, style({ opacity: 0 })))
    ])
};
