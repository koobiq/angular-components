import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqTopology24]',
    template: `
        <svg:path
            d="M5.7 7.25a3 3 0 1 0-2.4 0v9.5a3 3 0 1 0 3.95 3.95h9.5a3 3 0 1 0 0-2.4H7.397l9.507-9.507a3 3 0 1 0-1.697-1.697L5.7 16.603z"
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
export class KbqTopology24 extends KbqSvgIcon {}
