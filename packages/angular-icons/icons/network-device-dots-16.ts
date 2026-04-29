import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-network-device-dots-16,[kbqNetworkDeviceDots16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path d="M5 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2M8 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2" />
                <path
                    d="M1 2.2A1.2 1.2 0 0 1 2.2 1h11.6A1.2 1.2 0 0 1 15 2.2v6.6a1.2 1.2 0 0 1-1.2 1.2h-5v1.367a1.998 1.998 0 0 1 .863 2.944A2 2 0 0 1 6.167 14l-.01-.023a1.997 1.997 0 0 1 1.043-2.61V10h-5A1.2 1.2 0 0 1 1 8.8zm1.8 6.2h10.4a.2.2 0 0 0 .2-.2V2.8a.2.2 0 0 0-.2-.2H2.8a.2.2 0 0 0-.2.2v5.4c0 .11.09.2.2.2"
                />
                <path
                    d="M11.2 13.2a3.2 3.2 0 0 1-.102.8H14.8a.2.2 0 0 0 .2-.2v-1.2a.2.2 0 0 0-.2-.2h-3.702a3.2 3.2 0 0 1 .102.8M1 13.8c0 .11.09.2.2.2h3.702a3.2 3.2 0 0 1 0-1.6H1.2a.2.2 0 0 0-.2.2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqNetworkDeviceDots16 extends KbqSvgIcon {}
