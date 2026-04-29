import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-bars-sort-bottom-16,[kbqBarsSortBottom16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M1.2 7.2a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2h9.6a.2.2 0 0 0 .2-.2V7.4a.2.2 0 0 0-.2-.2zM1.2 3a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2h4.6a.2.2 0 0 0 .2-.2V3.2a.2.2 0 0 0-.2-.2zM1.2 11.4a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2h13.6a.2.2 0 0 0 .2-.2v-1.2a.2.2 0 0 0-.2-.2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBarsSortBottom16 extends KbqSvgIcon {}
