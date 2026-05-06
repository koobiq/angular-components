import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFileArchiveO16]',
    template: `
        <svg:g>
            <svg:path
                d="M6.5 3.2a.2.2 0 0 0-.2-.2H5.2a.2.2 0 0 0-.2.2v1.1c0 .11.09.2.2.2h1.3V6H5.2a.2.2 0 0 0-.2.2v1.1c0 .11.09.2.2.2h1.3V9H5.2a.2.2 0 0 0-.2.2v2.6A1.2 1.2 0 0 0 6.2 13h.068a1.2 1.2 0 0 0 1.124-1.621L6.5 9h1.3a.2.2 0 0 0 .2-.2V7.7a.2.2 0 0 0-.2-.2H6.5V6h1.3a.2.2 0 0 0 .2-.2V4.7a.2.2 0 0 0-.2-.2H6.5z"
            />
            <svg:path
                d="M14 4.083a.2.2 0 0 0-.059-.142L10.06.06A.2.2 0 0 0 9.917 0H3.2A1.2 1.2 0 0 0 2 1.2v13.6A1.2 1.2 0 0 0 3.2 16h9.6a1.2 1.2 0 0 0 1.2-1.2zM3.6 1.8c0-.11.09-.2.2-.2H9v3.2c0 .11.09.2.2.2h3.2v9.2a.2.2 0 0 1-.2.2H3.8a.2.2 0 0 1-.2-.2z"
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
export class KbqFileArchiveO16 extends KbqSvgIcon {}
