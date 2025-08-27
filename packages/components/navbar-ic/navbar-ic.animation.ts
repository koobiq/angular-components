import { animate, AnimationTriggerMetadata, state, style, transition, trigger } from '@angular/animations';

export function toggleNavbarIcAnimation(): AnimationTriggerMetadata {
    return trigger('toggle', [
        state('0', style({ width: '64px' })),
        state('1', style({ width: '240px' })),
        transition('0 <=> 1', animate('150ms ease-out'))]);
}
