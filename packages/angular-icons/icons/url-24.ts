import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqUrl24]',
    template: `
        <svg:g>
            <svg:path
                d="M8.359 7.07a.2.2 0 0 0-.2-.2H6.427a.2.2 0 0 0-.2.2v6.165c0 1.152-.807 1.984-2.048 1.984-1.235 0-2.047-.832-2.047-1.984V7.07a.2.2 0 0 0-.2-.2H.2a.2.2 0 0 0-.2.2v6.347c0 2.206 1.664 3.678 4.18 3.678 2.505 0 4.179-1.472 4.179-3.678zM9.48 16.952a.2.2 0 0 1-.2-.2V7.07c0-.11.09-.2.2-.2h3.778c2.29 0 3.614 1.29 3.614 3.293 0 1.379-.635 2.378-1.782 2.87l1.98 3.623a.2.2 0 0 1-.176.296h-1.896a.2.2 0 0 1-.177-.106l-1.853-3.468h-1.556v3.374a.2.2 0 0 1-.2.2zm1.932-5.287h1.448c1.22 0 1.816-.502 1.816-1.502 0-1.004-.596-1.55-1.826-1.55h-1.438zM17.746 16.952a.2.2 0 0 1-.2-.2V7.07c0-.11.09-.2.2-.2h1.732c.11 0 .2.09.2.2v8.124H23.8c.11 0 .2.09.2.2v1.358a.2.2 0 0 1-.2.2z"
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
export class KbqUrl24 extends KbqSvgIcon {}
