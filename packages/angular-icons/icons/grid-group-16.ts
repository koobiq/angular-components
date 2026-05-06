import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqGridGroup16]',
    template: `
        <svg:path
            d="M2 1.2c0-.11.09-.2.2-.2h11.6c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2H3.6v10.8h10.2c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2H2.2a.2.2 0 0 1-.2-.2zm3.2 3.2c0-.11.09-.2.2-.2h6.2c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2H5.4a.2.2 0 0 1-.2-.2zm0 3c0-.11.09-.2.2-.2h6.2c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2H5.4a.2.2 0 0 1-.2-.2zm0 3c0-.11.09-.2.2-.2h6.2c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2H5.4a.2.2 0 0 1-.2-.2z"
        />
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
export class KbqGridGroup16 extends KbqSvgIcon {}
