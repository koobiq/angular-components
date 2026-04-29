import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chart-donut-24,[kbqChartDonut24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M16.554 9.364a5.25 5.25 0 0 1 .696 2.621 5.26 5.26 0 0 1-2.05 4.174l2.815 4.446a10.5 10.5 0 0 0 4.485-8.62c0-2.408-.808-4.627-2.168-6.4zM19.117 4.255A10.45 10.45 0 0 0 12.9 1.509v5.289c.942.163 1.8.579 2.499 1.175zM11.1 1.509c-5.378.457-9.6 4.973-9.6 10.476C1.5 17.792 6.201 22.5 12 22.5c1.593 0 3.104-.356 4.457-.992L13.602 17a5.257 5.257 0 0 1-6.852-5.015 5.26 5.26 0 0 1 4.35-5.187z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChartDonut24 extends KbqSvgIcon {}
