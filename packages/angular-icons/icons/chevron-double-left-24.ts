import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChevronDoubleLeft24]',
    template: `
        <svg:g>
            <svg:path
                d="m13.83 12 7.083 7.214a.305.305 0 0 1 0 .426l-1.246 1.269a.304.304 0 0 1-.434 0l-8.538-8.696a.305.305 0 0 1 0-.426l8.539-8.696a.304.304 0 0 1 .433 0l1.246 1.269a.305.305 0 0 1 0 .427z"
            />
            <svg:path
                d="m5.472 12 7.083 7.214a.305.305 0 0 1 0 .426L11.31 20.91a.304.304 0 0 1-.433 0l-8.539-8.696a.305.305 0 0 1 0-.426l8.539-8.696a.304.304 0 0 1 .433 0l1.246 1.269a.305.305 0 0 1 0 .427z"
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
export class KbqChevronDoubleLeft24 extends KbqSvgIcon {}
