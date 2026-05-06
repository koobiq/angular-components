import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCloudBadgeGlobeO16]',
    template: `
        <svg:path
            d="m4.522 5.358-.965.024A2.01 2.01 0 0 0 3.61 9.4h5.358a4.7 4.7 0 0 0-.923 1.6H3.61a3.61 3.61 0 0 1-.091-7.218 5 5 0 0 1 9.224.63 3.294 3.294 0 0 1 2.966 4.653 4.7 4.7 0 0 0-1.373-.893 1.696 1.696 0 0 0-1.61-2.16l-1.138-.013-.362-1.08a3.402 3.402 0 0 0-6.274-.426zm11.475 7.653a.1.1 0 0 0-.098-.11h-1.48a.1.1 0 0 0-.1.094 7 7 0 0 1-.866 2.937 3.54 3.54 0 0 0 2.544-2.921m0-.995a3.54 3.54 0 0 0-2.542-2.92c.507.913.795 1.918.864 2.936a.1.1 0 0 0 .1.094h1.48c.06 0 .106-.051.098-.11m-6.976 0a.1.1 0 0 0 .098.11h1.479a.1.1 0 0 0 .1-.094 7 7 0 0 1 .864-2.937 3.54 3.54 0 0 0-2.541 2.92m1.577.884c.053 0 .097.042.1.095a7 7 0 0 0 .867 2.937A3.54 3.54 0 0 1 9.02 13.01a.1.1 0 0 1 .098-.11zm.872.107a.1.1 0 0 1 .099-.107h1.88c.058 0 .103.049.099.107A6.23 6.23 0 0 1 12.508 16a6.23 6.23 0 0 1-1.038-2.993m2.078-.987a.1.1 0 0 1-.1.106h-1.88a.1.1 0 0 1-.098-.106 6.25 6.25 0 0 1 1.039-2.997c.61.907.957 1.944 1.039 2.997"
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
export class KbqCloudBadgeGlobeO16 extends KbqSvgIcon {}
