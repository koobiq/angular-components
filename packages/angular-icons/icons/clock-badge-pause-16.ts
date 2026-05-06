import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqClockBadgePause16]',
    template: `
        <svg:g>
            <svg:path d="M9.6 13.159A5.4 5.4 0 1 1 13.396 7.8h1.601A7 7 0 1 0 9.6 14.816z" />
            <svg:path
                d="M9 8.8a.2.2 0 0 1-.2.2H4.667a.2.2 0 0 1-.2-.2V7.6c0-.11.09-.2.2-.2H7.4v-3c0-.11.09-.2.2-.2h1.2c.11 0 .2.09.2.2zM10.8 9.2c0-.11.09-.2.2-.2h1.6c.11 0 .2.09.2.2v6.6a.2.2 0 0 1-.2.2H11a.2.2 0 0 1-.2-.2zM14 9.2c0-.11.09-.2.2-.2h1.6c.11 0 .2.09.2.2v6.6a.2.2 0 0 1-.2.2h-1.6a.2.2 0 0 1-.2-.2z"
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
export class KbqClockBadgePause16 extends KbqSvgIcon {}
