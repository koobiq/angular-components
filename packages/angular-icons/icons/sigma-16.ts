import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqSigma16]',
    template: `
        <svg:path
            d="M12.5 12.923a.2.2 0 0 0-.2-.2H6.393L9.8 8.098a.2.2 0 0 0 .039-.12v-.045a.2.2 0 0 0-.04-.12l-3.38-4.527h5.575a.2.2 0 0 0 .2-.2V1.7a.2.2 0 0 0-.2-.2H3.7a.2.2 0 0 0-.2.2v1.035a.2.2 0 0 0 .042.123l3.976 5.097-3.977 5.188a.2.2 0 0 0-.041.121V14.3c0 .11.09.2.2.2h8.6a.2.2 0 0 0 .2-.2z"
        />
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
export class KbqSigma16 extends KbqSvgIcon {}
