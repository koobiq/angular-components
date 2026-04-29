import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-ruler-24,[kbqRuler24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M6.519 23.911a.303.303 0 0 1-.43 0l-6-6a.303.303 0 0 1 0-.43l1.929-1.929 3.535 3.536c.119.118.31.118.429 0l.857-.857a.303.303 0 0 0 0-.429l-3.535-3.535L6.1 11.47l2.463 2.463c.119.119.31.119.43 0l.856-.857a.303.303 0 0 0 0-.429l-2.463-2.463 2.797-2.797 3.535 3.535c.118.118.31.118.429 0l.857-.857a.303.303 0 0 0 0-.429l-3.536-3.535 2.798-2.797 2.463 2.463c.119.119.31.119.429 0l.857-.857a.303.303 0 0 0 0-.428l-2.464-2.464 1.93-1.93a.303.303 0 0 1 .428 0l6.001 6.002a.303.303 0 0 1 0 .429z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqRuler24 extends KbqSvgIcon {}
