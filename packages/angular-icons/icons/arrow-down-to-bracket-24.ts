import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowDownToBracket24]',
    template: `
        <svg:g>
            <svg:path
                d="M1.5 20.7v-6.9a.3.3 0 0 1 .3-.3h1.8a.3.3 0 0 1 .3.3v6a.3.3 0 0 0 .3.3h15.6c-.584 0 .3-.134.3-.3v-6a.3.3 0 0 1 .3-.3h1.8a.3.3 0 0 1 .3.3v6.9c0 .994-1.556 1.8-1.8 1.8H3.3a1.8 1.8 0 0 1-1.8-1.8"
            />
            <svg:path
                d="M10.8 12.264 7.06 8.571a.3.3 0 0 0-.422 0l-1.27 1.254a.3.3 0 0 0 0 .427l6.422 6.34a.3.3 0 0 0 .421 0l6.422-6.34a.3.3 0 0 0 0-.427l-1.27-1.254a.3.3 0 0 0-.422 0l-3.74 3.693V1.8a.3.3 0 0 0-.3-.3h-1.8a.3.3 0 0 0-.3.3z"
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
export class KbqArrowDownToBracket24 extends KbqSvgIcon {}
