import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-up-s-24,[kbqArrowUpS24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="m13.18 7.42 3.784 3.742a.3.3 0 0 0 .426 0l1.269-1.259a.31.31 0 0 0 0-.438l-6.446-6.377a.3.3 0 0 0-.426 0L5.34 9.465a.31.31 0 0 0 0 .438l1.269 1.259a.3.3 0 0 0 .427 0L10.77 7.47v13.228a.3.3 0 0 0 .3.302h1.809a.3.3 0 0 0 .3-.302z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowUpS24 extends KbqSvgIcon {}
