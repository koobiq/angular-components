import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqActiveDirectory24]',
    template: `
        <svg:path
            d="M9 4.5c0 .632.195 1.218.529 1.701l-3.976 5.09a3 3 0 1 0 .744 5.213l2.854 2.054a3 3 0 1 0 5.698 0l2.854-2.055a3 3 0 1 0 .744-5.213L14.47 6.201A3 3 0 1 0 9 4.5m3.9 2.863q.078-.025.153-.053l3.976 5.089A3 3 0 0 0 16.5 14.1c0 .33.053.646.151.942l-2.854 2.055c-.268-.2-.57-.357-.897-.46zm-1.8 0v9.274c-.326.103-.629.26-.897.46L7.35 15.042c.098-.296.151-.613.151-.942 0-.632-.195-1.218-.529-1.701l3.976-5.09q.075.03.153.054"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        width: '24',
        height: '24'
    }
})
export class KbqActiveDirectory24 extends KbqSvgIcon {}
