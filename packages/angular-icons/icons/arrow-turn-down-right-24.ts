import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowTurnDownRight24]',
    template: `
        <svg:path
            d="M5.417 3.3c0-.165-.135-.3-.302-.3H3.302A.3.3 0 0 0 3 3.3v12.618c0 .166.135.3.302.3h13.196l-3.766 3.745a.3.3 0 0 0 0 .424l1.282 1.275c.118.117.309.117.427 0l6.47-6.433a.3.3 0 0 0 0-.425l-6.47-6.433a.303.303 0 0 0-.427 0l-1.282 1.275a.3.3 0 0 0 0 .424l3.766 3.745H5.418z"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        width: '24',
        height: '24'
    }
})
export class KbqArrowTurnDownRight24 extends KbqSvgIcon {}
