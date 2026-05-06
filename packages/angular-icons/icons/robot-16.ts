import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqRobot16]',
    template: `
        <svg:g>
            <svg:path
                d="M4.9 6.5a.2.2 0 0 0-.2.2v2.1a.2.2 0 0 0 .2.2H7a.2.2 0 0 0 .2-.2V6.7a.2.2 0 0 0-.2-.2zM8.8 6.7a.2.2 0 0 1 .2-.2h2.1c.11 0 .2.09.2.2v2.1a.2.2 0 0 1-.2.2H9a.2.2 0 0 1-.2-.2z"
            />
            <svg:path
                d="M5.2 0a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2h2V3h-4A1.2 1.2 0 0 0 2 4.2v2.2H.7a.2.2 0 0 0-.2.2v3.2c0 .11.09.2.2.2H2v2.8A1.2 1.2 0 0 0 3.2 14h9.602a1.2 1.2 0 0 0 1.2-1.2V10h1.3a.2.2 0 0 0 .2-.2V6.6a.2.2 0 0 0-.2-.2h-1.3V4.2a1.2 1.2 0 0 0-1.2-1.2H8.8V.2a.2.2 0 0 0-.2-.2zM3.6 4.8c0-.11.09-.2.2-.2h8.402c.11 0 .2.09.2.2v7.4a.2.2 0 0 1-.2.2H10v-1.2a.2.2 0 0 0-.2-.2H6.2a.2.2 0 0 0-.2.2v1.2H3.8a.2.2 0 0 1-.2-.2z"
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
export class KbqRobot16 extends KbqSvgIcon {}
