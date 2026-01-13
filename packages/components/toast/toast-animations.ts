import { animate, AnimationTriggerMetadata, state, style, transition, trigger } from '@angular/animations';

export const kbqToastAnimations: {
    readonly toastState: AnimationTriggerMetadata;
} = {
    toastState: trigger('state', [
        state('void', style({ transform: 'translateX(100%)', opacity: 0 })),
        transition('* => visible', animate('150ms ease-out', style({ transform: 'translateX(0%)', opacity: 1 }))),
        transition(
            '* => void',
            animate('300ms ease-in', style({ transform: 'translateX(50%)', opacity: 0, height: 0 }))
        )
    ])
};

export const toastState = kbqToastAnimations.toastState;
