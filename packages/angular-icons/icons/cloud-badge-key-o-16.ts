import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCloudBadgeKeyO16]',
    template: `
        <svg:g>
            <svg:path
                d="M11.225 5.92 11.587 7l.736.008a4 4 0 0 1 .571.014 4.2 4.2 0 0 1 3.102 1.853q.004-.084.004-.17a3.294 3.294 0 0 0-3.257-3.293 5.002 5.002 0 0 0-9.225-.63A3.61 3.61 0 0 0 3 11.95v-1.643a2.01 2.01 0 0 1 .557-3.924l.965-.024.43-.865a3.4 3.4 0 0 1 6.273.427"
            />
            <svg:path
                d="M4.2 10.599v3.402c0 .11.09.2.2.2h1.2a.2.2 0 0 0 .2-.2v-2.002H7v2.002c0 .11.09.2.2.2h1.2a.2.2 0 0 0 .2-.2v-2.002h1.53a2.501 2.501 0 1 0 .002-1.6H4.4a.2.2 0 0 0-.2.2m7.4.605a.9.9 0 1 1 1.8 0 .9.9 0 0 1-1.8 0"
            />
        </svg:g>
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
export class KbqCloudBadgeKeyO16 extends KbqSvgIcon {}
