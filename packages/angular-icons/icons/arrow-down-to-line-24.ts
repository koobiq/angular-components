import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowDownToLine24]',
    template: `
        <svg:g>
            <svg:path
                d="M17.362 8.571a.3.3 0 0 0-.422 0l-3.74 3.693V2.55a.3.3 0 0 0-.3-.3h-1.8a.3.3 0 0 0-.3.3v9.714L7.059 8.571a.3.3 0 0 0-.422 0l-1.27 1.254a.3.3 0 0 0 0 .427l6.422 6.34a.3.3 0 0 0 .421 0l6.422-6.34a.3.3 0 0 0 0-.427zM1.5 20.7a.3.3 0 0 0 .3.3h20.4a.3.3 0 0 0 .3-.3v-1.8a.3.3 0 0 0-.3-.3H1.8a.3.3 0 0 0-.3.3z"
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
export class KbqArrowDownToLine24 extends KbqSvgIcon {}
