import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqDesktop16]',
    template: `
        <svg:g>
            <svg:path
                d="M1 2.2A1.2 1.2 0 0 1 2.2 1h11.6A1.2 1.2 0 0 1 15 2.2v7.6a1.2 1.2 0 0 1-1.2 1.2H2.2A1.2 1.2 0 0 1 1 9.8zM6 12.2v1.2H3V15h10v-1.6H9.997v-1.2z"
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
export class KbqDesktop16 extends KbqSvgIcon {}
