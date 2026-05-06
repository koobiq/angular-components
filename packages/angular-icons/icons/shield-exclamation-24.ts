import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqShieldExclamation24]',
    template: `
        <svg:path
            d="M1.5 3.303c0-.996.806-1.803 1.8-1.803h17.4c.994 0 1.8.807 1.8 1.803v14.075a.3.3 0 0 1-.172.272l-10.2 6.321a.3.3 0 0 1-.256 0l-10.2-6.321a.3.3 0 0 1-.172-.272zM13.18 6H11a.3.3 0 0 0-.3.319l.463 7.427a.3.3 0 0 0 .3.281h1.25a.3.3 0 0 0 .3-.281l.467-7.427a.3.3 0 0 0-.3-.319m-1.09 11.706a1.33 1.33 0 1 0 0-2.66 1.33 1.33 0 0 0 0 2.66"
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
export class KbqShieldExclamation24 extends KbqSvgIcon {}
