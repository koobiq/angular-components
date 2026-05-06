import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqMagnifyingGlassPlus16]',
    template: `
        <svg:g>
            <svg:path
                d="M7.375 4.475a.2.2 0 0 0-.2-.2h-.8a.2.2 0 0 0-.2.2V6.15H4.5a.2.2 0 0 0-.2.2v.8c0 .11.09.2.2.2h1.675v1.675c0 .11.09.2.2.2h.8a.2.2 0 0 0 .2-.2V7.35H9.05a.2.2 0 0 0 .2-.2v-.8a.2.2 0 0 0-.2-.2H7.375z"
            />
            <svg:path
                d="M6.761 12.264c1.232 0 2.37-.404 3.286-1.088l3.515 3.515a.2.2 0 0 0 .284 0l.85-.85a.2.2 0 0 0 0-.282l-3.516-3.515a5.507 5.507 0 1 0-4.42 2.22m0-1.602a3.905 3.905 0 1 1 0-7.81 3.905 3.905 0 0 1 0 7.81"
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
export class KbqMagnifyingGlassPlus16 extends KbqSvgIcon {}
