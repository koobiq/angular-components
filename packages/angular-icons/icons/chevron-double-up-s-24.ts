import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chevron-double-up-s-24,[kbqChevronDoubleUpS24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="m12 14.952 5.714 5.583a.305.305 0 0 0 .426 0l1.27-1.246a.304.304 0 0 0 0-.433l-7.197-7.039a.305.305 0 0 0-.426 0L4.59 18.856a.304.304 0 0 0 0 .433l1.269 1.246a.305.305 0 0 0 .427 0z"
                />
                <path
                    d="m12 6.597 5.714 5.583a.305.305 0 0 0 .426 0l1.27-1.246a.304.304 0 0 0 0-.433l-7.197-7.039a.305.305 0 0 0-.426 0L4.59 10.501a.304.304 0 0 0 0 .433L5.86 12.18a.305.305 0 0 0 .427 0z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChevronDoubleUpS24 extends KbqSvgIcon {}
