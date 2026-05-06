import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqRectangleVerticalThinLines24]',
    template: `
        <svg:path
            d="M6 1.8A1.8 1.8 0 0 1 7.8 0h8.4A1.8 1.8 0 0 1 18 1.8v20.4a1.8 1.8 0 0 1-1.8 1.8H7.8A1.8 1.8 0 0 1 6 22.2zm2.4.9v6.158L14.858 2.4H8.7a.3.3 0 0 0-.3.3m0 13.953v2.705l7.2-7.2V9.453zm0-2.545 7.2-7.2V4.202l-7.2 7.2zm6.9 7.492a.3.3 0 0 0 .3-.3v-6.597L8.703 21.6z"
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
export class KbqRectangleVerticalThinLines24 extends KbqSvgIcon {}
