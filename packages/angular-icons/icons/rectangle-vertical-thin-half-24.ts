import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqRectangleVerticalThinHalf24]',
    template: `
        <svg:path
            d="M6 1.8A1.8 1.8 0 0 1 7.8 0h8.4A1.8 1.8 0 0 1 18 1.8v20.4a1.8 1.8 0 0 1-1.8 1.8H7.8A1.8 1.8 0 0 1 6 22.2zM8.7 12h6.6a.3.3 0 0 0 .3-.3v-9a.3.3 0 0 0-.3-.3H8.7a.3.3 0 0 0-.3.3v9a.3.3 0 0 0 .3.3"
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
export class KbqRectangleVerticalThinHalf24 extends KbqSvgIcon {}
