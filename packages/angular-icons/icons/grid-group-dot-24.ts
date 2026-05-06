import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqGridGroupDot24]',
    template: `
        <svg:path fill="currentColor" d="M24 3a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
        <svg:path
            d="M16.44 1.5H3.3a.3.3 0 0 0-.3.3v20.4a.3.3 0 0 0 .3.3h17.4a.3.3 0 0 0 .3-.3v-1.8a.3.3 0 0 0-.3-.3H5.4V3.9h10.884a4.8 4.8 0 0 1 .155-2.4m1.216 4.944-.1-.1A.3.3 0 0 0 17.4 6.3H8.1a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3h9.3a.3.3 0 0 0 .3-.3V6.6a.3.3 0 0 0-.044-.156M8.1 10.8a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3h9.3a.3.3 0 0 0 .3-.3v-1.8a.3.3 0 0 0-.3-.3zm0 4.5a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3h9.3a.3.3 0 0 0 .3-.3v-1.8a.3.3 0 0 0-.3-.3z"
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
export class KbqGridGroupDot24 extends KbqSvgIcon {}
