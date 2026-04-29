import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-diamond-16,[kbqDiamond16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M.645 8.141a.2.2 0 0 1 0-.282L7.859.645a.2.2 0 0 1 .282 0l7.214 7.214a.2.2 0 0 1 0 .282l-7.214 7.214a.2.2 0 0 1-.282 0z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqDiamond16 extends KbqSvgIcon {}
