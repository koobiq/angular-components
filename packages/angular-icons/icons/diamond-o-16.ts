import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqDiamondO16]',
    template: `
        <svg:path
            d="M2.766 8 8 2.766 13.234 8 8 13.234zM.645 7.859a.2.2 0 0 0 0 .282l7.214 7.214a.2.2 0 0 0 .282 0l7.214-7.214a.2.2 0 0 0 0-.282L8.141.645a.2.2 0 0 0-.282 0z"
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
export class KbqDiamondO16 extends KbqSvgIcon {}
