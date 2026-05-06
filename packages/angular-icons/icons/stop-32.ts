import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqStop32]',
    template: `
        <svg:path
            d="M6 9.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C7.52 6 8.08 6 9.2 6h13.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C26 7.52 26 8.08 26 9.2v13.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C24.48 26 23.92 26 22.8 26H9.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C6 24.48 6 23.92 6 22.8z"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 32 32',
        width: '32',
        height: '32'
    }
})
export class KbqStop32 extends KbqSvgIcon {}
