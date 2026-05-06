import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCable24]',
    template: `
        <svg:path
            d="M1.5 8.7v4.63A2.7 2.7 0 0 0 0 15.75v3.15a.3.3 0 0 0 .3.3h1.2v1.5a.3.3 0 0 0 .3.3h1.8a.3.3 0 0 0 .3-.3v-1.5h1.2a.3.3 0 0 0 .3-.3v-3.15a2.7 2.7 0 0 0-1.5-2.42V8.7a3.3 3.3 0 0 1 3.3-3.3h.3a3.3 3.3 0 0 1 3.3 3.3v6.6a5.7 5.7 0 0 0 5.7 5.7h.3a5.7 5.7 0 0 0 5.7-5.7v-4.63A2.7 2.7 0 0 0 24 8.25V5.1a.3.3 0 0 0-.3-.3h-1.2V3.3a.3.3 0 0 0-.3-.3h-1.8a.3.3 0 0 0-.3.3v1.5h-1.2a.3.3 0 0 0-.3.3v3.15a2.7 2.7 0 0 0 1.5 2.42v4.63a3.3 3.3 0 0 1-3.3 3.3h-.3a3.3 3.3 0 0 1-3.3-3.3V8.7A5.7 5.7 0 0 0 7.5 3h-.3a5.7 5.7 0 0 0-5.7 5.7"
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
export class KbqCable24 extends KbqSvgIcon {}
