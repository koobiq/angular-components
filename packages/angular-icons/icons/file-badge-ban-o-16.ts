import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFileBadgeBanO16]',
    template: `
        <svg:g>
            <svg:path
                d="M14 4.083a.2.2 0 0 0-.059-.142L10.06.06A.2.2 0 0 0 9.917 0H3.2A1.2 1.2 0 0 0 2 1.2v13.6A1.2 1.2 0 0 0 3.2 16h6.163A4.7 4.7 0 0 1 8.2 14.4H3.8a.2.2 0 0 1-.2-.2V1.8c0-.11.09-.2.2-.2H9v3.2c0 .11.09.2.2.2h3.2v2.801l.1-.001c.524 0 1.029.086 1.5.244z"
            />
            <svg:path
                d="M13.211 15.928a3.501 3.501 0 1 0-.73.072h.038q.357-.002.692-.072m1.393-2.172-3.36-3.36a2.45 2.45 0 0 1 3.36 3.36m-.848.848a2.45 2.45 0 0 1-3.36-3.36z"
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
export class KbqFileBadgeBanO16 extends KbqSvgIcon {}
