import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqPaperclip24]',
    template: `
        <svg:path
            d="M13.097 2.577a4.95 4.95 0 1 1 7 7l-8.644 8.645a3.075 3.075 0 1 1-4.35-4.349l5.781-5.78 1.697 1.697-5.78 5.78a.675.675 0 0 0 .955.955L18.4 7.88a2.55 2.55 0 0 0-3.606-3.607L6.149 12.92a4.425 4.425 0 0 0 6.258 6.258l5.78-5.781 1.698 1.697-5.78 5.78a6.825 6.825 0 0 1-9.653-9.651z"
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
export class KbqPaperclip24 extends KbqSvgIcon {}
