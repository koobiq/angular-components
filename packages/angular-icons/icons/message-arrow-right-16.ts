import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-message-arrow-right-16,[kbqMessageArrowRight16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M1 4.4A2.4 2.4 0 0 1 3.4 2h9.2A2.4 2.4 0 0 1 15 4.4v6.2a2.4 2.4 0 0 1-2.4 2.4H7.75l-3.425 2.74A.2.2 0 0 1 4 15.584V13h-.6A2.4 2.4 0 0 1 1 10.6zm8.308.319a.2.2 0 0 0-.283 0l-.566.565a.2.2 0 0 0 0 .283l1.335 1.334H4.2a.2.2 0 0 0-.2.2v.8c0 .11.09.2.2.2h5.594L8.459 9.436a.2.2 0 0 0 0 .283l.566.565a.2.2 0 0 0 .283 0l2.641-2.641a.2.2 0 0 0 0-.283z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqMessageArrowRight16 extends KbqSvgIcon {}
