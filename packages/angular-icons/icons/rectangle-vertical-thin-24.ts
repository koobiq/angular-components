import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqRectangleVerticalThin24]',
    template: `
        <svg:path
            d="M6 1.8A1.8 1.8 0 0 1 7.8 0h8.4A1.8 1.8 0 0 1 18 1.8v20.4a1.8 1.8 0 0 1-1.8 1.8H7.8A1.8 1.8 0 0 1 6 22.2z"
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
export class KbqRectangleVerticalThin24 extends KbqSvgIcon {}
