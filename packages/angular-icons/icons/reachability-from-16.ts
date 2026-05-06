import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqReachabilityFrom16]',
    template: `
        <svg:path
            d="M8.729 2.83a.2.2 0 0 1 0 .339l-3.823 2.39a.2.2 0 0 1-.306-.17v-1.59H1.2a.2.2 0 0 1-.2-.2V2.4c0-.11.09-.2.2-.2h3.4V.61a.2.2 0 0 1 .306-.17zM15 13a2 2 0 0 1-3.834.8H5.3a3.3 3.3 0 0 1 0-6.6h5.4a1.7 1.7 0 1 0 0-3.4H10V2.2h.7a3.3 3.3 0 1 1 0 6.6H5.3a1.7 1.7 0 0 0 0 3.4h5.866A2 2 0 0 1 15 13"
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
export class KbqReachabilityFrom16 extends KbqSvgIcon {}
