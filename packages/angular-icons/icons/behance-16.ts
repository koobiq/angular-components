import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBehance16]',
    template: `
        <svg:path
            d="M14.667 4.333H10V3h4.666zM15.817 11c-.294.865-1.353 2-3.4 2-2.05 0-3.71-1.153-3.71-3.783 0-2.607 1.55-3.947 3.644-3.947 2.055 0 3.31 1.188 3.583 2.95.053.338.073.793.064 1.427h-5.351c.086 2.141 2.322 2.208 3.058 1.353zm-5.124-2.667h3.31c-.07-1.031-.757-1.479-1.651-1.479-.978 0-1.518.512-1.659 1.48m-6.382 4.659H0V3.014h4.635c3.65.054 3.72 3.63 1.814 4.604 2.307.84 2.384 5.374-2.138 5.374M2 7h2.39C6.06 7 6.326 5 4.18 5H2zm2.26 2H2v2.01h2.227C6.264 11.01 6.14 9 4.261 9"
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
export class KbqBehance16 extends KbqSvgIcon {}
