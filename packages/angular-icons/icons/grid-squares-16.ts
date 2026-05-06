import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqGridSquares16]',
    template: `
        <svg:g>
            <svg:path
                d="M8.6 13.8A1.2 1.2 0 0 0 9.8 15h4a1.2 1.2 0 0 0 1.2-1.2v-4a1.2 1.2 0 0 0-1.2-1.2h-4a1.2 1.2 0 0 0-1.2 1.2zM8.6 6.2a1.2 1.2 0 0 0 1.2 1.2h4A1.2 1.2 0 0 0 15 6.2v-4A1.2 1.2 0 0 0 13.8 1h-4a1.2 1.2 0 0 0-1.2 1.2zM7.4 2.2A1.2 1.2 0 0 0 6.2 1h-4A1.2 1.2 0 0 0 1 2.2v4a1.2 1.2 0 0 0 1.2 1.2h4a1.2 1.2 0 0 0 1.2-1.2zM7.4 9.8a1.2 1.2 0 0 0-1.2-1.2h-4A1.2 1.2 0 0 0 1 9.8v4A1.2 1.2 0 0 0 2.2 15h4a1.2 1.2 0 0 0 1.2-1.2z"
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
export class KbqGridSquares16 extends KbqSvgIcon {}
