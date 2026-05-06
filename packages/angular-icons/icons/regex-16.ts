import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqRegex16]',
    template: `
        <svg:g>
            <svg:path
                d="M10.608 1.2a.2.2 0 0 0-.2-.2H9.115a.2.2 0 0 0-.2.2v3.038l-2.678-.872a.2.2 0 0 0-.252.128l-.4 1.23a.2.2 0 0 0 .128.251l2.782.906-1.767 2.28a.2.2 0 0 0 .035.28l1.022.793a.2.2 0 0 0 .28-.036L9.762 7.01l1.696 2.188a.2.2 0 0 0 .28.036l1.022-.792a.2.2 0 0 0 .036-.28L11.028 5.88l2.782-.906a.2.2 0 0 0 .128-.252l-.4-1.229a.2.2 0 0 0-.252-.128l-2.678.872zM4.303 15a2.303 2.303 0 1 0 0-4.605 2.303 2.303 0 0 0 0 4.605"
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
export class KbqRegex16 extends KbqSvgIcon {}
