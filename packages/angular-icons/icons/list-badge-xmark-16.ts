import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqListBadgeXmark16]',
    template: `
        <svg:g>
            <svg:path
                d="M3.5 2.243c0 .686-.56 1.243-1.25 1.243S1 2.929 1 2.243C1 1.556 1.56 1 2.25 1s1.25.556 1.25 1.243M3.5 7.447c0 .686-.56 1.243-1.25 1.243S1 8.133 1 7.447c0-.687.56-1.243 1.25-1.243S3.5 6.76 3.5 7.447M2.25 14c.69 0 1.25-.556 1.25-1.243 0-.686-.56-1.243-1.25-1.243S1 12.071 1 12.757C1 13.444 1.56 14 2.25 14M15 2.947a.2.2 0 0 1-.2.2H4.97a.2.2 0 0 1-.2-.2v-1.2c0-.11.09-.2.2-.2h9.83c.11 0 .2.09.2.2zM15 8.047a.2.2 0 0 1-.2.2H4.97a.2.2 0 0 1-.2-.2v-1.2c0-.11.09-.2.2-.2h9.83c.11 0 .2.09.2.2zM8.3 13.557a.2.2 0 0 0 .2-.2v-1.2a.2.2 0 0 0-.2-.2H4.97a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2zM10.442 10.79l1.784 1.784-1.785 1.785a.2.2 0 0 0 0 .283l.566.565a.2.2 0 0 0 .283 0l1.784-1.784 1.785 1.784a.2.2 0 0 0 .282 0l.566-.566a.2.2 0 0 0 0-.282l-1.784-1.785 1.784-1.784a.2.2 0 0 0 0-.283l-.566-.566a.2.2 0 0 0-.282 0l-1.785 1.785-1.784-1.784a.2.2 0 0 0-.283 0l-.566.565a.2.2 0 0 0 0 .283"
            />
        </svg:g>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 16 16',
        width: '16',
        height: '16'
    }
})
export class KbqListBadgeXmark16 extends KbqSvgIcon {}
