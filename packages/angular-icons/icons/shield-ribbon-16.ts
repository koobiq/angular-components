import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqShieldRibbon16]',
    template: `
        <svg:g>
            <svg:path
                d="M1 2.202A1.2 1.2 0 0 1 2.2 1h11.6A1.2 1.2 0 0 1 15 2.202v.484L1 7.067zM1 8.326l14-4.38V5.69L1 10.07zM1 11.33v.255a.2.2 0 0 0 .115.181l6.8 4.215a.2.2 0 0 0 .17 0l6.8-4.215a.2.2 0 0 0 .115-.18V6.948z"
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
export class KbqShieldRibbon16 extends KbqSvgIcon {}
