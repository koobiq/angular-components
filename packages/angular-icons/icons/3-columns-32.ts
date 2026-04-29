import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-3-columns-32,[kbq3Columns32]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <path
                d="M25 27a2 2 0 0 0 2-2V7.002a2 2 0 0 0-2.002-2L6 5.018a2 2 0 0 0-1.999 2V25a2 2 0 0 0 2 2zM6 25V7.016L11 7v18zm12 0h-5V7.016L18 7zm2 0V7.016L25 7v18z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Kbq3Columns32 extends KbqSvgIcon {}
