import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowsRetweet16]',
    template: `
        <svg:g>
            <svg:path
                d="M9.694 6.33A.2.2 0 0 0 10 6.164V4.645h3.2c.11 0 .2.089.2.198v6.316c0 .11-.09.198-.2.198h-1.974c-.11 0-.2.088-.2.197v1.184c0 .11.09.198.2.198H14.8c.11 0 .2-.089.2-.198V3.263a.2.2 0 0 0-.2-.198H10V1.448a.2.2 0 0 0-.306-.168L5.871 3.638a.196.196 0 0 0 0 .335zM4.37 3.065c.11 0 .2.089.2.198v1.184c0 .11-.09.197-.2.197H2.8c-.11 0-.2.089-.2.198v6.316c0 .11.09.198.2.198h2.8v-1.52a.2.2 0 0 1 .306-.167l3.823 2.358a.196.196 0 0 1 0 .335L5.906 14.72a.2.2 0 0 1-.306-.168v-1.617H1.2c-.11 0-.2-.089-.2-.198V3.263c0-.11.09-.198.2-.198z"
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
export class KbqArrowsRetweet16 extends KbqSvgIcon {}
