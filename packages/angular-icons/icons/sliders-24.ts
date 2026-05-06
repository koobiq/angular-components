import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqSliders24]',
    template: `
        <svg:g>
            <svg:path
                d="M6.15 22.5a.3.3 0 0 0 .3-.3v-2.7H8.7a.3.3 0 0 0 .3-.3v-3.15a.3.3 0 0 0-.3-.3H6.45V1.8a.3.3 0 0 0-.3-.3h-1.8a.3.3 0 0 0-.3.3v13.95H1.8a.3.3 0 0 0-.3.3v3.15a.3.3 0 0 0 .3.3h2.25v2.7a.3.3 0 0 0 .3.3zM13.2 6.3V1.8a.3.3 0 0 0-.3-.3h-1.8a.3.3 0 0 0-.3.3v4.5H8.55a.3.3 0 0 0-.3.3v3.15a.3.3 0 0 0 .3.3h2.25V22.2a.3.3 0 0 0 .3.3h1.8a.3.3 0 0 0 .3-.3V10.05h2.25a.3.3 0 0 0 .3-.3V6.6a.3.3 0 0 0-.3-.3zM19.65 22.5a.3.3 0 0 0 .3-.3v-4.65h2.25a.3.3 0 0 0 .3-.3V14.1a.3.3 0 0 0-.3-.3h-2.25v-12a.3.3 0 0 0-.3-.3h-1.8a.3.3 0 0 0-.3.3v12H15.3a.3.3 0 0 0-.3.3v3.15a.3.3 0 0 0 .3.3h2.25v4.65a.3.3 0 0 0 .3.3z"
            />
        </svg:g>
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
export class KbqSliders24 extends KbqSvgIcon {}
