import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-clipboard-check-o-24,[kbqClipboardCheckO24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M10.965 4.052a1 1 0 0 1 1.004-.997 1 1 0 0 1 1.003.997 1 1 0 0 1-1.003.997 1 1 0 0 1-1.004-.997M7.66 12.822a.993.993 0 0 0 0 1.41l2.596 2.58c.392.39 1.027.39 1.419 0l5.103-5.073a.993.993 0 0 0 0-1.41l-.086-.086a1.01 1.01 0 0 0-1.419 0l-4.308 4.282-1.799-1.789a1.01 1.01 0 0 0-1.42 0z"
                />
                <path
                    d="M6.955 2.057H5.007A2 2 0 0 0 3 4.052v17.953A2 2 0 0 0 5.007 24h13.986A2 2 0 0 0 21 22.005V4.052a2 2 0 0 0-2.007-1.995h-2.007C16.921 1.014 16.046 0 14.98 0H8.96c-1.067 0-1.94 1.014-2.004 2.057m8.024-.062.502 2.057h3.512v17.953H5.007V4.052h3.45l.501-2.057z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqClipboardCheckO24 extends KbqSvgIcon {}
