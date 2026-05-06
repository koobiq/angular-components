import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqGossopka16]',
    template: `
        <svg:g>
            <svg:path
                d="M15 2.2v3.3a.2.2 0 0 1-.2.2h-1.2a.2.2 0 0 1-.2-.2V2.8a.2.2 0 0 0-.2-.2H2.8a.2.2 0 0 0-.2.2v2.7a.2.2 0 0 1-.2.2H1.2a.2.2 0 0 1-.2-.2V2.2A1.2 1.2 0 0 1 2.2 1h11.6A1.2 1.2 0 0 1 15 2.2M1 13.8v-3.3c0-.11.09-.2.2-.2h1.2c.11 0 .2.09.2.2v2.7c0 .11.09.2.2.2h10.4a.2.2 0 0 0 .2-.2v-2.7c0-.11.09-.2.2-.2h1.2c.11 0 .2.09.2.2v3.3a1.2 1.2 0 0 1-1.2 1.2H2.2A1.2 1.2 0 0 1 1 13.8"
            />
            <svg:path
                d="M12.947 7.147a.19.19 0 0 1-.192.217h-1.2c-.104 0-.189-.08-.213-.182-.103-.427-.436-.705-.971-.705-.796 0-1.227.603-1.227 1.614 0 1.068.446 1.614 1.215 1.614.512 0 .846-.242.973-.64.03-.094.112-.167.21-.166l1.216.009c.116 0 .208.1.186.214-.177.938-1.035 1.957-2.619 1.957-1.602 0-2.806-1.054-2.806-2.988 0-1.943 1.238-2.989 2.806-2.989 1.391 0 2.414.737 2.622 2.045M7.466 5.382a.2.2 0 0 0-.2-.2H3.575a.2.2 0 0 0-.2.2V10.8c0 .11.09.2.2.2h1.18a.2.2 0 0 0 .2-.2V6.454h2.31a.2.2 0 0 0 .2-.2z"
            />
        </svg:g>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 16 16',
        width: '16',
        height: '16'
    }
})
export class KbqGossopka16 extends KbqSvgIcon {}
