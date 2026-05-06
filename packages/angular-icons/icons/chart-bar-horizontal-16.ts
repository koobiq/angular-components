import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChartBarHorizontal16]',
    template: `
        <svg:g>
            <svg:path
                d="M1.2 15a.2.2 0 0 1-.2-.2v-1.4h14v1.4a.2.2 0 0 1-.2.2zM1 12V4.2c0-.11.09-.2.2-.2h2.6c.11 0 .2.09.2.2V12zM12 12V1.2c0-.11.09-.2.2-.2h2.6c.11 0 .2.09.2.2V12zM6.5 7.2c0-.11.09-.2.2-.2h2.6c.11 0 .2.09.2.2V12h-3z"
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
export class KbqChartBarHorizontal16 extends KbqSvgIcon {}
