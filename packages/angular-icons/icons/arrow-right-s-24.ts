import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-right-s-24,[kbqArrowRightS24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="m16.58 10.82-3.742-3.783a.303.303 0 0 1 0-.427l1.259-1.269a.31.31 0 0 1 .438 0l6.377 6.446a.3.3 0 0 1 0 .426l-6.377 6.446a.31.31 0 0 1-.438 0l-1.259-1.269a.303.303 0 0 1 0-.427l3.692-3.735H3.302A.3.3 0 0 1 3 12.93V11.12a.3.3 0 0 1 .302-.3z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowRightS24 extends KbqSvgIcon {}
