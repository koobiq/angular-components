import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqScan24]',
    template: `
        <svg:g>
            <svg:path
                d="M3.6 16.5a.3.3 0 0 1 .3.3v3.3h3.3a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3H1.8a.3.3 0 0 1-.3-.3v-5.4a.3.3 0 0 1 .3-.3zM22.2 16.5c.165 0 .3.135.3.3v5.4c0 .165-.135.3-.3.3h-5.4a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3h3.3v-3.3a.3.3 0 0 1 .3-.3zM22.2 10.5c.165 0 .3.168.3.375v2.25c0 .207-.135.375-.3.375H1.8c-.166 0-.3-.168-.3-.375v-2.25c0-.207.134-.375.3-.375zM7.2 1.5a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3H3.9v3.3a.3.3 0 0 1-.3.3H1.8a.3.3 0 0 1-.3-.3V1.8a.3.3 0 0 1 .3-.3zM22.2 1.5a.3.3 0 0 1 .3.3v5.4a.3.3 0 0 1-.3.3h-1.8a.3.3 0 0 1-.3-.3V3.9h-3.3a.3.3 0 0 1-.3-.3V1.8a.3.3 0 0 1 .3-.3z"
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
export class KbqScan24 extends KbqSvgIcon {}
