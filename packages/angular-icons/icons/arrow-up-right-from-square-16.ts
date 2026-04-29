import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-up-right-from-square-16,[kbqArrowUpRightFromSquare16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M4.8 4.6a.2.2 0 0 0 .2-.2V3.2a.2.2 0 0 0-.2-.2H2.2a.2.2 0 0 0-.2.2v10.6c0 .11.09.2.2.2h10.6a.2.2 0 0 0 .2-.2v-2.741a.2.2 0 0 0-.2-.2h-1.2a.2.2 0 0 0-.2.2V12.2a.2.2 0 0 1-.2.2H3.8a.2.2 0 0 1-.2-.2V4.8c0-.11.09-.2.2-.2z"
                />
                <path
                    d="M15 6.96a.2.2 0 0 1-.2.2h-1.2a.2.2 0 0 1-.2-.2V3.738L6.597 10.54a.2.2 0 0 1-.283 0l-.849-.848a.2.2 0 0 1 0-.283l6.81-6.809h-3.23a.2.2 0 0 1-.2-.2V1.2c0-.11.09-.2.2-.2H14.8c.11 0 .2.09.2.2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowUpRightFromSquare16 extends KbqSvgIcon {}
