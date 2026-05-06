import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqEnvelopeBadgeArrowRight24]',
    template: `
        <svg:path
            d="M3.3 3a1.8 1.8 0 0 0-1.8 1.8v.45L12 10.315 22.5 5.25V4.8A1.8 1.8 0 0 0 20.7 3zm19.2 4.248L12 12.313 1.5 7.248V19.2A1.8 1.8 0 0 0 3.3 21h6.9v-3.375a.3.3 0 0 1 .3-.3h5.25v-3.744a.3.3 0 0 1 .455-.258L22.5 17.11zm1.356 13.248a.281.281 0 0 0 0-.491l-5.864-3.46c-.205-.121-.47.018-.47.245v2.301h-5.215c-.17 0-.307.13-.307.29v1.738c0 .16.137.29.307.29h5.215v2.301c0 .227.265.366.47.245z"
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
export class KbqEnvelopeBadgeArrowRight24 extends KbqSvgIcon {}
