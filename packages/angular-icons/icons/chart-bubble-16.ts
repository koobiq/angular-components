import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chart-bubble-16,[kbqChartBubble16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M10.525 8.38a2.933 2.933 0 1 0 0-5.866 2.933 2.933 0 0 0 0 5.866M5.29 12.373a1.69 1.69 0 1 0 0-3.378 1.69 1.69 0 0 0 0 3.378M13.581 11.375a.998.998 0 1 1-1.996 0 .998.998 0 0 1 1.996 0"
                />
                <path
                    d="M1 1.2c0-.11.09-.2.2-.2h1.2c.11 0 .2.09.2.2v12.2h12.204c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2H1z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChartBubble16 extends KbqSvgIcon {}
