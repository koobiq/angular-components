import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqRegistryMultiple16]',
    template: `
        <svg:g>
            <svg:path
                d="M1 1.2c0-.11.09-.2.2-.2h3.6c.11 0 .2.09.2.2v3.6a.2.2 0 0 1-.2.2H1.2a.2.2 0 0 1-.2-.2zM1 9.2c0-.11.09-.2.2-.2h5.6c.11 0 .2.09.2.2v5.6a.2.2 0 0 1-.2.2H1.2a.2.2 0 0 1-.2-.2zM11.619 1.553a.2.2 0 0 1 .282 0L14.447 4.1a.2.2 0 0 1 0 .283L11.899 6.93a.2.2 0 0 1-.283 0L9.07 4.384a.2.2 0 0 1 0-.283zM11 11.2c0-.11.09-.2.2-.2h3.6c.11 0 .2.09.2.2v3.6a.2.2 0 0 1-.2.2h-3.6a.2.2 0 0 1-.2-.2z"
            />
            <svg:path
                d="M3 7.8h5c.11 0 .2.09.2.2v5c0 .11.09.2.2.2h.8a.2.2 0 0 0 .2-.2V6.8a.2.2 0 0 0-.2-.2H3a.2.2 0 0 0-.2.2v.8c0 .11.09.2.2.2"
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
export class KbqRegistryMultiple16 extends KbqSvgIcon {}
