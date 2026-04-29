import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-grid-dots-16,[kbqGridDots16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M10.5 3a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0M3 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5M15.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0M8 15.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5m0-3.8a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqGridDots16 extends KbqSvgIcon {}
