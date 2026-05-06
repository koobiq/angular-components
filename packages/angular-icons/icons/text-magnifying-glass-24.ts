import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqTextMagnifyingGlass24]',
    template: `
        <svg:path
            d="M1.8 3.3a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3h20.4a.3.3 0 0 0 .3-.3V3.6a.3.3 0 0 0-.3-.3zm-.3 6.3a.3.3 0 0 1 .3-.3h20.4a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3H1.8a.3.3 0 0 1-.3-.3zm.3 5.7a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3h9.967a5.9 5.9 0 0 1 .507-2.4zm15.912.07a2.337 2.337 0 1 1-.002 4.674 2.337 2.337 0 0 1 .002-4.675m0 6.486c.817 0 1.58-.237 2.222-.646l2.699 2.701a.3.3 0 0 0 .426 0l.853-.853a.3.3 0 0 0 0-.427l-2.7-2.7a4.147 4.147 0 0 0-3.5-6.371 4.147 4.147 0 0 0-4.145 4.147 4.147 4.147 0 0 0 4.145 4.149"
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
export class KbqTextMagnifyingGlass24 extends KbqSvgIcon {}
