import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCloudBadgeGlobe16]',
    template: `
        <svg:path
            d="M3.61 11a3.61 3.61 0 0 1-.092-7.218 5 5 0 0 1 9.225.63 3.294 3.294 0 0 1 2.965 4.653A4.702 4.702 0 0 0 8.045 11zm12.387 2.011a.1.1 0 0 0-.098-.11h-1.48a.1.1 0 0 0-.1.094 7 7 0 0 1-.866 2.937 3.54 3.54 0 0 0 2.544-2.921m0-.995a3.54 3.54 0 0 0-2.542-2.92 7 7 0 0 1 .864 2.936.1.1 0 0 0 .1.095h1.48c.06 0 .106-.052.098-.111m-6.976 0a3.54 3.54 0 0 1 2.541-2.92 7 7 0 0 0-.864 2.936.1.1 0 0 1-.1.095h-1.48a.1.1 0 0 1-.097-.111m1.577.884c.053 0 .097.042.1.095a7 7 0 0 0 .867 2.937A3.54 3.54 0 0 1 9.02 13.01a.1.1 0 0 1 .098-.11zm.872.107a.1.1 0 0 1 .099-.107h1.88c.058 0 .103.05.099.107A6.23 6.23 0 0 1 12.508 16a6.23 6.23 0 0 1-1.038-2.993m2.078-.987a6.25 6.25 0 0 0-1.04-2.997 6.25 6.25 0 0 0-1.038 2.997.1.1 0 0 0 .099.107h1.88a.1.1 0 0 0 .099-.107"
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
export class KbqCloudBadgeGlobe16 extends KbqSvgIcon {}
