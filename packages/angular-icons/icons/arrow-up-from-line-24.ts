import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowUpFromLine24]',
    template: `
        <svg:g>
            <svg:path
                d="M6.637 10.408a.3.3 0 0 0 .422 0l3.74-3.716v10.53c0 .166.135.302.3.302h1.8c.166 0 .3-.136.3-.302V6.692l3.741 3.716a.3.3 0 0 0 .422 0l1.27-1.262a.303.303 0 0 0 0-.43L12.21 2.338a.3.3 0 0 0-.421 0l-6.422 6.38a.303.303 0 0 0 0 .43zM1.5 21.448c0 .167.134.302.3.302h20.4c.166 0 .3-.135.3-.302v-1.811a.3.3 0 0 0-.3-.302H1.8a.3.3 0 0 0-.3.302z"
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
export class KbqArrowUpFromLine24 extends KbqSvgIcon {}
