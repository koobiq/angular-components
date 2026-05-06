import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqReachability24]',
    template: `
        <svg:path
            d="M4.5 7.5a3 3 0 0 0 2.75-1.8h8.8a2.55 2.55 0 0 1 0 5.1h-8.1a4.95 4.95 0 0 0 0 9.9h8.8a3 3 0 1 0 0-2.4h-8.8a2.55 2.55 0 1 1 0-5.1h8.1a4.95 4.95 0 0 0 0-9.9h-8.8A3 3 0 1 0 4.5 7.5"
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
export class KbqReachability24 extends KbqSvgIcon {}
