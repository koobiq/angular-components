import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqNetworkDevice16]',
    template: `
        <svg:g>
            <svg:path
                d="M1 2.2A1.2 1.2 0 0 1 2.2 1h11.6A1.2 1.2 0 0 1 15 2.2v6.4a1.2 1.2 0 0 1-1.2 1.2h-5v1.366a2 2 0 1 1-1.6 0V9.8h-5A1.2 1.2 0 0 1 1 8.6zm1.6.6V8c0 .11.09.2.2.2h10.4a.2.2 0 0 0 .2-.2V2.8a.2.2 0 0 0-.2-.2H2.8a.2.2 0 0 0-.2.2"
            />
            <svg:path
                d="M11.1 13.8a3.2 3.2 0 0 0 0-1.6h3.7c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2zM4.9 13.8H1.2a.2.2 0 0 1-.2-.2v-1.2c0-.11.09-.2.2-.2h3.7a3.2 3.2 0 0 0 0 1.6"
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
export class KbqNetworkDevice16 extends KbqSvgIcon {}
