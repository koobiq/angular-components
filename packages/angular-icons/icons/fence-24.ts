import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFence24]',
    template: `
        <svg:path
            d="M4.645 3.109 3.069 5.017A.3.3 0 0 0 3 5.208v3.173H.3a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3H3v5.1H.3a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3H3v3.169a.3.3 0 0 0 .3.3h3.15a.3.3 0 0 0 .3-.3v-3.169h3.375v3.169a.3.3 0 0 0 .3.3h3.15a.3.3 0 0 0 .3-.3v-3.169h3.375v3.169a.3.3 0 0 0 .3.3h3.15a.3.3 0 0 0 .3-.3v-3.169h2.7a.3.3 0 0 0 .3-.3v-1.8a.3.3 0 0 0-.3-.3H21v-5.1h2.7a.3.3 0 0 0 .3-.3v-1.8a.3.3 0 0 0-.3-.3H21V5.208a.3.3 0 0 0-.069-.19l-1.576-1.91a.298.298 0 0 0-.46 0l-1.576 1.91a.3.3 0 0 0-.069.19v3.173h-3.375V5.208a.3.3 0 0 0-.069-.19l-1.575-1.91a.298.298 0 0 0-.461 0l-1.576 1.91a.3.3 0 0 0-.069.19v3.173H6.75V5.208a.3.3 0 0 0-.069-.19l-1.576-1.91a.298.298 0 0 0-.46 0M17.25 10.78v5.1h-3.375v-5.1zm-7.125 0v5.1H6.75v-5.1z"
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
export class KbqFence24 extends KbqSvgIcon {}
