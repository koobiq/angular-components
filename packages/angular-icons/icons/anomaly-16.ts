import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqAnomaly16]',
    template: `
        <svg:g>
            <svg:path
                d="M1 1.2c0-.11.09-.2.2-.2h5.916c.11 0 .2.09.2.2v5.916a.2.2 0 0 1-.2.2H1.2a.2.2 0 0 1-.2-.2zM1 8.884c0-.11.09-.2.2-.2h5.916c.11 0 .2.09.2.2V14.8a.2.2 0 0 1-.2.2H1.2a.2.2 0 0 1-.2-.2zM8.684 4.158a3.158 3.158 0 1 1 6.316 0 3.158 3.158 0 0 1-6.316 0M8.684 8.884c0-.11.09-.2.2-.2H14.8c.11 0 .2.09.2.2V14.8a.2.2 0 0 1-.2.2H8.884a.2.2 0 0 1-.2-.2z"
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
export class KbqAnomaly16 extends KbqSvgIcon {}
