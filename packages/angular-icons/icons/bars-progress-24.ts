import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBarsProgress24]',
    template: `
        <svg:path
            d="M1.5 4.8A1.8 1.8 0 0 1 3.3 3h17.4a1.8 1.8 0 0 1 1.8 1.8v1.4A1.8 1.8 0 0 1 20.7 8H3.3a1.8 1.8 0 0 1-1.8-1.8zm0 6.5a1.8 1.8 0 0 1 1.8-1.8h17.4a1.8 1.8 0 0 1 1.8 1.8v1.4a1.8 1.8 0 0 1-1.8 1.8H3.3a1.8 1.8 0 0 1-1.8-1.8zm0 6.5A1.8 1.8 0 0 1 3.3 16h17.4a1.8 1.8 0 0 1 1.8 1.8v1.4a1.8 1.8 0 0 1-1.8 1.8H3.3a1.8 1.8 0 0 1-1.8-1.8zM8.79 4.605a.3.3 0 0 0-.3.3v1.2a.3.3 0 0 0 .3.3h11.4a.3.3 0 0 0 .3-.3v-1.2a.3.3 0 0 0-.3-.3zm6 6.505a.3.3 0 0 0-.3.3v1.2a.3.3 0 0 0 .3.3h5.4a.3.3 0 0 0 .3-.3v-1.2a.3.3 0 0 0-.3-.3zm-9.3 6.8v1.2a.3.3 0 0 0 .3.3h14.4a.3.3 0 0 0 .3-.3v-1.2a.3.3 0 0 0-.3-.3H5.79a.3.3 0 0 0-.3.3"
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
export class KbqBarsProgress24 extends KbqSvgIcon {}
