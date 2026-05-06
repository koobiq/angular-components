import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqGossopka24]',
    template: `
        <svg:g>
            <svg:path
                d="M22.5 3.3v4.95a.3.3 0 0 1-.3.3h-1.8a.3.3 0 0 1-.3-.3V4.2a.3.3 0 0 0-.3-.3H4.2a.3.3 0 0 0-.3.3v4.05a.3.3 0 0 1-.3.3H1.8a.3.3 0 0 1-.3-.3V3.3a1.8 1.8 0 0 1 1.8-1.8h17.4a1.8 1.8 0 0 1 1.8 1.8M1.5 20.7v-4.95a.3.3 0 0 1 .3-.3h1.8a.3.3 0 0 1 .3.3v4.05a.3.3 0 0 0 .3.3h15.6a.3.3 0 0 0 .3-.3v-4.05a.3.3 0 0 1 .3-.3h1.8a.3.3 0 0 1 .3.3v4.95a1.8 1.8 0 0 1-1.8 1.8H3.3a1.8 1.8 0 0 1-1.8-1.8"
            />
            <svg:path
                d="M19.42 10.72a.285.285 0 0 1-.288.325h-1.8c-.156 0-.283-.12-.32-.271-.153-.641-.652-1.058-1.456-1.058-1.193 0-1.84.903-1.84 2.42 0 1.603.668 2.42 1.823 2.42.767 0 1.27-.361 1.458-.959.045-.141.169-.25.317-.249l1.823.013c.174.002.312.15.28.322-.267 1.406-1.554 2.936-3.929 2.936-2.403 0-4.21-1.58-4.21-4.483 0-2.914 1.858-4.483 4.21-4.483 2.086 0 3.62 1.105 3.932 3.067M11.199 8.073a.3.3 0 0 0-.3-.3H5.363a.3.3 0 0 0-.3.3V16.2a.3.3 0 0 0 .3.3h1.769a.3.3 0 0 0 .3-.3V9.682h3.467a.3.3 0 0 0 .3-.3z"
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
export class KbqGossopka24 extends KbqSvgIcon {}
