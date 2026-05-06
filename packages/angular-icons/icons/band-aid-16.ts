import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBandAid16]',
    template: `
        <svg:g>
            <svg:path
                d="m9.025 2.025-5.68 5.692-.002.002-1.316 1.305-.002.001a3.5 3.5 0 0 0 4.947 4.953l1.332-1.288 4.38-4.38 1.294-1.338a3.5 3.5 0 0 0-4.953-4.947m3.052 5.37-.46.46a.2.2 0 0 1-.282 0l-3.189-3.19a.2.2 0 0 1 0-.282l.46-.46a.2.2 0 0 1 .282 0l3.189 3.189a.2.2 0 0 1 0 .282m-4.682 4.682a.2.2 0 0 1-.283 0L3.923 8.888a.2.2 0 0 1 0-.282l.46-.46a.2.2 0 0 1 .283 0l3.188 3.188a.2.2 0 0 1 0 .283zM6.39 7.365a.689.689 0 1 1 .974-.974.689.689 0 0 1-.974.974M9.61 9.609a.689.689 0 1 1-.974-.974.689.689 0 0 1 .974.974M6.972 2.022l.183.178-4.949 4.956-.18-.18a3.5 3.5 0 0 1 4.946-4.954M9.024 13.974l-.158-.159 4.952-4.952.16.165a3.5 3.5 0 0 1-4.953 4.947z"
            />
        </svg:g>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 16 16',
        width: '16',
        height: '16'
    }
})
export class KbqBandAid16 extends KbqSvgIcon {}
