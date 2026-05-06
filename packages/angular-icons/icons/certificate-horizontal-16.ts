import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCertificateHorizontal16]',
    template: `
        <svg:g>
            <svg:path
                d="M16 3.114C16 2.5 15.463 2 14.8 2H1.2C.537 2 0 2.499 0 3.114v7.772C0 11.5.537 12 1.2 12h8.275A3.198 3.198 0 0 1 12.2 7.128a3.198 3.198 0 0 1 2.729 4.866c.6-.06 1.067-.53 1.071-1.101V3.114M2 4.998V4.2c0-.11.09-.2.2-.2h7.1c.11 0 .2.09.2.2v.798a.2.2 0 0 1-.2.2H2.2a.2.2 0 0 1-.2-.2m0 2.495v-.799c0-.11.09-.2.2-.2h4.1c.11 0 .2.09.2.2v.799a.2.2 0 0 1-.2.2H2.2a.2.2 0 0 1-.2-.2"
            />
            <svg:path
                d="M12.2 12.32a2 2 0 0 0 .826-.178 2 2 0 0 0 1.174-1.819 2 2 0 0 0-2-1.995c-1.105 0-2 .893-2 1.995s.895 1.996 2 1.996M13.7 13.145a3.2 3.2 0 0 1-1.5.372 3.2 3.2 0 0 1-1.5-.372V15.8a.2.2 0 0 0 .31.166l1.19-.79 1.189.79a.2.2 0 0 0 .311-.166z"
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
export class KbqCertificateHorizontal16 extends KbqSvgIcon {}
