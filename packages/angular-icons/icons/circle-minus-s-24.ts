import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCircleMinusS24]',
    template: `
        <svg:path
            d="M5.636 18.364A9 9 0 1 0 18.364 5.636 9 9 0 0 0 5.636 18.364M7.8 11.1h8.4a.3.3 0 0 1 .3.3v1.2a.3.3 0 0 1-.3.3H7.8a.3.3 0 0 1-.3-.3v-1.2a.3.3 0 0 1 .3-.3"
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
export class KbqCircleMinusS24 extends KbqSvgIcon {}
