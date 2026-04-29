import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chevron-double-down-s-24,[kbqChevronDoubleDownS24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="m12 9.045 5.714-5.583a.305.305 0 0 1 .426 0l1.27 1.246a.304.304 0 0 1 0 .433l-7.197 7.04a.305.305 0 0 1-.426 0L4.59 5.14a.304.304 0 0 1 0-.433L5.86 3.462a.305.305 0 0 1 .427 0z"
                />
                <path
                    d="m12 17.4 5.714-5.583a.305.305 0 0 1 .426 0l1.27 1.246a.304.304 0 0 1 0 .433l-7.197 7.04a.305.305 0 0 1-.426 0l-7.196-7.04a.304.304 0 0 1 0-.433l1.269-1.246a.305.305 0 0 1 .427 0z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChevronDoubleDownS24 extends KbqSvgIcon {}
