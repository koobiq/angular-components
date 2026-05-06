import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqShieldStar24]',
    template: `
        <svg:path
            d="M3.3 1.5c-.994 0-1.8.807-1.8 1.803v14.075a.3.3 0 0 0 .172.272l10.2 6.321a.3.3 0 0 0 .256 0l10.2-6.321a.3.3 0 0 0 .172-.272V3.303c0-.996-.806-1.803-1.8-1.803zm8.962 4.673 1.465 3.213a.29.29 0 0 0 .241.166l3.766.275c.26.02.361.34.158.499l-2.84 2.22a.28.28 0 0 0-.098.287l.872 3.338c.063.24-.2.435-.42.313l-3.264-1.819a.3.3 0 0 0-.284 0l-3.263 1.819c-.22.122-.484-.074-.421-.313l.873-3.338a.28.28 0 0 0-.1-.288l-2.839-2.22c-.203-.158-.102-.479.158-.498l3.766-.275a.29.29 0 0 0 .24-.166l1.466-3.213a.29.29 0 0 1 .524 0"
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
export class KbqShieldStar24 extends KbqSvgIcon {}
