import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqEllipsisHorizontal16]',
    template: `
        <svg:g>
            <svg:path
                d="M13.5 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3M8 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3M1 8a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0"
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
export class KbqEllipsisHorizontal16 extends KbqSvgIcon {}
