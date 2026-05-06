import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowUpArrowDownDot24]',
    template: `
        <svg:g>
            <svg:path
                d="M15.993 7.777v10.2l-3.779-3.784a.303.303 0 0 0-.428 0l-1.287 1.287a.304.304 0 0 0 0 .43l6.492 6.501c.118.119.31.119.429 0l6.491-6.501a.304.304 0 0 0 0-.43l-1.286-1.287a.303.303 0 0 0-.429 0l-3.778 3.784v-8.8a4.8 4.8 0 0 1-2.425-1.4"
            />
            <svg:path
                d="M13.5 8.09a.304.304 0 0 1 0 .43l-1.286 1.288a.303.303 0 0 1-.428 0L8.007 6.023v15.54a.303.303 0 0 1-.303.304H5.885a.303.303 0 0 1-.303-.304V6.023L1.804 9.808a.303.303 0 0 1-.43 0L.09 8.519a.304.304 0 0 1 0-.429L6.58 1.59a.303.303 0 0 1 .429 0z"
            />
        </svg:g>
        <svg:path fill="currentColor" d="M22.5 4.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
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
export class KbqArrowUpArrowDownDot24 extends KbqSvgIcon {}
