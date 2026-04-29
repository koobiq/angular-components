import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-network-device-multiple-16,[kbqNetworkDeviceMultiple16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M13.2 2.6c.11 0 .2.09.2.2v5.4h.4A1.2 1.2 0 0 0 15 7V2.2A1.2 1.2 0 0 0 13.8 1H5a1.2 1.2 0 0 0-1.2 1.2v.4z"
                />
                <path
                    d="M2.2 3.8A1.2 1.2 0 0 0 1 5v4.8A1.2 1.2 0 0 0 2.2 11h3.6v1.231a1.499 1.499 0 0 0 .8 2.77 1.5 1.5 0 0 0 .8-2.77v-1.23H11a1.2 1.2 0 0 0 1.2-1.2V5A1.2 1.2 0 0 0 11 3.8zm.6 1.6h7.6c.11 0 .2.09.2.2v3.6a.2.2 0 0 1-.2.2H2.8a.2.2 0 0 1-.2-.2V5.6c0-.11.09-.2.2-.2"
                />
                <path
                    d="M9.18 14.3a2.7 2.7 0 0 0 0-1.6H12c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2zM4.02 14.3H1.2a.2.2 0 0 1-.2-.2v-1.2c0-.11.09-.2.2-.2h2.82a2.7 2.7 0 0 0 0 1.6"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqNetworkDeviceMultiple16 extends KbqSvgIcon {}
