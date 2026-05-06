import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowRightToBracket16]',
    template: `
        <svg:g>
            <svg:path
                d="M13.8 15H9.2a.2.2 0 0 1-.2-.2v-1.2c0-.11.09-.2.2-.2h4a.2.2 0 0 0 .2-.2V2.8a.2.2 0 0 0-.2-.2h-4a.2.2 0 0 1-.2-.2V1.2c0-.11.09-.2.2-.2h4.6A1.2 1.2 0 0 1 15 2.2v11.6a1.2 1.2 0 0 1-1.2 1.2"
            />
            <svg:path
                d="m8.176 8.8-2.462 2.494a.2.2 0 0 0 0 .28l.836.847a.2.2 0 0 0 .285 0l4.226-4.28a.2.2 0 0 0 0-.282L6.835 3.58a.2.2 0 0 0-.285 0l-.836.846a.2.2 0 0 0 0 .281L8.176 7.2H1.2a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2z"
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
export class KbqArrowRightToBracket16 extends KbqSvgIcon {}
