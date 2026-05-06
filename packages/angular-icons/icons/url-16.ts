import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqUrl16]',
    template: `
        <svg:g>
            <svg:path
                d="M5.573 4.78a.2.2 0 0 0-.2-.2H4.352a.2.2 0 0 0-.2.2v4.043c0 .768-.539 1.323-1.366 1.323-.823 0-1.365-.555-1.365-1.323V4.78a.2.2 0 0 0-.2-.2H.2a.2.2 0 0 0-.2.2v4.165c0 1.47 1.11 2.451 2.786 2.451 1.67 0 2.787-.98 2.787-2.451zM6.387 11.301a.2.2 0 0 1-.2-.2v-6.32c0-.111.09-.2.2-.2H8.84c1.526 0 2.409.859 2.409 2.195 0 .919-.424 1.585-1.188 1.913l1.266 2.316a.2.2 0 0 1-.176.296H10.04a.2.2 0 0 1-.177-.106L8.645 8.92H7.608V11.1a.2.2 0 0 1-.2.2zm1.221-3.524h.965c.814 0 1.211-.335 1.211-1.001 0-.67-.397-1.034-1.218-1.034h-.958zM11.898 11.301a.2.2 0 0 1-.2-.2v-6.32c0-.111.09-.2.2-.2h1.02c.111 0 .2.089.2.2v5.349H15.8c.11 0 .2.09.2.2v.771a.2.2 0 0 1-.2.2z"
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
export class KbqUrl16 extends KbqSvgIcon {}
