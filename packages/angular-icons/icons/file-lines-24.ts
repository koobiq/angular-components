import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFileLines24]',
    template: `
        <svg:path
            d="M3 1.8A1.8 1.8 0 0 1 4.8 0h14.4A1.8 1.8 0 0 1 21 1.8v20.4a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 22.2zm9 17.7v-1.2a.3.3 0 0 0-.3-.3H6.3a.3.3 0 0 0-.3.3v1.2a.3.3 0 0 0 .3.3h5.4a.3.3 0 0 0 .3-.3M6 15a.3.3 0 0 0 .3.3h11.4a.3.3 0 0 0 .3-.3v-1.2a.3.3 0 0 0-.3-.3H6.3a.3.3 0 0 0-.3.3zm12-4.5V9.3a.3.3 0 0 0-.3-.3H6.3a.3.3 0 0 0-.3.3v1.2a.3.3 0 0 0 .3.3h11.4a.3.3 0 0 0 .3-.3M6 6a.3.3 0 0 0 .3.3h11.4A.3.3 0 0 0 18 6V4.8a.3.3 0 0 0-.3-.3H6.3a.3.3 0 0 0-.3.3z"
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
export class KbqFileLines24 extends KbqSvgIcon {}
