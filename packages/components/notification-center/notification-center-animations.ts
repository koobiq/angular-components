import { animate, AnimationTriggerMetadata, state, style, transition, trigger } from '@angular/animations';

/** @docs-private */
export const KbqNotificationCenterAnimations: {
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
                '120ms cubic-bezier(0, 0, 0.2, 1)',
                style({
                    opacity: 1,
                    transform: 'scale(1, 1)'
                })
            )
        ),
        transition('* => hidden', animate('100ms linear', style({ opacity: 0 })))
    ])
};
