import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCompass16]',
    template: `
        <svg:g>
            <svg:path
                d="M6.132 6.273a.2.2 0 0 1 .141-.141l4.743-1.268a.1.1 0 0 1 .123.123l-1.27 4.74a.2.2 0 0 1-.142.141l-4.74 1.27a.1.1 0 0 1-.123-.122zm2.575 1.02a1 1 0 1 0-1.414 1.414 1 1 0 0 0 1.414-1.414"
            />
            <svg:path d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0m-1.6 0A5.4 5.4 0 1 0 2.6 8a5.4 5.4 0 0 0 10.8 0" />
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
export class KbqCompass16 extends KbqSvgIcon {}
