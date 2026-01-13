import { animate, AnimationTriggerMetadata, state, style, transition, trigger } from '@angular/animations';

export function toggleNavbarIcAnimation(): AnimationTriggerMetadata {
    return trigger('toggle', [
        state('0', style({ width: '64px' })),
        state('1', style({ width: '240px' })),
        transition('0 <=> 1', animate('200ms cubic-bezier(0.4, 0, 0.2, 1)'))
    ]);
}

export function toggleNavbarIcItemAnimation(): AnimationTriggerMetadata {
    return trigger('toggle', [
        state('expanded', style({ opacity: 1, marginLeft: 0 })),
        state('collapsed', style({ opacity: 0, marginLeft: '-8px' })),
        transition('collapsed => expanded', animate('200ms 150ms cubic-bezier(0.4, 0, 0.2, 1)')),
        transition('expanded => collapsed', animate('200ms cubic-bezier(0.4, 0, 0.2, 1)'))
    ]);
}
