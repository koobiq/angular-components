import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqTag24]',
    template: `
        <svg:path
            d="M21 11.471c0 .08-.032.158-.089.215l-10.28 10.28a1.824 1.824 0 0 1-2.579 0l-6.018-6.018a1.824 1.824 0 0 1 0-2.58L12.314 3.09A.3.3 0 0 1 12.529 3h8.167c.168 0 .304.136.304.304zm-5.25-.971a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5"
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
export class KbqTag24 extends KbqSvgIcon {}
