import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChevronsCompress24]',
    template: `
        <svg:g>
            <svg:path
                d="M1.5 9.075a.3.3 0 0 0 .3.3h5.775a1.8 1.8 0 0 0 1.8-1.8V1.8a.3.3 0 0 0-.3-.3h-1.8a.3.3 0 0 0-.3.3v4.875a.3.3 0 0 1-.3.3H1.8a.3.3 0 0 0-.3.3zM1.5 14.925a.3.3 0 0 1 .3-.3h5.775a1.8 1.8 0 0 1 1.8 1.8V22.2a.3.3 0 0 1-.3.3h-1.8a.3.3 0 0 1-.3-.3v-4.875a.3.3 0 0 0-.3-.3H1.8a.3.3 0 0 1-.3-.3zM22.5 9.075a.3.3 0 0 1-.3.3h-5.775a1.8 1.8 0 0 1-1.8-1.8V1.8a.3.3 0 0 1 .3-.3h1.8a.3.3 0 0 1 .3.3v4.875a.3.3 0 0 0 .3.3H22.2a.3.3 0 0 1 .3.3zM22.5 14.925a.3.3 0 0 0-.3-.3h-5.775a1.8 1.8 0 0 0-1.8 1.8V22.2a.3.3 0 0 0 .3.3h1.8a.3.3 0 0 0 .3-.3v-4.875a.3.3 0 0 1 .3-.3H22.2a.3.3 0 0 0 .3-.3z"
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
export class KbqChevronsCompress24 extends KbqSvgIcon {}
