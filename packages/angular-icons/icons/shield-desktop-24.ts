import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqShieldDesktop24]',
    template: `
        <svg:g>
            <svg:path
                d="M7.35 12.616a.3.3 0 0 1-.3-.3V7.507a.3.3 0 0 1 .3-.3h9.3a.3.3 0 0 1 .3.3v4.807a.3.3 0 0 1-.3.3z"
            />
            <svg:path
                d="M3.3 1.5c-.994 0-1.8.807-1.8 1.803v14.075a.3.3 0 0 0 .172.272l10.2 6.321a.3.3 0 0 0 .256 0l10.2-6.321a.3.3 0 0 0 .172-.272V3.303c0-.996-.806-1.803-1.8-1.803zm1.95 5.107a1.2 1.2 0 0 1 1.2-1.201h11.1a1.2 1.2 0 0 1 1.2 1.201v6.61a1.2 1.2 0 0 1-1.2 1.201H12.9v1.803h3.3a.3.3 0 0 1 .3.3v1.202a.3.3 0 0 1-.3.3H7.8a.3.3 0 0 1-.3-.3V16.52a.3.3 0 0 1 .3-.3h3.3v-1.803H6.45a1.2 1.2 0 0 1-1.2-1.201z"
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
export class KbqShieldDesktop24 extends KbqSvgIcon {}
