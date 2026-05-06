import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBranch16]',
    template: `
        <svg:path
            d="M4.6 4.908a2 2 0 1 0-1.2 0v6.184a2 2 0 1 0 1.2 0V9.6H7a6.6 6.6 0 0 0 6.299-4.622 2 2 0 1 0-1.201-.193A5.4 5.4 0 0 1 7 8.4H4.6z"
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
export class KbqBranch16 extends KbqSvgIcon {}
