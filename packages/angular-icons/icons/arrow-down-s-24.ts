import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowDownS24]',
    template: `
        <svg:path
            d="m13.18 16.58 3.784-3.742a.3.3 0 0 1 .426 0l1.269 1.259a.31.31 0 0 1 0 .438l-6.446 6.377a.3.3 0 0 1-.426 0L5.34 14.535a.31.31 0 0 1 0-.438l1.269-1.259a.3.3 0 0 1 .427 0l3.734 3.692V3.302a.3.3 0 0 1 .3-.302h1.809a.3.3 0 0 1 .3.302z"
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
export class KbqArrowDownS24 extends KbqSvgIcon {}
