import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqDesktopO24]',
    template: `
        <svg:path
            d="M3.3 1.5a1.8 1.8 0 0 0-1.8 1.8v11.4a1.8 1.8 0 0 0 1.8 1.8H9v3.6H4.5v2.4h15v-2.4h-4.505v-3.6H20.7a1.8 1.8 0 0 0 1.8-1.8V3.3a1.8 1.8 0 0 0-1.8-1.8zm.6 2.7a.3.3 0 0 1 .3-.3h15.6a.3.3 0 0 1 .3.3v9.6a.3.3 0 0 1-.3.3H4.2a.3.3 0 0 1-.3-.3z"
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
export class KbqDesktopO24 extends KbqSvgIcon {}
