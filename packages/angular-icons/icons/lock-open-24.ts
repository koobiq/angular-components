import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqLockOpen24]',
    template: `
        <svg:path
            d="M18.525 1.5a5.475 5.475 0 0 0-5.475 5.475V10.5H3.3a1.8 1.8 0 0 0-1.8 1.8v8.4a1.8 1.8 0 0 0 1.8 1.8h14.4a1.8 1.8 0 0 0 1.8-1.8v-8.4a1.8 1.8 0 0 0-1.8-1.8h-2.25V6.975a3.075 3.075 0 1 1 6.15 0V10.2a.3.3 0 0 0 .3.3h1.8a.3.3 0 0 0 .3-.3V6.975A5.475 5.475 0 0 0 18.525 1.5"
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
export class KbqLockOpen24 extends KbqSvgIcon {}
