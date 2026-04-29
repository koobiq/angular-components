import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-bars-sort-center-16,[kbqBarsSortCenter16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M3.7 8.8a.2.2 0 0 1-.2-.2V7.4c0-.11.09-.2.2-.2h8.6c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2zM6.2 13a.2.2 0 0 1-.2-.2v-1.2c0-.11.09-.2.2-.2h3.6c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2zM1.2 4.6a.2.2 0 0 1-.2-.2V3.2c0-.11.09-.2.2-.2h13.6c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBarsSortCenter16 extends KbqSvgIcon {}
