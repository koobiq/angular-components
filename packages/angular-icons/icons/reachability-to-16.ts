import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqReachabilityTo16]',
    template: `
        <svg:path
            d="M4.834 3.8a2 2 0 1 1 0-1.6H10.7a3.3 3.3 0 1 1 0 6.6H5.3a1.7 1.7 0 0 0 0 3.4h5.48v-1.59a.2.2 0 0 1 .306-.17l3.823 2.39a.2.2 0 0 1 0 .339l-3.823 2.39a.2.2 0 0 1-.306-.17V13.8H5.3a3.3 3.3 0 0 1 0-6.6h5.4a1.7 1.7 0 1 0 0-3.4z"
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
export class KbqReachabilityTo16 extends KbqSvgIcon {}
