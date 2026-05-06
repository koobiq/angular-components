import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowLeftToLine24]',
    template: `
        <svg:g>
            <svg:path
                d="M15.429 17.362a.3.3 0 0 0 0-.422l-3.693-3.74H22.2a.3.3 0 0 0 .3-.3v-1.8a.3.3 0 0 0-.3-.3H11.736l3.693-3.741a.3.3 0 0 0 0-.422l-1.254-1.27a.3.3 0 0 0-.427 0l-6.34 6.422a.3.3 0 0 0 0 .421l6.34 6.422a.3.3 0 0 0 .427 0zM3.3 1.5a.3.3 0 0 0-.3.3v20.4a.3.3 0 0 0 .3.3h1.8a.3.3 0 0 0 .3-.3V1.8a.3.3 0 0 0-.3-.3z"
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
export class KbqArrowLeftToLine24 extends KbqSvgIcon {}
