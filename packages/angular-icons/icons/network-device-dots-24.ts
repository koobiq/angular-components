import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqNetworkDeviceDots24]',
    template: `
        <svg:g>
            <svg:path d="M7.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M12 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
            <svg:path
                d="M1.5 3.3a1.8 1.8 0 0 1 1.8-1.8h17.4a1.8 1.8 0 0 1 1.8 1.8v9.9a1.8 1.8 0 0 1-1.8 1.8h-7.5v2.05A3 3 0 1 1 9.25 21l-.014-.034A3 3 0 0 1 10.8 17.05V15H3.3a1.8 1.8 0 0 1-1.8-1.8zm2.7 9.3h15.6a.3.3 0 0 0 .3-.3V4.2a.3.3 0 0 0-.3-.3H4.2a.3.3 0 0 0-.3.3v8.1a.3.3 0 0 0 .3.3"
            />
            <svg:path
                d="M16.8 19.8c0 .407-.052.81-.152 1.2H22.2a.3.3 0 0 0 .3-.3v-1.8a.3.3 0 0 0-.3-.3h-5.552c.1.389.152.792.152 1.2M1.5 20.7a.3.3 0 0 0 .3.3h5.552a4.8 4.8 0 0 1 0-2.4H1.8a.3.3 0 0 0-.3.3z"
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
export class KbqNetworkDeviceDots24 extends KbqSvgIcon {}
