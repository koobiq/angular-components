import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-tag-multiple-16,[kbqTagMultiple16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M14.94 7.79a.2.2 0 0 0 .06-.143V2.203A.203.203 0 0 0 14.797 2H9.35a.2.2 0 0 0-.143.06L2.351 8.911a1.213 1.213 0 0 0 0 1.72l4.014 4.012a1.217 1.217 0 0 0 1.72 0zM9.999 5.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0M.541 5.489 1.295 8.3q.094-.123.207-.236l5.57-5.567L1.39 4.02a1.2 1.2 0 0 0-.849 1.47"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTagMultiple16 extends KbqSvgIcon {}
