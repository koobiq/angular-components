import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBlockBrick24]',
    template: `
        <svg:path
            d="M1.8 3A1.8 1.8 0 0 0 0 4.8v2.75h5.709a.3.3 0 0 0 .3-.3V3.3a.3.3 0 0 0-.3-.3zm6.309 0a.3.3 0 0 0-.3.3v3.95a.3.3 0 0 0 .3.3H23.7a.3.3 0 0 0 .3-.3V4.8A1.8 1.8 0 0 0 22.2 3zM24 9.65a.3.3 0 0 0-.3-.3h-5.395a.3.3 0 0 0-.3.3v4.712a.3.3 0 0 0 .3.3H23.7a.3.3 0 0 0 .3-.3zm-24-.3h15.905a.3.3 0 0 1 .3.3v4.712a.3.3 0 0 1-.3.3H0zm0 9.85v-2.738h5.709a.3.3 0 0 1 .3.3V20.7a.3.3 0 0 1-.3.3H1.8A1.8 1.8 0 0 1 0 19.2m7.809 1.5a.3.3 0 0 0 .3.3H22.2a1.8 1.8 0 0 0 1.8-1.8v-2.438a.3.3 0 0 0-.3-.3H8.109a.3.3 0 0 0-.3.3z"
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
export class KbqBlockBrick24 extends KbqSvgIcon {}
