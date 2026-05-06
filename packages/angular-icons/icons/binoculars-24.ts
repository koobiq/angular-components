import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBinoculars24]',
    template: `
        <svg:g>
            <svg:path
                d="M15.75 5.1H21V1.8a.3.3 0 0 0-.3-.3h-4.65a.3.3 0 0 0-.3.3zM21.212 6.9H15.75v14.4a1.2 1.2 0 0 0 1.2 1.2h5.617a1.2 1.2 0 0 0 1.18-1.411zM13.95 13.5V6.9h-3.9v6.6zM8.25 6.9H2.788L.252 21.089A1.2 1.2 0 0 0 1.433 22.5H7.05a1.2 1.2 0 0 0 1.2-1.2zM7.95 1.5a.3.3 0 0 1 .3.3v3.3H3V1.8a.3.3 0 0 1 .3-.3z"
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
export class KbqBinoculars24 extends KbqSvgIcon {}
