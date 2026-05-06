import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqPause48]',
    template: `
        <svg:g>
            <svg:path
                d="M19 9h-4c-1.105 0-2 .672-2 1.5v27c0 .828.895 1.5 2 1.5h4c1.105 0 2-.672 2-1.5v-27c0-.828-.895-1.5-2-1.5M33 9h-4c-1.105 0-2 .672-2 1.5v27c0 .828.895 1.5 2 1.5h4c1.105 0 2-.672 2-1.5v-27c0-.828-.895-1.5-2-1.5"
            />
        </svg:g>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 48 48',
        width: '48',
        height: '48'
    }
})
export class KbqPause48 extends KbqSvgIcon {}
