import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCircleArrowRight16]',
    template: `
        <svg:path
            d="M15 8A7 7 0 1 0 1 8a7 7 0 0 0 14 0m-3.13-.428.029.03.258.258a.2.2 0 0 1 0 .283l-.566.566-.015.013-3.06 3.06a.2.2 0 0 1-.283 0l-.566-.565a.2.2 0 0 1 0-.283L10.002 8.6H4.2a.2.2 0 0 1-.2-.2v-.8c0-.11.09-.2.2-.2h5.802L7.667 5.066a.2.2 0 0 1 0-.283l.566-.566a.2.2 0 0 1 .283 0z"
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
export class KbqCircleArrowRight16 extends KbqSvgIcon {}
