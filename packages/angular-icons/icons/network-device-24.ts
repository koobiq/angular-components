import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqNetworkDevice24]',
    template: `
        <svg:g>
            <svg:path
                d="M1.5 3.3a1.8 1.8 0 0 1 1.8-1.8h17.4a1.8 1.8 0 0 1 1.8 1.8v9.6a1.8 1.8 0 0 1-1.8 1.8h-7.5v2.05a3 3 0 1 1-2.4 0V14.7H3.3a1.8 1.8 0 0 1-1.8-1.8zm2.4.9V12a.3.3 0 0 0 .3.3h15.6a.3.3 0 0 0 .3-.3V4.2a.3.3 0 0 0-.3-.3H4.2a.3.3 0 0 0-.3.3"
            />
            <svg:path
                d="M16.649 20.7a4.8 4.8 0 0 0 0-2.4H22.2a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3zM7.351 20.7H1.8a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3h5.551a4.8 4.8 0 0 0 0 2.4"
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
export class KbqNetworkDevice24 extends KbqSvgIcon {}
