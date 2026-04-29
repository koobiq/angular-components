import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chart-bar-horizontal-24,[kbqChartBarHorizontal24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M1.8 22.5a.3.3 0 0 1-.3-.3v-2.1h21v2.1a.3.3 0 0 1-.3.3zM1.5 18V6.3a.3.3 0 0 1 .3-.3h3.9a.3.3 0 0 1 .3.3V18zM18 18V1.8a.3.3 0 0 1 .3-.3h3.9a.3.3 0 0 1 .3.3V18zM9.75 10.8a.3.3 0 0 1 .3-.3h3.9a.3.3 0 0 1 .3.3V18h-4.5z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChartBarHorizontal24 extends KbqSvgIcon {}
