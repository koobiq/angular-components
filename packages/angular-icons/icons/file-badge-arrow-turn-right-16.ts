import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFileBadgeArrowTurnRight16]',
    template: `
        <svg:g>
            <svg:path
                d="M12.4 5v9.2a.2.2 0 0 1-.2.2H4V16h8.8a1.2 1.2 0 0 0 1.2-1.2V4.083a.2.2 0 0 0-.059-.142L10.06.06A.2.2 0 0 0 9.917 0H3.2A1.2 1.2 0 0 0 2 1.2v7.483a3.2 3.2 0 0 1 1.2-.233h.4V1.8c0-.11.09-.2.2-.2H9v3.2c0 .11.09.2.2.2z"
            />
            <svg:path
                d="M1.4 14.5a.2.2 0 0 1-.2-.2v-2.65a2 2 0 0 1 2-2h1.6V8.06a.2.2 0 0 1 .306-.169l3.823 2.39a.2.2 0 0 1 0 .338l-3.823 2.39a.2.2 0 0 1-.306-.17v-1.59l-1.6.001a.4.4 0 0 0-.4.4v2.65a.2.2 0 0 1-.2.2z"
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
export class KbqFileBadgeArrowTurnRight16 extends KbqSvgIcon {}
