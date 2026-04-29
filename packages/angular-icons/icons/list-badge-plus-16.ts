import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-list-badge-plus-16,[kbqListBadgePlus16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M3.5 2.243c0 .686-.56 1.243-1.25 1.243S1 2.929 1 2.243C1 1.556 1.56 1 2.25 1s1.25.556 1.25 1.243M3.5 7.447c0 .686-.56 1.243-1.25 1.243S1 8.133 1 7.447c0-.687.56-1.243 1.25-1.243S3.5 6.76 3.5 7.447M2.25 14c.69 0 1.25-.556 1.25-1.243 0-.686-.56-1.243-1.25-1.243S1 12.071 1 12.757C1 13.444 1.56 14 2.25 14M15 2.947a.2.2 0 0 1-.2.2H4.97a.2.2 0 0 1-.2-.2v-1.2c0-.11.09-.2.2-.2h9.83c.11 0 .2.09.2.2zM15 8.047a.2.2 0 0 1-.2.2H4.97a.2.2 0 0 1-.2-.2v-1.2c0-.11.09-.2.2-.2h9.83c.11 0 .2.09.2.2zM4.77 13.357c0 .11.09.2.2.2H8.6a.2.2 0 0 0 .2-.2v-1.2a.2.2 0 0 0-.2-.2H4.97a.2.2 0 0 0-.2.2zM12.674 9.7a.2.2 0 0 0-.2.2v2.274H10.2a.2.2 0 0 0-.2.2v.8c0 .11.09.2.2.2h2.274V15.5c0 .11.09.2.2.2h.8a.2.2 0 0 0 .2-.2v-2.126H15.8a.2.2 0 0 0 .2-.2v-.8a.2.2 0 0 0-.2-.2h-2.126V9.9a.2.2 0 0 0-.2-.2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqListBadgePlus16 extends KbqSvgIcon {}
