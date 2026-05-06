import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChartLineMultiple24]',
    template: `
        <svg:g>
            <svg:path
                d="M3.9 1.8a.3.3 0 0 0-.3-.3H1.8a.3.3 0 0 0-.3.3v20.711h20.717a.3.3 0 0 0 .3-.3v-1.8a.3.3 0 0 0-.3-.3H3.9z"
            />
            <svg:path
                d="M5.7 16.247v-3.394l8.338-8.338a.3.3 0 0 1 .424 0L18 8.053l2.69-2.69a.3.3 0 0 1 .424 0l1.272 1.273a.3.3 0 0 1 0 .425l-4.174 4.174a.3.3 0 0 1-.424 0L14.25 7.697z"
            />
            <svg:path
                d="M10.242 18.305H6.848l7.19-7.19a.3.3 0 0 1 .424 0L18 14.653l2.69-2.69a.3.3 0 0 1 .424 0l1.272 1.273a.3.3 0 0 1 0 .425l-4.174 4.174a.3.3 0 0 1-.424 0l-3.538-3.538z"
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
export class KbqChartLineMultiple24 extends KbqSvgIcon {}
