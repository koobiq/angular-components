import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-time-messenger-16,[kbqTimeMessenger16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M10.94 4.141C12.6 2.021 16 3.208 16 5.901v4.19c0 2.7-3.4 3.886-5.06 1.77l-.042-.052-2.897-3.805 2.897-3.81zM0 5.906c0-2.693 3.402-3.88 5.06-1.761l.042.055 2.897 3.804L5.102 11.8l-.041.053C3.4 13.972 0 12.786 0 10.092z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTimeMessenger16 extends KbqSvgIcon {}
