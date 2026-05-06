import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqListCircleXmark16]',
    template: `
        <svg:g>
            <svg:path
                d="M5.629 8.457a.2.2 0 0 1 .283 0l1.131 1.13a.2.2 0 0 1 0 .284L5.414 11.5l1.626 1.626a.2.2 0 0 1 0 .282L5.908 14.54a.2.2 0 0 1-.282 0L4 12.914l-1.629 1.63a.2.2 0 0 1-.282 0L.956 13.412a.2.2 0 0 1 0-.282l1.63-1.63L.958 9.874a.2.2 0 0 1 0-.283L2.091 8.46a.2.2 0 0 1 .283 0L4 10.086zM15.8 10c.11 0 .2.09.2.2v2.6a.2.2 0 0 1-.2.2H9.2a.2.2 0 0 1-.2-.2v-2.6c0-.11.09-.2.2-.2zM4 1a3 3 0 1 1 0 6 3 3 0 0 1 0-6M15.8 2.5c.11 0 .2.09.2.2v2.6a.2.2 0 0 1-.2.2H9.2a.2.2 0 0 1-.2-.2V2.7c0-.11.09-.2.2-.2z"
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
export class KbqListCircleXmark16 extends KbqSvgIcon {}
