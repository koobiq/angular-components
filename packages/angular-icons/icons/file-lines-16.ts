import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-file-lines-16,[kbqFileLines16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M2 1.2A1.2 1.2 0 0 1 3.2 0h9.6A1.2 1.2 0 0 1 14 1.2v13.6a1.2 1.2 0 0 1-1.2 1.2H3.2A1.2 1.2 0 0 1 2 14.8zM8 13v-.8a.2.2 0 0 0-.2-.2H4.2a.2.2 0 0 0-.2.2v.8c0 .11.09.2.2.2h3.6A.2.2 0 0 0 8 13m-4-3c0 .11.09.2.2.2h7.6a.2.2 0 0 0 .2-.2v-.8a.2.2 0 0 0-.2-.2H4.2a.2.2 0 0 0-.2.2zm8-3v-.8a.2.2 0 0 0-.2-.2H4.2a.2.2 0 0 0-.2.2V7c0 .11.09.2.2.2h7.6A.2.2 0 0 0 12 7M4 4c0 .11.09.2.2.2h7.6A.2.2 0 0 0 12 4v-.8a.2.2 0 0 0-.2-.2H4.2a.2.2 0 0 0-.2.2z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFileLines16 extends KbqSvgIcon {}
