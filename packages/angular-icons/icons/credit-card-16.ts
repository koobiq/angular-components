import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCreditCard16]',
    template: `
        <svg:g>
            <svg:path
                d="M1.2 2A1.2 1.2 0 0 0 0 3.2v2h16v-2A1.2 1.2 0 0 0 14.8 2zM0 7.2v5.6A1.2 1.2 0 0 0 1.2 14h13.6a1.2 1.2 0 0 0 1.2-1.2V7.2zm1.7 4.4a.2.2 0 0 1-.2-.2v-.8c0-.11.09-.2.2-.2h3.6c.11 0 .2.09.2.2v.8a.2.2 0 0 1-.2.2z"
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
export class KbqCreditCard16 extends KbqSvgIcon {}
