import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqVkAlt24]',
    template: `
        <svg:path
            d="M13.072 19.488C4.872 19.488.195 13.866 0 4.512h4.107c.135 6.866 3.163 9.774 5.562 10.374V4.512h3.868v5.922c2.368-.255 4.856-2.954 5.696-5.922H23.1c-.644 3.658-3.343 6.356-5.261 7.466 1.919.899 4.992 3.252 6.161 7.51h-4.257c-.915-2.848-3.193-5.052-6.206-5.352v5.352z"
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
export class KbqVkAlt24 extends KbqSvgIcon {}
