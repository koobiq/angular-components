import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqReachability16]',
    template: `
        <svg:path
            d="M3 5a2 2 0 0 0 1.834-1.2H10.7a1.7 1.7 0 1 1 0 3.4H5.3a3.3 3.3 0 0 0 0 6.6h5.866a2 2 0 1 0 0-1.6H5.3a1.7 1.7 0 0 1 0-3.4h5.4a3.3 3.3 0 1 0 0-6.6H4.834A2 2 0 1 0 3 5"
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
export class KbqReachability16 extends KbqSvgIcon {}
