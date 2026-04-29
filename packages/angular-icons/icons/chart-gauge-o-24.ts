import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chart-gauge-o-24,[kbqChartGaugeO24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M3.892 13.633c0-4.535 3.63-8.21 8.108-8.21.955 0 1.871.166 2.722.473l1.826-1.85A10.35 10.35 0 0 0 12 3C6.201 3 1.5 7.76 1.5 13.633c0 2.814 1.08 5.374 2.841 7.274a.29.29 0 0 0 .423.005l1.272-1.28a.313.313 0 0 0 .006-.43 8.24 8.24 0 0 1-2.15-5.569M21.576 9.266l-1.849 1.873c.247.786.381 1.625.381 2.494 0 2.15-.814 4.105-2.15 5.569a.31.31 0 0 0 .006.43l1.272 1.28a.29.29 0 0 0 .423-.005 10.67 10.67 0 0 0 2.841-7.274c0-1.556-.33-3.035-.924-4.367"
                />
                <path
                    d="M14.804 13.802c0 1.568-1.255 2.84-2.804 2.84s-2.804-1.272-2.804-2.84 1.256-2.84 2.804-2.84c.333 0 .652.06.949.168l5.36-5.425a.3.3 0 0 1 .425 0L20 6.99a.304.304 0 0 1 0 .426l-5.361 5.427c.106.3.164.623.164.96"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChartGaugeO24 extends KbqSvgIcon {}
