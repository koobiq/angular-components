import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBan16]',
    template: `
        <svg:path
            d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0m-3.79 4.343L3.656 4.791a5.4 5.4 0 0 0 7.553 7.553m1.133-1.134A5.4 5.4 0 0 0 4.79 3.656z"
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
export class KbqBan16 extends KbqSvgIcon {}
