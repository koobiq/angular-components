import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChartArea16]',
    template: `
        <svg:g>
            <svg:path d="m4 12 4.049-4.053a.167.167 0 0 1 .236 0L9.417 9.08l4.299-4.304a.167.167 0 0 1 .284.118V12z" />
            <svg:path
                d="M1 1.2c0-.11.09-.2.2-.2h1.2c.11 0 .2.09.2.2v12.2h12.204c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2H1z"
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
export class KbqChartArea16 extends KbqSvgIcon {}
