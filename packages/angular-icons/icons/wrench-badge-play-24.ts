import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqWrenchBadgePlay24]',
    template: `
        <svg:path
            d="M13.775 1.592a.3.3 0 0 1 .26-.086L18 2.07c.249.036.35.34.173.516l-2.882 2.87a.3.3 0 0 0-.084.275l.468 2.33c.024.12.119.214.24.238l2.338.466c.1.02.203-.011.275-.083l2.888-2.875a.306.306 0 0 1 .517.172l.567 3.952a.3.3 0 0 1-.086.258l-2.803 2.79a.3.3 0 0 1-.284.082l-4.956-1.14-6.91 9.28a3.338 3.338 0 0 1-5.006.34 3.312 3.312 0 0 1 .34-4.99l9.272-6.838-1.17-5.053a.3.3 0 0 1 .082-.284zM3.75 18.099a1.517 1.517 0 0 0 0 2.151 1.53 1.53 0 0 0 2.158 0 1.517 1.517 0 0 0 0-2.15 1.53 1.53 0 0 0-2.158 0m13.237-4.541c-.205-.147-.487.003-.487.26v9.865c0 .256.282.406.486.26l6.882-4.934a.32.32 0 0 0 0-.518z"
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
export class KbqWrenchBadgePlay24 extends KbqSvgIcon {}
