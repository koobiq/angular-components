import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqConnection24]',
    template: `
        <svg:g>
            <svg:path
                d="M21.402 7.902a3.75 3.75 0 1 0-5.304-5.304 3.75 3.75 0 0 0 5.304 5.304M12.045 13.545l-2.25 2.25-1.697-1.697 2.25-2.25zM15.795 9.795l-2.25 2.25-1.697-1.697 2.25-2.25zM7.902 16.099a3.75 3.75 0 1 1-5.304 5.303 3.75 3.75 0 0 1 5.304-5.303m-1.273 1.273a1.95 1.95 0 1 0-2.758 2.757 1.95 1.95 0 0 0 2.758-2.758"
            />
        </svg:g>
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
export class KbqConnection24 extends KbqSvgIcon {}
