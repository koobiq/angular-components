import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-anomaly-16,[kbqAnomaly16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M1 1.2c0-.11.09-.2.2-.2h5.916c.11 0 .2.09.2.2v5.916a.2.2 0 0 1-.2.2H1.2a.2.2 0 0 1-.2-.2zM1 8.884c0-.11.09-.2.2-.2h5.916c.11 0 .2.09.2.2V14.8a.2.2 0 0 1-.2.2H1.2a.2.2 0 0 1-.2-.2zM8.684 4.158a3.158 3.158 0 1 1 6.316 0 3.158 3.158 0 0 1-6.316 0M8.684 8.884c0-.11.09-.2.2-.2H14.8c.11 0 .2.09.2.2V14.8a.2.2 0 0 1-.2.2H8.884a.2.2 0 0 1-.2-.2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqAnomaly16 extends KbqSvgIcon {}
