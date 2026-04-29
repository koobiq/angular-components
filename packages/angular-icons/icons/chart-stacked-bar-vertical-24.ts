import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chart-stacked-bar-vertical-24,[kbqChartStackedBarVertical24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M10.5 1.5H6V6h4.5zM12.3 6h9.9a.3.3 0 0 0 .3-.3V1.8a.3.3 0 0 0-.3-.3h-9.9zM15 18H6v4.5h9zM16.8 22.5h2.4a.3.3 0 0 0 .3-.3v-3.9a.3.3 0 0 0-.3-.3h-2.4zM9 9.75H6v4.5h3zM10.8 14.25v-4.5h3.9a.3.3 0 0 1 .3.3v3.9a.3.3 0 0 1-.3.3zM1.8 22.5a.3.3 0 0 1-.3-.3V1.8a.3.3 0 0 1 .3-.3h2.1v21z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChartStackedBarVertical24 extends KbqSvgIcon {}
