import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-clipboard-check-16,[kbqClipboardCheck16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M10.8 0A1.2 1.2 0 0 1 12 1.2V2h.8A1.2 1.2 0 0 1 14 3.2v11.6a1.2 1.2 0 0 1-1.2 1.2H3.2A1.2 1.2 0 0 1 2 14.8V3.2A1.2 1.2 0 0 1 3.2 2H4v-.8A1.2 1.2 0 0 1 5.2 0zm-.01 6.647a.2.2 0 0 0-.284 0l-3.149 3.15-1.863-1.863a.2.2 0 0 0-.283 0l-.565.565a.2.2 0 0 0 0 .283l2.57 2.57a.2.2 0 0 0 .283 0l3.856-3.856a.2.2 0 0 0 0-.282zM5.8 1.601a.2.2 0 0 0-.2.199v.8c0 .11.09.2.2.2h4.4a.2.2 0 0 0 .2-.2v-.8a.2.2 0 0 0-.2-.2z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqClipboardCheck16 extends KbqSvgIcon {}
