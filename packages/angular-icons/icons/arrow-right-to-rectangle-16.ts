import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowRightToRectangle16]',
    template: `
        <svg:g>
            <svg:path
                d="M4 2.2V6h1.6V2.8c0-.11.09-.2.2-.2h7.4c.11 0 .2.09.2.2v10.4a.2.2 0 0 1-.2.2H5.8a.2.2 0 0 1-.2-.2V10H4v3.8A1.2 1.2 0 0 0 5.2 15h8.6a1.2 1.2 0 0 0 1.2-1.2V2.2A1.2 1.2 0 0 0 13.8 1H5.2A1.2 1.2 0 0 0 4 2.2"
            />
            <svg:path
                d="m7.482 5.66 1.536 1.536H1.191A.2.2 0 0 0 1 7.338v1.316a.2.2 0 0 0 .191.142h7.827l-1.536 1.536a.2.2 0 0 0 0 .283l.848.849a.2.2 0 0 0 .283 0l3.327-3.327a.2.2 0 0 0 0-.282L8.613 4.528a.2.2 0 0 0-.283 0l-.848.849a.2.2 0 0 0 0 .283"
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
export class KbqArrowRightToRectangle16 extends KbqSvgIcon {}
