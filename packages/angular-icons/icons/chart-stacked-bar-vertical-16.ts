import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChartStackedBarVertical16]',
    template: `
        <svg:g>
            <svg:path
                d="M7 1H4v3h3zM8.2 4h6.6a.2.2 0 0 0 .2-.2V1.2a.2.2 0 0 0-.2-.2H8.2zM10 12H4v3h6zM11.2 15h1.6a.2.2 0 0 0 .2-.2v-2.6a.2.2 0 0 0-.2-.2h-1.6zM6 6.5H4v3h2zM7.2 9.5v-3h2.6c.11 0 .2.09.2.2v2.6a.2.2 0 0 1-.2.2zM1.2 15a.2.2 0 0 1-.2-.2V1.2c0-.11.09-.2.2-.2h1.4v14z"
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
export class KbqChartStackedBarVertical16 extends KbqSvgIcon {}
