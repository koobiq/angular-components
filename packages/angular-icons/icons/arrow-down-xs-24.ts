import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowDownXs24]',
    template: `
        <svg:path
            d="M13.18 15.08 16.301 12a.3.3 0 0 1 .426 0l1.27 1.259a.31.31 0 0 1 0 .438l-5.785 5.715a.3.3 0 0 1-.426 0l-5.784-5.715a.31.31 0 0 1 0-.438L7.272 12a.3.3 0 0 1 .426 0l3.074 3.03V4.802a.3.3 0 0 1 .299-.302h1.81a.3.3 0 0 1 .298.302z"
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
export class KbqArrowDownXs24 extends KbqSvgIcon {}
