import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChartStackedBarHorizontal16]',
    template: `
        <svg:g>
            <svg:path
                d="M12 5.8V1.2c0-.11.09-.2.2-.2h2.6c.11 0 .2.09.2.2v4.6zM12 7v5h3V7zM1 9v3h3V9zM1 7.8V3.2c0-.11.09-.2.2-.2h2.6c.11 0 .2.09.2.2v4.6zM6.5 10v2h3v-2zM9.5 8.8h-3V5.2c0-.11.09-.2.2-.2h2.6c.11 0 .2.09.2.2zM1 14.8c0 .11.09.2.2.2h13.6a.2.2 0 0 0 .2-.2v-1.4H1z"
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
export class KbqChartStackedBarHorizontal16 extends KbqSvgIcon {}
