import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqGatewayEnvelope16]',
    template: `
        <svg:g>
            <svg:path
                d="M15 8.8a1.2 1.2 0 0 1-1.2 1.2h-5v1.166A2.001 2.001 0 0 1 8 15a2 2 0 0 1-.8-3.834V10h-5A1.2 1.2 0 0 1 1 8.8V4.456l7 3.376 7-3.376z"
            />
            <svg:path
                d="M4.9 12.2a3.2 3.2 0 0 0 0 1.6H1.2a.2.2 0 0 1-.2-.2v-1.2c0-.11.09-.2.2-.2zM14.8 12.2c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2h-3.7a3.2 3.2 0 0 0 0-1.6zM13.8 1A1.2 1.2 0 0 1 15 2.2v.923L8 6.5 1 3.123V2.2A1.2 1.2 0 0 1 2.2 1z"
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
export class KbqGatewayEnvelope16 extends KbqSvgIcon {}
