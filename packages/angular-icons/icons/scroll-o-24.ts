import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqScrollO24]',
    template: `
        <svg:g>
            <svg:path
                d="M5.7 6.3A.3.3 0 0 1 6 6h7.2a.3.3 0 0 1 .3.3v1.2a.3.3 0 0 1-.3.3H6a.3.3 0 0 1-.3-.3zM5.707 10.605a.3.3 0 0 1 .3-.3h8.995a.3.3 0 0 1 .3.3v1.2a.3.3 0 0 1-.3.3H6.007a.3.3 0 0 1-.3-.3z"
            />
            <svg:path
                d="M1.5 3.3v15.075A4.125 4.125 0 0 0 6 22.483v.017h12a4.5 4.5 0 0 0 4.5-4.5v-3.45a.3.3 0 0 0-.3-.3h-2.7V3.3a1.8 1.8 0 0 0-1.8-1.8H3.3a1.8 1.8 0 0 0-1.8 1.8m5.85 11.25v3.826a1.724 1.724 0 1 1-3.45-.001V16.65h.002v-2.4H3.9V4.2a.3.3 0 0 1 .3-.3h12.6a.3.3 0 0 1 .3.3v10.05H7.65a.3.3 0 0 0-.3.3"
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
export class KbqScrollO24 extends KbqSvgIcon {}
