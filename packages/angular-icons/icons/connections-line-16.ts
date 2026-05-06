import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqConnectionsLine16]',
    template: `
        <svg:g>
            <svg:path
                d="M3 5a2 2 0 0 0 1.834-1.2h6.332a2 2 0 1 0 0-1.6H4.834A2 2 0 1 0 3 5M4.834 13.8a2 2 0 1 1 0-1.6h6.332a2 2 0 1 1 0 1.6z"
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
export class KbqConnectionsLine16 extends KbqSvgIcon {}
