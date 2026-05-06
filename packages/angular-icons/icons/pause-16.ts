import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqPause16]',
    template: `
        <svg:g>
            <svg:path
                d="M9 3.2c0-.11.09-.2.2-.2h2.6c.111 0 .2.09.2.2v9.6a.2.2 0 0 1-.2.2H9.2a.2.2 0 0 1-.2-.2zM4 3.2c0-.11.09-.2.2-.2h2.6c.11 0 .2.09.2.2v9.6a.2.2 0 0 1-.2.2H4.2a.2.2 0 0 1-.2-.2z"
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
export class KbqPause16 extends KbqSvgIcon {}
