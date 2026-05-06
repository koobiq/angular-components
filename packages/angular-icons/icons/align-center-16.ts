import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqAlignCenter16]',
    template: `
        <svg:g>
            <svg:path
                d="M3 13.8c0 .11.09.2.2.2h9.6a.2.2 0 0 0 .2-.2v-1.2a.2.2 0 0 0-.2-.2H3.2a.2.2 0 0 0-.2.2zM2.8 6.866c0 .11.09.2.2.2h10a.2.2 0 0 0 .2-.2v-1.2a.2.2 0 0 0-.2-.2H3a.2.2 0 0 0-.2.2zM0 10.333c0 .11.09.2.2.2h15.6a.2.2 0 0 0 .2-.2v-1.2a.2.2 0 0 0-.2-.2H.2a.2.2 0 0 0-.2.2zM0 3.4V2.2c0-.11.09-.2.2-.2h15.6c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2H.2a.2.2 0 0 1-.2-.2"
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
export class KbqAlignCenter16 extends KbqSvgIcon {}
