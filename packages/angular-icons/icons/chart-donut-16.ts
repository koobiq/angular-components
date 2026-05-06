import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChartDonut16]',
    template: `
        <svg:g>
            <svg:path
                d="M11.036 6.243A3.5 3.5 0 0 1 11.5 7.99a3.5 3.5 0 0 1-1.367 2.783l1.877 2.964A7 7 0 0 0 15 7.99a7 7 0 0 0-1.445-4.266zM12.745 2.837A6.97 6.97 0 0 0 8.6 1.006v3.526c.628.109 1.2.386 1.666.783zM7.4 1.006A7.007 7.007 0 0 0 1 7.99C1 11.862 4.134 15 8 15c1.062 0 2.07-.237 2.971-.66l-1.903-3.006A3.505 3.505 0 0 1 4.5 7.99a3.51 3.51 0 0 1 2.9-3.459z"
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
export class KbqChartDonut16 extends KbqSvgIcon {}
