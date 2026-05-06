import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqList16]',
    template: `
        <svg:g>
            <svg:path
                d="M3.506 2.785c0 .687-.56 1.243-1.25 1.243s-1.25-.556-1.25-1.243c0-.686.56-1.243 1.25-1.243s1.25.557 1.25 1.243M3.5 7.998c0 .686-.56 1.243-1.25 1.243S1 8.684 1 7.998s.56-1.243 1.25-1.243 1.25.557 1.25 1.243M2.25 14.461c.69 0 1.25-.556 1.25-1.242 0-.687-.56-1.243-1.25-1.243S1 12.532 1 13.218c0 .687.56 1.243 1.25 1.243M15.006 3.49a.2.2 0 0 1-.2.2h-9.83a.2.2 0 0 1-.2-.2v-1.2c0-.11.09-.2.2-.2h9.83c.11 0 .2.09.2.2zM15 8.598a.2.2 0 0 1-.2.2H4.97a.2.2 0 0 1-.2-.2v-1.2c0-.11.09-.2.2-.2h9.83c.11 0 .2.09.2.2zM4.77 13.818c0 .11.09.2.2.2h9.83a.2.2 0 0 0 .2-.2v-1.2a.2.2 0 0 0-.2-.2H4.97a.2.2 0 0 0-.2.2z"
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
export class KbqList16 extends KbqSvgIcon {}
