import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqClockBadgePause24]',
    template: `
        <svg:g>
            <svg:path
                d="M14.4 19.739a8.1 8.1 0 1 1 5.695-8.038h2.4C22.338 6.04 17.7 1.5 12 1.5 6.201 1.5 1.5 6.201 1.5 12S6.201 22.5 12 22.5c.826 0 1.63-.095 2.4-.276z"
            />
            <svg:path
                d="M13.5 13.2a.3.3 0 0 1-.3.3H7a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3h4.1V6.6a.3.3 0 0 1 .3-.3h1.8a.3.3 0 0 1 .3.3zM16.2 13.8a.3.3 0 0 1 .3-.3h2.4a.3.3 0 0 1 .3.3v9.9a.3.3 0 0 1-.3.3h-2.4a.3.3 0 0 1-.3-.3zM21 13.8a.3.3 0 0 1 .3-.3h2.4a.3.3 0 0 1 .3.3v9.9a.3.3 0 0 1-.3.3h-2.4a.3.3 0 0 1-.3-.3z"
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
export class KbqClockBadgePause24 extends KbqSvgIcon {}
