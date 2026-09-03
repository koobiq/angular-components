import { animate, AnimationTriggerMetadata, keyframes, state, style, transition, trigger } from '@angular/animations';

/**
 * Animations used by KbqTooltip.
 * @docs-private
 */
export const kbqTooltipAnimations: {
    readonly tooltipState: AnimationTriggerMetadata;
} = {
    /** Animation that transitions a tooltip in and out. */
    tooltipState: trigger('state', [
        state('initial, void, hidden', style({ opacity: 0, transform: 'scale(0)' })),
        // Rests at exactly 1: a fractional scale leaves the tooltip permanently resampled, which softens its
        // text for as long as it is on screen.
        state('visible', style({ transform: 'scale(1)' })),
        transition(
            '* => visible',
            animate(
                '200ms cubic-bezier(0, 0, 0.2, 1)',
                keyframes([
                    style({ opacity: 0, transform: 'scale(0)', offset: 0 }),
                    style({ opacity: 0.5, transform: 'scale(0.9)', offset: 0.5 }),
                    style({ opacity: 1, transform: 'scale(1)', offset: 1 })
                ])
            )
        ),
        transition('* => hidden', animate('100ms cubic-bezier(0, 0, 0.2, 1)', style({ opacity: 0 })))
    ])
};
