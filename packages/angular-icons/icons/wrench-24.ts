import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqWrench24]',
    template: `
        <svg:path
            d="M13.778 1.59a.3.3 0 0 1 .259-.087l3.966.565c.249.035.35.339.172.516l-3.634 3.622a.3.3 0 0 0-.084.275l.468 2.33c.024.12.119.214.24.238l2.338.466c.1.02.203-.011.275-.083l3.635-3.622a.305.305 0 0 1 .517.172l.567 3.952a.3.3 0 0 1-.086.258l-3.55 3.537a.3.3 0 0 1-.284.082l-4.956-1.14-6.14 8.518a3.338 3.338 0 0 1-5.006.339 3.312 3.312 0 0 1 .34-4.99l8.502-6.075-1.17-5.053a.3.3 0 0 1 .082-.284zm-7.85 18.648a1.517 1.517 0 0 0 0-2.151 1.53 1.53 0 0 0-2.158 0 1.517 1.517 0 0 0 0 2.15 1.53 1.53 0 0 0 2.158 0"
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
export class KbqWrench24 extends KbqSvgIcon {}
