import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chart-bubble-24,[kbqChartBubble24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M15.788 12.57a4.4 4.4 0 1 0-.001-8.798 4.4 4.4 0 0 0 .001 8.798M7.934 18.56a2.534 2.534 0 1 0 0-5.068 2.534 2.534 0 0 0 0 5.068M20.372 17.062a1.497 1.497 0 1 1-2.995 0 1.497 1.497 0 0 1 2.995 0"
                />
                <path
                    d="M1.5 1.8a.3.3 0 0 1 .3-.3h1.8a.3.3 0 0 1 .3.3v18.3h18.306a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3H1.5z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChartBubble24 extends KbqSvgIcon {}
