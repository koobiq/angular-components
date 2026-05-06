import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqHpux16]',
    template: `
        <svg:path
            d="m9.222 11.065-1.43 3.932.207.003a7 7 0 1 0-.314-13.992L6.254 4.943H7.5c.742 0 1.142.57.888 1.27l-1.745 4.795a.09.09 0 0 1-.082.058l-1.296-.001a.088.088 0 0 1-.083-.117l1.853-5.084H5.92l-1.874 5.143a.09.09 0 0 1-.083.058H2.666a.087.087 0 0 1-.083-.117l3.528-9.69a7.001 7.001 0 0 0 .264 13.55l3.57-9.807a.09.09 0 0 1 .083-.058h2.67c.743 0 1.143.57.888 1.27l-1.552 4.262c-.117.325-.497.59-.843.59zm1.9-5.206h1.113l-1.56 4.283H9.56z"
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
export class KbqHpux16 extends KbqSvgIcon {}
