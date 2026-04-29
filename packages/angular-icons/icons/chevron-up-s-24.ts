import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chevron-up-s-24,[kbqChevronUpS24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="m12 11.13-4.963 4.907a.3.3 0 0 1-.427 0L5.34 14.778a.31.31 0 0 1 0-.438l6.446-6.377a.3.3 0 0 1 .426 0l6.446 6.377a.31.31 0 0 1 0 .438l-1.269 1.259a.3.3 0 0 1-.427 0z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChevronUpS24 extends KbqSvgIcon {}
