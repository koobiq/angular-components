import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqPencilOnLine24]',
    template: `
        <svg:path
            d="M18.013 1.256a1.73 1.73 0 0 0-2.444 0l-1.235 1.235 5.698 5.698 1.235-1.235a1.73 1.73 0 0 0 0-2.444zm.797 8.155-5.698-5.698-7.84 7.84 5.699 5.697zM3.006 19.175a.288.288 0 0 0 .342.341l6.15-1.294L4.3 13.025zM1.5 23.7a.3.3 0 0 0 .3.3h20.4a.3.3 0 0 0 .3-.3V21a.3.3 0 0 0-.3-.3H1.8a.3.3 0 0 0-.3.3z"
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
export class KbqPencilOnLine24 extends KbqSvgIcon {}
