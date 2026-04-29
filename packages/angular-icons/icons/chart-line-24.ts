import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chart-line-24,[kbqChartLine24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M3.6 1.5a.3.3 0 0 1 .3.3v18.311h18.317a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3H1.5V1.8a.3.3 0 0 1 .3-.3z"
                />
                <path
                    d="M5.7 18.305h1.692l5.358-5.358 2.788 2.788a.3.3 0 0 0 .424 0l6.424-6.424a.3.3 0 0 0 0-.425l-1.272-1.272a.3.3 0 0 0-.425 0l-4.939 4.939-2.788-2.788a.3.3 0 0 0-.424 0L5.7 16.603z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChartLine24 extends KbqSvgIcon {}
