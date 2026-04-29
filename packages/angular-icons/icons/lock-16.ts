import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-lock-16,[kbqLock16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M8 1a3.6 3.6 0 0 0-3.6 3.6V7H3.2A1.2 1.2 0 0 0 2 8.2v5.6A1.2 1.2 0 0 0 3.2 15h9.6a1.2 1.2 0 0 0 1.2-1.2V8.2A1.2 1.2 0 0 0 12.8 7h-1.2V4.6A3.6 3.6 0 0 0 8 1m2 6H6V4.6a2 2 0 1 1 4 0z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqLock16 extends KbqSvgIcon {}
