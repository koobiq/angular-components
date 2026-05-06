import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCapsule16]',
    template: `
        <svg:path
            d="M8 2.201A4.1 4.1 0 0 1 13.799 8L8 13.799A4.1 4.1 0 0 1 2.201 8zM6.794 5.594a.193.193 0 0 0 0 .273l3.339 3.34a.193.193 0 0 0 .273 0l2.3-2.3a2.554 2.554 0 1 0-3.613-3.613z"
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
export class KbqCapsule16 extends KbqSvgIcon {}
