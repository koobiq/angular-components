import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-file-code-o-16,[kbqFileCodeO16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M9.851 10 8.417 8.566a.2.2 0 0 1 0-.283l.566-.566a.2.2 0 0 1 .283 0l2.141 2.142a.2.2 0 0 1 0 .282l-2.141 2.142a.2.2 0 0 1-.283 0l-.566-.566a.2.2 0 0 1 0-.283zM7.583 11.717a.2.2 0 0 0 0-.283L6.148 10l1.435-1.434a.2.2 0 0 0 0-.283l-.566-.566a.2.2 0 0 0-.283 0L4.593 9.86a.2.2 0 0 0 0 .283l2.141 2.14a.2.2 0 0 0 .283 0z"
                />
                <path
                    d="M9.917 0a.2.2 0 0 1 .142.059L13.94 3.94a.2.2 0 0 1 .059.142V14.8a1.2 1.2 0 0 1-1.2 1.2H3.2A1.2 1.2 0 0 1 2 14.8V1.2A1.2 1.2 0 0 1 3.2 0zM9 1.6H3.8a.2.2 0 0 0-.2.2v12.4c0 .11.09.2.2.2h8.4a.2.2 0 0 0 .2-.2V5H9.2a.2.2 0 0 1-.2-.2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFileCodeO16 extends KbqSvgIcon {}
