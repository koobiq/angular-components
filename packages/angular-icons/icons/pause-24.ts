import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqPause24]',
    template: `
        <svg:g>
            <svg:path
                d="M13.501 4.8a.3.3 0 0 1 .3-.3h3.9a.3.3 0 0 1 .3.3v14.4a.3.3 0 0 1-.3.3h-3.9a.3.3 0 0 1-.3-.3zM6 4.8a.3.3 0 0 1 .3-.3h3.9a.3.3 0 0 1 .3.3v14.4a.3.3 0 0 1-.3.3H6.3a.3.3 0 0 1-.3-.3z"
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
export class KbqPause24 extends KbqSvgIcon {}
