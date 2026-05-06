import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqShieldCheck24]',
    template: `
        <svg:path
            d="M3.3 1.5c-.994 0-1.8.807-1.8 1.803v14.075a.3.3 0 0 0 .172.272l10.2 6.321a.3.3 0 0 0 .256 0l10.2-6.321a.3.3 0 0 0 .172-.272V3.303c0-.996-.806-1.803-1.8-1.803zm15.124 6.858-7.712 7.723a.3.3 0 0 1-.424 0l-4.712-4.719a.3.3 0 0 1 0-.424l.848-.85a.3.3 0 0 1 .425 0l3.651 3.657 6.651-6.661a.3.3 0 0 1 .425 0l.848.85a.3.3 0 0 1 0 .424"
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
export class KbqShieldCheck24 extends KbqSvgIcon {}
