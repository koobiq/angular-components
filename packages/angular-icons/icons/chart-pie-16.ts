import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chart-pie-16,[kbqChartPie16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M13.307 12.562A7 7 0 0 0 15 7.99a7 7 0 0 0-1.693-4.571L8.742 7.99zM12.565 2.676A6.97 6.97 0 0 0 8.525 1v5.722z"
                />
                <path
                    d="M7.475 1A7.006 7.006 0 0 0 1 7.99C1 11.862 4.134 15 8 15c1.744 0 3.34-.639 4.565-1.695l-5.09-5.097z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChartPie16 extends KbqSvgIcon {}
