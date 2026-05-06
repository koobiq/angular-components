import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqEjectDown24]',
    template: `
        <svg:g>
            <svg:path
                d="M22.5 7.207 12.246 20.872a.3.3 0 0 1-.492 0L1.5 7.207zM1.5 3.307a.3.3 0 0 1 .3-.3h20.4a.3.3 0 0 1 .3.3v2.1h-21z"
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
export class KbqEjectDown24 extends KbqSvgIcon {}
