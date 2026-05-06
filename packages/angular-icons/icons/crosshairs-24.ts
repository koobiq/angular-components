import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCrosshairs24]',
    template: `
        <svg:g>
            <svg:path d="M15.375 12a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0" />
            <svg:path
                d="M13.2.3a.3.3 0 0 0-.3-.3h-1.8a.3.3 0 0 0-.3.3v1.268A10.504 10.504 0 0 0 1.568 10.8H.3a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3h1.268a10.505 10.505 0 0 0 9.232 9.232V23.7a.3.3 0 0 0 .3.3h1.8a.3.3 0 0 0 .3-.3v-1.268a10.505 10.505 0 0 0 9.232-9.232H23.7a.3.3 0 0 0 .3-.3v-1.8a.3.3 0 0 0-.3-.3h-1.268A10.505 10.505 0 0 0 13.2 1.568zM3.988 10.8A8.11 8.11 0 0 1 10.8 3.988V5.7a.3.3 0 0 0 .3.3h1.8a.3.3 0 0 0 .3-.3V3.988a8.11 8.11 0 0 1 6.812 6.812H18.3a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3h1.712a8.11 8.11 0 0 1-6.812 6.812V18.3a.3.3 0 0 0-.3-.3h-1.8a.3.3 0 0 0-.3.3v1.712A8.11 8.11 0 0 1 3.988 13.2H5.7a.3.3 0 0 0 .3-.3v-1.8a.3.3 0 0 0-.3-.3z"
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
export class KbqCrosshairs24 extends KbqSvgIcon {}
