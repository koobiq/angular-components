import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFileHorizontalO16]',
    template: `
        <svg:path
            d="M16 6.083a.2.2 0 0 0-.059-.142L12.06 2.06A.2.2 0 0 0 11.917 2H1.2A1.2 1.2 0 0 0 0 3.2v9.6A1.2 1.2 0 0 0 1.2 14h13.6a1.2 1.2 0 0 0 1.2-1.2zM14.4 7v5.2a.2.2 0 0 1-.2.2H1.8a.2.2 0 0 1-.2-.2V3.8c0-.11.09-.2.2-.2H11v3.2c0 .11.09.2.2.2z"
        />
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
export class KbqFileHorizontalO16 extends KbqSvgIcon {}
