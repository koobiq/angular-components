import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCompass24]',
    template: `
        <svg:g>
            <svg:path
                d="M9.197 9.41a.3.3 0 0 1 .213-.213l7.114-1.9a.15.15 0 0 1 .184.183l-1.905 7.11a.3.3 0 0 1-.213.212l-7.11 1.906a.15.15 0 0 1-.184-.184zm3.864 1.53a1.5 1.5 0 1 0-2.122 2.12 1.5 1.5 0 0 0 2.122-2.12"
            />
            <svg:path
                d="M22.5 12c0 5.799-4.701 10.5-10.5 10.5S1.5 17.799 1.5 12 6.201 1.5 12 1.5 22.5 6.201 22.5 12m-2.4 0a8.1 8.1 0 1 0-16.2 0 8.1 8.1 0 0 0 16.2 0"
            />
        </svg:g>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        width: '24',
        height: '24'
    }
})
export class KbqCompass24 extends KbqSvgIcon {}
