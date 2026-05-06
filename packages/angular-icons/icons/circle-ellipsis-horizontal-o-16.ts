import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCircleEllipsisHorizontalO16]',
    template: `
        <svg:g>
            <svg:path
                d="M6 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0M9 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0M12 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0"
            />
            <svg:path d="M8 13.4A5.4 5.4 0 1 1 8 2.6a5.4 5.4 0 0 1 0 10.8M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14" />
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
export class KbqCircleEllipsisHorizontalO16 extends KbqSvgIcon {}
