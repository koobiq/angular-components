import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chevrons-up-down-s-24,[kbqChevronsUpDownS24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M6.287 10.305 12 4.722l5.714 5.583a.305.305 0 0 0 .426 0l1.27-1.246a.304.304 0 0 0 0-.433l-7.197-7.039a.305.305 0 0 0-.426 0L4.59 8.626a.304.304 0 0 0 0 .433l1.269 1.246a.305.305 0 0 0 .427 0m11.427 3.39L12 19.278l-5.713-5.583a.305.305 0 0 0-.427 0L4.59 14.94a.304.304 0 0 0 0 .433l7.196 7.039a.305.305 0 0 0 .426 0l7.196-7.039a.304.304 0 0 0 0-.433l-1.269-1.246a.305.305 0 0 0-.427 0"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChevronsUpDownS24 extends KbqSvgIcon {}
