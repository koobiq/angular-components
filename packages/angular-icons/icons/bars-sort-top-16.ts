import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBarsSortTop16]',
    template: `
        <svg:g>
            <svg:path
                d="M1.2 8.8a.2.2 0 0 1-.2-.2V7.4c0-.11.09-.2.2-.2h9.6c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2zM1.2 13a.2.2 0 0 1-.2-.2v-1.2c0-.11.09-.2.2-.2h4.6c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2zM1.2 4.6a.2.2 0 0 1-.2-.2V3.2c0-.11.09-.2.2-.2h13.6c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2z"
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
export class KbqBarsSortTop16 extends KbqSvgIcon {}
