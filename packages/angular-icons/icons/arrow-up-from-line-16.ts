import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowUpFromLine16]',
    template: `
        <svg:g>
            <svg:path
                d="M4.425 6.939a.2.2 0 0 0 .281 0L7.2 4.46v6.52a.2.2 0 0 0 .2.201h1.2a.2.2 0 0 0 .2-.2v-6.52l2.494 2.477a.2.2 0 0 0 .28 0l.847-.841a.2.2 0 0 0 0-.287l-4.28-4.253a.2.2 0 0 0-.282 0L3.58 5.811a.2.2 0 0 0 0 .287zM1 13.799a.2.2 0 0 0 .2.201h13.6a.2.2 0 0 0 .2-.201V12.59a.2.2 0 0 0-.2-.201H1.2a.2.2 0 0 0-.2.201z"
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
export class KbqArrowUpFromLine16 extends KbqSvgIcon {}
