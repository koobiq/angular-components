import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-thumbs-up-16,[kbqThumbsUp16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M8.847 1.063a.194.194 0 0 1 .242-.036q.236.14.466.287c.445.284.658.819.526 1.322q-.367 1.406-.732 2.812h4.44c.669 0 1.211.53 1.211 1.184v1.27q0 .244-.099.468c-.342.771-1.499 3.366-2.263 4.965-.196.41-.615.665-1.077.665H4.237V6.106c.801-.944 3.988-4.374 4.61-5.043M1 7.284C1 6.63 1.542 6.1 2.21 6.1h.816V14h-.815C1.542 14 1 13.47 1 12.816z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqThumbsUp16 extends KbqSvgIcon {}
