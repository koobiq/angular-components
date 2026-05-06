import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqTextItalic24]',
    template: `
        <svg:path
            d="M4.8 21.75a.3.3 0 0 1-.3-.3v-1.2a.3.3 0 0 1 .3-.3h3.254l4.892-15.9H10.05a.3.3 0 0 1-.3-.3v-1.2a.3.3 0 0 1 .3-.3h9.15a.3.3 0 0 1 .3.3v1.2a.3.3 0 0 1-.3.3h-3.024l-4.892 15.9h2.666a.3.3 0 0 1 .3.3v1.2a.3.3 0 0 1-.3.3z"
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
export class KbqTextItalic24 extends KbqSvgIcon {}
