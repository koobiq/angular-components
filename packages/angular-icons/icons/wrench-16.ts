import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqWrench16]',
    template: `
        <svg:path
            d="M9.185 1.06a.2.2 0 0 1 .173-.058l2.644.376a.203.203 0 0 1 .115.345L9.694 4.137a.2.2 0 0 0-.056.183l.312 1.554c.016.08.08.143.16.159l1.558.31a.2.2 0 0 0 .184-.055l2.423-2.415a.204.204 0 0 1 .345.115l.378 2.635a.2.2 0 0 1-.058.172l-2.366 2.358a.2.2 0 0 1-.19.054l-3.303-.76-4.093 5.68a2.225 2.225 0 0 1-3.338.225 2.208 2.208 0 0 1 .227-3.326l5.668-4.05-.78-3.37a.2.2 0 0 1 .054-.188zM3.952 13.491a1.01 1.01 0 0 0 0-1.434 1.02 1.02 0 0 0-1.439 0 1.01 1.01 0 0 0 0 1.434 1.02 1.02 0 0 0 1.44 0"
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
export class KbqWrench16 extends KbqSvgIcon {}
