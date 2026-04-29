import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chevron-down-24,[kbqChevronDown24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="m12 13.995 7.214-7.157a.3.3 0 0 1 .426 0l1.269 1.259a.31.31 0 0 1 0 .438l-8.696 8.627a.3.3 0 0 1-.426 0L3.09 8.535a.31.31 0 0 1 0-.438L4.36 6.838a.3.3 0 0 1 .427 0z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChevronDown24 extends KbqSvgIcon {}
