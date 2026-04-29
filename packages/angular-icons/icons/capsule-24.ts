import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-capsule-24,[kbqCapsule24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M12 3.302A6.15 6.15 0 0 1 20.699 12L12 20.699A6.15 6.15 0 0 1 3.302 12zm-1.81 5.09a.29.29 0 0 0 0 .41l5.009 5.007a.29.29 0 0 0 .41 0l3.45-3.45a3.831 3.831 0 0 0-5.419-5.417z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCapsule24 extends KbqSvgIcon {}
