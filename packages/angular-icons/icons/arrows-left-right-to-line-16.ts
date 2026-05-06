import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowsLeftRightToLine16]',
    template: `
        <svg:g>
            <svg:path
                d="M0 2.2c0-.11.09-.2.2-.2h1.2c.11 0 .2.09.2.2v11.6a.2.2 0 0 1-.2.2H.2a.2.2 0 0 1-.2-.2zM14.4 2.2c0-.11.09-.2.2-.2h1.2c.11 0 .2.09.2.2v11.6a.2.2 0 0 1-.2.2h-1.2a.2.2 0 0 1-.2-.2zM10.56 5.12a.1.1 0 0 0-.16.08v2H5.6v-2a.1.1 0 0 0-.16-.08l-3.733 2.8a.1.1 0 0 0 0 .16l3.733 2.8a.1.1 0 0 0 .16-.08v-2h4.8v2a.1.1 0 0 0 .16.08l3.733-2.8a.1.1 0 0 0 0-.16z"
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
export class KbqArrowsLeftRightToLine16 extends KbqSvgIcon {}
