import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-circle-minus-s-16,[kbqCircleMinusS16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M3.757 12.243a6 6 0 1 0 8.486-8.485 6 6 0 0 0-8.486 8.485M5.2 7.4h5.6c.11 0 .2.09.2.2v.8a.2.2 0 0 1-.2.2H5.2a.2.2 0 0 1-.2-.2v-.8c0-.11.09-.2.2-.2"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCircleMinusS16 extends KbqSvgIcon {}
