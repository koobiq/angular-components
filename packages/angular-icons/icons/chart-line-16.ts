import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChartLine16]',
    template: `
        <svg:g>
            <svg:path
                d="M2.4 1c.11 0 .2.09.2.2v12.207h12.211c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2H1V1.2c0-.11.09-.2.2-.2z"
            />
            <svg:path
                d="M3.8 12.203h1.128L8.5 8.631l1.859 1.859a.2.2 0 0 0 .282 0l4.283-4.283a.2.2 0 0 0 0-.283l-.848-.848a.2.2 0 0 0-.283 0L10.5 8.369 8.641 6.51a.2.2 0 0 0-.282 0L3.8 11.069z"
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
export class KbqChartLine16 extends KbqSvgIcon {}
