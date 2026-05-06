import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBreakBlock16]',
    template: `
        <svg:g>
            <svg:path
                d="M1 6.278a.2.2 0 0 1 .306-.17L4.12 7.867a.2.2 0 0 1 0 .34L1.306 9.964A.2.2 0 0 1 1 9.795zM4.404 0c.11 0 .2.09.2.2v4.41c0 .221.18.4.401.4h7.99a.4.4 0 0 0 .4-.4V.2c0-.11.09-.2.2-.2H14.8c.11 0 .2.09.2.2v4.41c0 1.105-.898 2-2.005 2h-7.99A2.003 2.003 0 0 1 3 4.61V.2c0-.11.09-.2.2-.2zM13.596 16a.2.2 0 0 1-.2-.2v-4.401a.4.4 0 0 0-.401-.4h-7.99a.4.4 0 0 0-.4.4V15.8a.2.2 0 0 1-.2.2H3.2a.2.2 0 0 1-.2-.2v-4.401c0-1.105.898-2 2.005-2h7.99c1.107 0 2.005.895 2.005 2V15.8a.2.2 0 0 1-.2.2z"
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
export class KbqBreakBlock16 extends KbqSvgIcon {}
