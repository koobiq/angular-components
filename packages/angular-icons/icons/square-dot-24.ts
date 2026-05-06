import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqSquareDot24]',
    template: `
        <svg:g fill="currentColor">
            <svg:path d="M24 3a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
            <svg:path d="M24 3a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
        </svg:g>
        <svg:path
            d="M22.5 7.561A4.8 4.8 0 0 1 16.439 1.5H3.3a1.8 1.8 0 0 0-1.8 1.8v17.4a1.8 1.8 0 0 0 1.8 1.8h17.4a1.8 1.8 0 0 0 1.8-1.8z"
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
export class KbqSquareDot24 extends KbqSvgIcon {}
