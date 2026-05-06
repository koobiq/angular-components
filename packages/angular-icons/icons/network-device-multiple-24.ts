import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqNetworkDeviceMultiple24]',
    template: `
        <svg:g>
            <svg:path
                d="M19.8 3.9a.3.3 0 0 1 .3.3v8.1h.6a1.8 1.8 0 0 0 1.8-1.8V3.3a1.8 1.8 0 0 0-1.8-1.8H7.5a1.8 1.8 0 0 0-1.8 1.8v.6z"
            />
            <svg:path
                d="M3.3 5.7a1.8 1.8 0 0 0-1.8 1.8v7.2a1.8 1.8 0 0 0 1.8 1.8h5.4v1.846a2.25 2.25 0 1 0 2.4 0V16.5h5.4a1.8 1.8 0 0 0 1.8-1.8V7.5a1.8 1.8 0 0 0-1.8-1.8zm.9 2.4h11.4a.3.3 0 0 1 .3.3v5.4a.3.3 0 0 1-.3.3H4.2a.3.3 0 0 1-.3-.3V8.4a.3.3 0 0 1 .3-.3"
            />
            <svg:path
                d="M13.77 21.45a4.05 4.05 0 0 0 0-2.4H18a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3zM6.03 21.45H1.8a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3h4.23a4.05 4.05 0 0 0 0 2.4"
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
export class KbqNetworkDeviceMultiple24 extends KbqSvgIcon {}
