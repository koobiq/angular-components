import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqEye16]',
    template: `
        <svg:g>
            <svg:path
                d="M8 10.272A2.274 2.274 0 0 0 10.277 8 2.275 2.275 0 0 0 8 5.728 2.275 2.275 0 0 0 5.723 8 2.274 2.274 0 0 0 8 10.272"
            />
            <svg:path
                d="M.066 8.149a.2.2 0 0 1 0-.298l3.856-3.518a6.044 6.044 0 0 1 8.156 0l3.856 3.518a.2.2 0 0 1 0 .298l-3.856 3.518a6.044 6.044 0 0 1-8.156 0zM11.796 8A3.79 3.79 0 0 0 8 4.214 3.79 3.79 0 0 0 4.204 8 3.79 3.79 0 0 0 8 11.786 3.79 3.79 0 0 0 11.796 8"
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
export class KbqEye16 extends KbqSvgIcon {}
