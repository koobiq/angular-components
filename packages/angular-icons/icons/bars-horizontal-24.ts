import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBarsHorizontal24]',
    template: `
        <svg:g>
            <svg:path
                d="M1.5 3.3a.3.3 0 0 1 .3-.3h20.4a.3.3 0 0 1 .3.3v3.15a.3.3 0 0 1-.3.3H1.8a.3.3 0 0 1-.3-.3zM1.5 17.55a.3.3 0 0 1 .3-.3h20.4a.3.3 0 0 1 .3.3v3.15a.3.3 0 0 1-.3.3H1.8a.3.3 0 0 1-.3-.3zM22.5 10.425a.3.3 0 0 0-.3-.3H1.8a.3.3 0 0 0-.3.3v3.15a.3.3 0 0 0 .3.3h20.4a.3.3 0 0 0 .3-.3z"
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
export class KbqBarsHorizontal24 extends KbqSvgIcon {}
