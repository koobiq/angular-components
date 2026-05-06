import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqConnectionsLine24]',
    template: `
        <svg:g>
            <svg:path
                d="M4.5 7.5a3 3 0 0 0 2.75-1.8h9.5a3 3 0 1 0 0-2.4h-9.5A3 3 0 1 0 4.5 7.5M7.25 20.7a3 3 0 1 1 0-2.4h9.5a3 3 0 1 1 0 2.4z"
            />
        </svg:g>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        width: '24',
        height: '24'
    }
})
export class KbqConnectionsLine24 extends KbqSvgIcon {}
