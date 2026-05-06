import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowRightArrowLeft24]',
    template: `
        <svg:g>
            <svg:path
                d="M15.48 13.5c.12.119.311.119.43 0L22.41 7.01a.303.303 0 0 0 0-.429L15.91.09a.304.304 0 0 0-.43 0l-1.287 1.286a.303.303 0 0 0 0 .429l3.784 3.778H2.437a.303.303 0 0 0-.304.303v1.819c0 .167.136.303.304.303h15.54l-3.784 3.779a.303.303 0 0 0 0 .428z"
            />
            <svg:path
                d="M8.52 10.5a.304.304 0 0 0-.43 0L1.59 16.99a.303.303 0 0 0 0 .429L8.09 23.91c.119.119.31.119.43 0l1.287-1.286a.303.303 0 0 0 0-.429l-3.784-3.778h15.54a.303.303 0 0 0 .304-.303v-1.819a.303.303 0 0 0-.304-.303H6.023l3.784-3.779a.303.303 0 0 0 0-.428z"
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
export class KbqArrowRightArrowLeft24 extends KbqSvgIcon {}
