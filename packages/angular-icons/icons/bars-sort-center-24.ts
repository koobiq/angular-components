import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBarsSortCenter24]',
    template: `
        <svg:g>
            <svg:path
                d="M5.55 13.2a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3h12.9a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3zM9.3 19.5a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3h5.4a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3zM1.8 6.9a.3.3 0 0 1-.3-.3V4.8a.3.3 0 0 1 .3-.3h20.4a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3z"
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
export class KbqBarsSortCenter24 extends KbqSvgIcon {}
