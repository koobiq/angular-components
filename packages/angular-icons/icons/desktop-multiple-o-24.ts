import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqDesktopMultipleO24]',
    template: `
        <svg:g>
            <svg:path
                d="M6 3.9h13.8a.3.3 0 0 1 .3.3v9.3h.6a1.8 1.8 0 0 0 1.8-1.8V3.3a1.8 1.8 0 0 0-1.8-1.8H7.8A1.8 1.8 0 0 0 6 3.3z"
            />
            <svg:path
                d="M16.5 5.7a1.8 1.8 0 0 1 1.8 1.8v8.4a1.8 1.8 0 0 1-1.8 1.8h-4.65v2.4h3.6a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3H4.2a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3h3.6v-2.4H3.3a1.8 1.8 0 0 1-1.8-1.8V7.5a1.8 1.8 0 0 1 1.8-1.8zm-.9 2.4H4.2a.3.3 0 0 0-.3.3V15a.3.3 0 0 0 .3.3h11.4a.3.3 0 0 0 .3-.3V8.4a.3.3 0 0 0-.3-.3"
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
export class KbqDesktopMultipleO24 extends KbqSvgIcon {}
