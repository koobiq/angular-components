import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqRedo16]',
    template: `
        <svg:path
            d="M11.937 7.366 9.303 10l1.131 1.131L15 6.566 10.434 2 9.303 3.131l2.634 2.635H5.3C2.925 5.766 1 7.626 1 10c0 2.375 1.925 4 4.3 4H8v-1.6H5.3c-1.491 0-2.7-.909-2.7-2.4s1.209-2.634 2.7-2.634z"
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
export class KbqRedo16 extends KbqSvgIcon {}
