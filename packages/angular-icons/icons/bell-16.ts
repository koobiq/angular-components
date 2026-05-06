import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBell16]',
    template: `
        <svg:g>
            <svg:path
                d="M9.113 1.756q.01-.071.01-.144C9.122.998 8.62.5 8 .5a1.117 1.117 0 0 0-1.113 1.256A4.37 4.37 0 0 0 3.648 5.98v3.756l-2.069 1.619a.2.2 0 0 0-.076.156l-.002.468c0 .11.089.2.2.2h12.598a.2.2 0 0 0 .2-.2l-.002-.468a.2.2 0 0 0-.076-.156l-2.07-1.62v.002V5.98a4.37 4.37 0 0 0-3.238-4.224M10.015 13.384c0 1.169-.9 2.116-2.008 2.116S6 14.553 6 13.384z"
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
export class KbqBell16 extends KbqSvgIcon {}
