import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqReachabilityTo24]',
    template: `
        <svg:path
            d="M7.25 5.7a3 3 0 1 1 0-2.4h8.8a4.95 4.95 0 0 1 0 9.9h-8.1a2.55 2.55 0 0 0 0 5.1h3.106l.014-.001h5.1v-2.384a.3.3 0 0 1 .459-.254l5.734 3.584a.3.3 0 0 1 0 .508l-5.734 3.584a.3.3 0 0 1-.459-.254V20.7H7.95a4.95 4.95 0 0 1 0-9.9h8.1a2.55 2.55 0 1 0 0-5.1z"
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
export class KbqReachabilityTo24 extends KbqSvgIcon {}
