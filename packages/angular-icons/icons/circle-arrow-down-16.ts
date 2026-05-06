import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCircleArrowDown16]',
    template: `
        <svg:path
            d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14m.428-3.13-.03.029-.258.258a.2.2 0 0 1-.283 0l-.566-.566-.013-.015-3.06-3.06a.2.2 0 0 1 0-.283l.565-.566a.2.2 0 0 1 .283 0L7.4 10.002V4.2c0-.11.09-.2.2-.2h.8c.11 0 .2.09.2.2v5.802l2.334-2.335a.2.2 0 0 1 .283 0l.566.566a.2.2 0 0 1 0 .283z"
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
export class KbqCircleArrowDown16 extends KbqSvgIcon {}
