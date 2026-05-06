import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqListExpand16]',
    template: `
        <svg:g>
            <svg:path
                d="M1.03 4.4a.2.2 0 0 0 .17.304h1.59v2.3c0 .11.089.2.2.2h1.2a.2.2 0 0 0 .2-.2v-2.3h1.589a.2.2 0 0 0 .17-.304L3.758.594a.2.2 0 0 0-.34 0zM15 3.433a.2.2 0 0 1-.2.2H8.298a.2.2 0 0 1-.2-.2v-1.2c0-.11.09-.2.2-.2H14.8c.11 0 .2.09.2.2zM15 8.633a.2.2 0 0 1-.2.2H6.2a.2.2 0 0 1-.2-.2v-1.2c0-.11.09-.2.2-.2h8.6c.11 0 .2.09.2.2zM14.8 14.033a.2.2 0 0 0 .2-.2v-1.2a.2.2 0 0 0-.2-.2H8.3a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2zM4.39 11.296v-2.3a.2.2 0 0 0-.2-.2h-1.2a.2.2 0 0 0-.2.2v2.3H1.2a.2.2 0 0 0-.17.304l2.39 3.806a.2.2 0 0 0 .34 0L6.147 11.6a.2.2 0 0 0-.17-.304z"
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
export class KbqListExpand16 extends KbqSvgIcon {}
