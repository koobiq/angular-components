import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqVkAlt16]',
    template: `
        <svg:path
            d="M8.715 12.992C3.248 12.992.13 9.244 0 3.008h2.738c.09 4.577 2.109 6.516 3.708 6.916V3.008h2.578v3.948c1.58-.17 3.238-1.97 3.798-3.948H15.4c-.43 2.439-2.228 4.238-3.508 4.977 1.28.6 3.329 2.169 4.108 5.007h-2.838c-.61-1.899-2.129-3.368-4.138-3.568v3.568z"
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
export class KbqVkAlt16 extends KbqSvgIcon {}
