import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqDataflow24]',
    template: `
        <svg:path
            d="M1.7 1.5a.2.2 0 0 0-.2.2v5.6c0 .11.09.2.2.2h5.6a.2.2 0 0 0 .2-.2V5.7h8.55a2.55 2.55 0 0 1 0 5.1h-1.3a3 3 0 0 0-5.5 0h-1.3a4.95 4.95 0 0 0 0 9.9h8.55v1.6c0 .11.09.2.2.2h5.6a.2.2 0 0 0 .2-.2v-5.6a.2.2 0 0 0-.2-.2h-5.6a.2.2 0 0 0-.2.2v1.6H7.95a2.55 2.55 0 1 1 0-5.1h1.3a3 3 0 0 0 5.5 0h1.3a4.95 4.95 0 0 0 0-9.9H7.5V1.7a.2.2 0 0 0-.2-.2z"
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
export class KbqDataflow24 extends KbqSvgIcon {}
