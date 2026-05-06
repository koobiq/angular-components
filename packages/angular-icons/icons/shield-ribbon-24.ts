import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqShieldRibbon24]',
    template: `
        <svg:g>
            <svg:path
                d="M1.5 3.303c0-.996.806-1.803 1.8-1.803h17.4c.994 0 1.8.807 1.8 1.803v.726l-21 6.572zM1.5 12.49l21-6.572v2.618l-21 6.572zM1.5 16.996v.382a.3.3 0 0 0 .172.272l10.2 6.321a.3.3 0 0 0 .256 0l10.2-6.321a.3.3 0 0 0 .172-.272v-6.954z"
            />
        </svg:g>
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
export class KbqShieldRibbon24 extends KbqSvgIcon {}
