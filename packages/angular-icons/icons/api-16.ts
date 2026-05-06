import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqApi16]',
    template: `
        <svg:path
            d="M.045 11.868A.1.1 0 0 0 .14 12h1.51a.2.2 0 0 0 .19-.139l.543-1.685h2.859l.543 1.685a.2.2 0 0 0 .19.139h1.51a.1.1 0 0 0 .095-.132L4.94 4.135A.2.2 0 0 0 4.75 4H2.879a.2.2 0 0 0-.19.135zM4.82 8.855H2.81l.975-3.027h.061zM8.125 12a.2.2 0 0 1-.2-.2V4.2c0-.11.09-.2.2-.2h2.926c1.799 0 2.84 1.121 2.84 2.71 0 1.599-1.06 2.696-2.883 2.696H9.6V11.8a.2.2 0 0 1-.2.2zM9.6 8.05h1.138c.959 0 1.427-.546 1.427-1.34 0-.796-.468-1.327-1.435-1.327H9.6zM15.8 4c.11 0 .2.09.2.2v7.6a.2.2 0 0 1-.2.2h-1.275a.2.2 0 0 1-.2-.2V4.2c0-.11.09-.2.2-.2z"
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
export class KbqApi16 extends KbqSvgIcon {}
