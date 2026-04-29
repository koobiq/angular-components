import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chevron-right-s-16,[kbqChevronRightS16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M8.852 8 5.13 11.809a.203.203 0 0 0 0 .285l.83.845c.08.081.21.081.29 0l4.692-4.797a.203.203 0 0 0 0-.284L6.249 3.06a.2.2 0 0 0-.288 0l-.831.846a.203.203 0 0 0 0 .284z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChevronRightS16 extends KbqSvgIcon {}
