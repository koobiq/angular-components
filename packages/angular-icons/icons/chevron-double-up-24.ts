import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChevronDoubleUp24]',
    template: `
        <svg:g>
            <svg:path
                d="m12 13.83-7.213 7.083a.305.305 0 0 1-.427 0L3.09 19.667a.304.304 0 0 1 0-.434l8.696-8.538a.305.305 0 0 1 .426 0l8.696 8.539a.304.304 0 0 1 0 .433l-1.269 1.246a.305.305 0 0 1-.427 0z"
            />
            <svg:path
                d="m12 5.472-7.213 7.083a.305.305 0 0 1-.427 0L3.09 11.31a.304.304 0 0 1 0-.433l8.696-8.539a.305.305 0 0 1 .426 0l8.696 8.539a.304.304 0 0 1 0 .433l-1.269 1.246a.305.305 0 0 1-.427 0z"
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
export class KbqChevronDoubleUp24 extends KbqSvgIcon {}
