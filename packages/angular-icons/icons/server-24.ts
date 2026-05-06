import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqServer24]',
    template: `
        <svg:g>
            <svg:path
                d="M3.3 15a1.8 1.8 0 0 1-1.8-1.8v-2.4A1.8 1.8 0 0 1 3.3 9h17.4a1.8 1.8 0 0 1 1.8 1.8v2.4a1.8 1.8 0 0 1-1.8 1.8zm3.45-3a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0m4.5.6a.3.3 0 0 0 .3.3h8.4a.3.3 0 0 0 .3-.3v-1.2a.3.3 0 0 0-.3-.3h-8.4a.3.3 0 0 0-.3.3zM3.3 22.5a1.8 1.8 0 0 1-1.8-1.8v-2.4a1.8 1.8 0 0 1 1.8-1.8h17.4a1.8 1.8 0 0 1 1.8 1.8v2.4a1.8 1.8 0 0 1-1.8 1.8zm3.45-3a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0m4.5.6a.3.3 0 0 0 .3.3h8.4a.3.3 0 0 0 .3-.3v-1.2a.3.3 0 0 0-.3-.3h-8.4a.3.3 0 0 0-.3.3zM3.3 7.5a1.8 1.8 0 0 1-1.8-1.8V3.3a1.8 1.8 0 0 1 1.8-1.8h17.4a1.8 1.8 0 0 1 1.8 1.8v2.4a1.8 1.8 0 0 1-1.8 1.8zm3.45-3a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0m4.5.6a.3.3 0 0 0 .3.3h8.4a.3.3 0 0 0 .3-.3V3.9a.3.3 0 0 0-.3-.3h-8.4a.3.3 0 0 0-.3.3z"
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
export class KbqServer24 extends KbqSvgIcon {}
