import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chart-line-multiple-24,[kbqChartLineMultiple24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M3.9 1.8a.3.3 0 0 0-.3-.3H1.8a.3.3 0 0 0-.3.3v20.711h20.717a.3.3 0 0 0 .3-.3v-1.8a.3.3 0 0 0-.3-.3H3.9z"
                />
                <path
                    d="M5.7 16.247v-3.394l8.338-8.338a.3.3 0 0 1 .424 0L18 8.053l2.69-2.69a.3.3 0 0 1 .424 0l1.272 1.273a.3.3 0 0 1 0 .425l-4.174 4.174a.3.3 0 0 1-.424 0L14.25 7.697z"
                />
                <path
                    d="M10.242 18.305H6.848l7.19-7.19a.3.3 0 0 1 .424 0L18 14.653l2.69-2.69a.3.3 0 0 1 .424 0l1.272 1.273a.3.3 0 0 1 0 .425l-4.174 4.174a.3.3 0 0 1-.424 0l-3.538-3.538z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChartLineMultiple24 extends KbqSvgIcon {}
