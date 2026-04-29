import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-branch-24,[kbqBranch24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M6.9 7.363A3.001 3.001 0 0 0 6 1.5a3 3 0 0 0-.9 5.863v9.274A3.001 3.001 0 0 0 6 22.5a3 3 0 0 0 .9-5.863V14.4h3.6c4.434 0 8.187-2.915 9.448-6.933a3 3 0 1 0-1.801-.289A8.1 8.1 0 0 1 10.5 12.6H6.9z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBranch24 extends KbqSvgIcon {}
