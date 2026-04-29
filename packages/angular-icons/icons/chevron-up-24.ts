import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chevron-up-24,[kbqChevronUp24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="m12 10.005-7.213 7.157a.3.3 0 0 1-.427 0L3.09 15.903a.31.31 0 0 1 0-.438l8.696-8.627a.3.3 0 0 1 .426 0l8.696 8.627a.31.31 0 0 1 0 .438l-1.269 1.259a.3.3 0 0 1-.427 0z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChevronUp24 extends KbqSvgIcon {}
