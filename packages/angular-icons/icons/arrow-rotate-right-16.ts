import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-rotate-right-16,[kbqArrowRotateRight16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M4.18 11.818a5.4 5.4 0 1 1 7.637 0l-.947-.946a.2.2 0 0 0-.336.096l-.908 3.933a.2.2 0 0 0 .24.24l3.933-.908a.2.2 0 0 0 .097-.336l-.276-.275-.672-.672a7 7 0 1 0-5.802 1.998.196.196 0 0 0 .214-.15l.31-1.29a.102.102 0 0 0-.092-.124 5.38 5.38 0 0 1-3.398-1.566"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowRotateRight16 extends KbqSvgIcon {}
