import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqRegistry16]',
    template: `
        <svg:g>
            <svg:path
                d="M1.2 1a.2.2 0 0 0-.2.2v3.6c0 .11.09.2.2.2h3.6a.2.2 0 0 0 .2-.2V1.2a.2.2 0 0 0-.2-.2zM1.2 8a.2.2 0 0 0-.2.2v6.6c0 .11.09.2.2.2h6.6a.2.2 0 0 0 .2-.2V8.2a.2.2 0 0 0-.2-.2zM11.619 1.553a.2.2 0 0 1 .282 0L14.447 4.1a.2.2 0 0 1 0 .283L11.899 6.93a.2.2 0 0 1-.283 0L9.07 4.384a.2.2 0 0 1 0-.283zM11.2 11a.2.2 0 0 0-.2.2v3.6c0 .11.09.2.2.2h3.6a.2.2 0 0 0 .2-.2v-3.6a.2.2 0 0 0-.2-.2z"
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
export class KbqRegistry16 extends KbqSvgIcon {}
