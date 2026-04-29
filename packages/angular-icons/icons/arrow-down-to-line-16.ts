import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-down-to-line-16,[kbqArrowDownToLine16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M11.575 5.714a.2.2 0 0 0-.281 0L8.8 8.176V1.7a.2.2 0 0 0-.2-.2H7.4a.2.2 0 0 0-.2.2v6.476L4.706 5.714a.2.2 0 0 0-.281 0l-.847.836a.2.2 0 0 0 0 .285L7.86 11.06a.2.2 0 0 0 .281 0l4.281-4.226a.2.2 0 0 0 0-.285zM1 13.8c0 .11.09.2.2.2h13.6a.2.2 0 0 0 .2-.2v-1.2a.2.2 0 0 0-.2-.2H1.2a.2.2 0 0 0-.2.2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowDownToLine16 extends KbqSvgIcon {}
