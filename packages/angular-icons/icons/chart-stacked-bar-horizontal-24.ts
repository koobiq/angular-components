import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChartStackedBarHorizontal24]',
    template: `
        <svg:g>
            <svg:path
                d="M18 8.7V1.8a.3.3 0 0 1 .3-.3h3.9a.3.3 0 0 1 .3.3v6.9zM18 10.5V18h4.5v-7.5zM1.5 13.5V18H6v-4.5zM1.5 11.7V4.8a.3.3 0 0 1 .3-.3h3.9a.3.3 0 0 1 .3.3v6.9zM9.75 15v3h4.5v-3zM14.25 13.2h-4.5V7.8a.3.3 0 0 1 .3-.3h3.9a.3.3 0 0 1 .3.3zM1.5 22.2a.3.3 0 0 0 .3.3h20.4a.3.3 0 0 0 .3-.3v-2.1h-21z"
            />
        </svg:g>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        width: '24',
        height: '24'
    }
})
export class KbqChartStackedBarHorizontal24 extends KbqSvgIcon {}
