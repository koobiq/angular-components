import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFileTextO16]',
    template: `
        <svg:g>
            <svg:path
                d="M4.8 8c0 .11.09.2.2.2h6a.2.2 0 0 0 .2-.2v-.8A.2.2 0 0 0 11 7H5a.2.2 0 0 0-.2.2zM11.2 10.4a.2.2 0 0 1-.2.2H5a.2.2 0 0 1-.2-.2v-.8c0-.11.09-.2.2-.2h6c.11 0 .2.09.2.2zM4.8 12.8c0 .11.09.2.2.2h2.8a.2.2 0 0 0 .2-.2V12a.2.2 0 0 0-.2-.2H5a.2.2 0 0 0-.2.2z"
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
export class KbqFileTextO16 extends KbqSvgIcon {}
