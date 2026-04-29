import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chevron-double-down-24,[kbqChevronDoubleDown24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="m12 10.17 7.214-7.083a.305.305 0 0 1 .426 0l1.269 1.246a.304.304 0 0 1 0 .434l-8.696 8.538a.305.305 0 0 1-.426 0L3.09 4.767a.304.304 0 0 1 0-.434L4.36 3.087a.305.305 0 0 1 .427 0z"
                />
                <path
                    d="m12 18.528 7.214-7.083a.305.305 0 0 1 .426 0l1.269 1.246a.304.304 0 0 1 0 .433l-8.696 8.539a.305.305 0 0 1-.426 0L3.09 13.124a.304.304 0 0 1 0-.433l1.269-1.246a.305.305 0 0 1 .427 0z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChevronDoubleDown24 extends KbqSvgIcon {}
