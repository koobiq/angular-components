import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqWrenchBadgePlay16]',
    template: `
        <svg:path
            d="M9.184 1.061a.2.2 0 0 1 .172-.057L12 1.38a.203.203 0 0 1 .115.344l-1.921 1.913a.2.2 0 0 0-.056.183l.312 1.554c.016.08.08.143.16.159l1.558.31a.2.2 0 0 0 .184-.055l1.925-1.917a.204.204 0 0 1 .345.115L15 6.621a.2.2 0 0 1-.058.172l-1.868 1.86a.2.2 0 0 1-.19.054l-3.303-.76-4.607 6.187a2.225 2.225 0 0 1-3.337.226 2.208 2.208 0 0 1 .226-3.326l6.182-4.559-.78-3.368a.2.2 0 0 1 .054-.19zM2.5 12.066a1.01 1.01 0 0 0 0 1.434 1.02 1.02 0 0 0 1.439 0 1.01 1.01 0 0 0 0-1.434 1.02 1.02 0 0 0-1.439 0m8.824-3.027C11.188 8.94 11 9.04 11 9.21v6.578c0 .17.188.27.324.172l4.588-3.288a.214.214 0 0 0 0-.346z"
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
export class KbqWrenchBadgePlay16 extends KbqSvgIcon {}
