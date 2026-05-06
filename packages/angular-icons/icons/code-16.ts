import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCode16]',
    template: `
        <svg:g>
            <svg:path
                d="M13.796 8 11.03 5.31a.193.193 0 0 1 0-.278l.858-.834a.206.206 0 0 1 .286 0L15.94 7.86a.193.193 0 0 1 0 .278l-3.767 3.663a.206.206 0 0 1-.286 0l-.858-.834a.193.193 0 0 1 0-.278zM6.379 13.8a.197.197 0 0 1-.166-.226l1.983-11.41a.2.2 0 0 1 .233-.161l1.196.196c.11.018.185.12.166.227l-1.983 11.41a.2.2 0 0 1-.233.161zM2.204 8l2.766 2.69a.193.193 0 0 1 0 .278l-.858.834a.206.206 0 0 1-.286 0L.06 8.14a.193.193 0 0 1 0-.278l3.767-3.663a.206.206 0 0 1 .286 0l.858.834a.193.193 0 0 1 0 .278z"
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
export class KbqCode16 extends KbqSvgIcon {}
