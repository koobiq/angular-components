import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chevron-double-left-24,[kbqChevronDoubleLeft24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="m13.83 12 7.083 7.214a.305.305 0 0 1 0 .426l-1.246 1.269a.304.304 0 0 1-.434 0l-8.538-8.696a.305.305 0 0 1 0-.426l8.539-8.696a.304.304 0 0 1 .433 0l1.246 1.269a.305.305 0 0 1 0 .427z"
                />
                <path
                    d="m5.472 12 7.083 7.214a.305.305 0 0 1 0 .426L11.31 20.91a.304.304 0 0 1-.433 0l-8.539-8.696a.305.305 0 0 1 0-.426l8.539-8.696a.304.304 0 0 1 .433 0l1.246 1.269a.305.305 0 0 1 0 .427z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChevronDoubleLeft24 extends KbqSvgIcon {}
