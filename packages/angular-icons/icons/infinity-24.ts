import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqInfinity24]',
    template: `
        <svg:path
            d="M1.664 8.023a5.72 5.72 0 0 1 8.034 0L12 10.302l2.302-2.28a5.72 5.72 0 0 1 8.034 0 5.586 5.586 0 0 1 0 7.955 5.72 5.72 0 0 1-8.034 0L12 13.699l-2.302 2.28a5.72 5.72 0 0 1-8.034 0 5.586 5.586 0 0 1 0-7.955m6.247 1.77a3.176 3.176 0 0 0-4.46 0 3.1 3.1 0 0 0 0 4.415 3.176 3.176 0 0 0 4.46 0L10.14 12zm8.178 4.415a3.176 3.176 0 0 0 4.46 0 3.1 3.1 0 0 0 0-4.416 3.176 3.176 0 0 0-4.46 0L13.86 12z"
        />
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
export class KbqInfinity24 extends KbqSvgIcon {}
