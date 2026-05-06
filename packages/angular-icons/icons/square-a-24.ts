import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqSquareA24]',
    template: `
        <svg:g>
            <svg:path d="M13.512 13.283h-3.018l1.462-4.54h.094z" />
            <svg:path
                d="M20.7 1.5a1.8 1.8 0 0 1 1.8 1.8v17.4a1.8 1.8 0 0 1-1.8 1.8H3.3a1.8 1.8 0 0 1-1.8-1.8V3.3a1.8 1.8 0 0 1 1.8-1.8zM10.598 6a.3.3 0 0 0-.284.204l-3.897 11.4A.3.3 0 0 0 6.7 18h2.055a.3.3 0 0 0 .286-.208l.814-2.528h4.29l.814 2.528a.3.3 0 0 0 .286.208H17.3a.3.3 0 0 0 .284-.397l-3.892-11.4A.3.3 0 0 0 13.408 6z"
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
export class KbqSquareA24 extends KbqSvgIcon {}
