import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowLeft24]',
    template: `
        <svg:path
            d="m6.127 13.18 5.279 5.257a.297.297 0 0 1 0 .422l-1.284 1.278a.304.304 0 0 1-.428 0l-7.983-7.95a.297.297 0 0 1 0-.423l7.983-7.95a.304.304 0 0 1 .428 0l1.284 1.278a.297.297 0 0 1 0 .422l-5.28 5.257h16.196a.3.3 0 0 1 .301.3v1.809a.3.3 0 0 1-.302.3z"
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
export class KbqArrowLeft24 extends KbqSvgIcon {}
