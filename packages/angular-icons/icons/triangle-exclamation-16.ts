import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqTriangleExclamation16]',
    template: `
        <svg:path
            d="M9.04 2.3a1.2 1.2 0 0 0-2.08 0l-5.715 9.9a1.2 1.2 0 0 0 1.04 1.8h11.43a1.2 1.2 0 0 0 1.04-1.8zm-.256 2.3c.124 0 .223.105.215.23L8.664 9.6a.216.216 0 0 1-.215.201h-.9a.216.216 0 0 1-.215-.202L7 4.829a.216.216 0 0 1 .215-.23zM8 12.447a.957.957 0 1 1 0-1.914.957.957 0 0 1 0 1.914"
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
export class KbqTriangleExclamation16 extends KbqSvgIcon {}
