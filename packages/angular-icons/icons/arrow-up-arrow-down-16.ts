import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowUpArrowDown16]',
    template: `
        <svg:g>
            <svg:path
                d="M9 5.68a.203.203 0 0 0 0-.287L4.673 1.06a.2.2 0 0 0-.286 0L.059 5.393a.203.203 0 0 0 0 .287l.858.858a.2.2 0 0 0 .285 0l2.52-2.522v10.36c0 .111.09.202.201.202h1.213c.112 0 .202-.09.202-.202V4.016l2.52 2.522a.2.2 0 0 0 .285 0z"
            />
            <svg:path
                d="M7 10.32a.203.203 0 0 0 0 .287l4.327 4.334c.08.079.207.079.286 0l4.328-4.334a.203.203 0 0 0 0-.287l-.858-.858a.2.2 0 0 0-.285 0l-2.52 2.522V1.624a.2.2 0 0 0-.202-.202h-1.212a.2.2 0 0 0-.202.203v10.36l-2.52-2.523a.2.2 0 0 0-.285 0z"
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
export class KbqArrowUpArrowDown16 extends KbqSvgIcon {}
