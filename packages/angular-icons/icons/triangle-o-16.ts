import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqTriangleO16]',
    template: `
        <svg:path
            d="m7.95 3.041 5.684 9.364H2.366zm1.056-1.413a1.2 1.2 0 0 0-2.114 0L.64 12.238c-.429.799.2 1.767 1.057 1.767h12.606a1.2 1.2 0 0 0 1.057-1.768z"
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
export class KbqTriangleO16 extends KbqSvgIcon {}
