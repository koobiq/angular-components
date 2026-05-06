import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowRightFromRectangle24]',
    template: `
        <svg:g>
            <svg:path
                d="m18.027 10.803-2.304-2.305a.3.3 0 0 1 0-.424l1.272-1.273a.3.3 0 0 1 .425 0l4.99 4.99a.3.3 0 0 1 0 .424l-4.99 4.99a.3.3 0 0 1-.425 0l-1.272-1.273a.3.3 0 0 1 0-.425l2.304-2.304H6.856a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3z"
            />
            <svg:path
                d="M13.503 9.003v-5.7a1.8 1.8 0 0 0-1.8-1.8h-8.4a1.8 1.8 0 0 0-1.8 1.8v17.4a1.8 1.8 0 0 0 1.8 1.8h8.4a1.8 1.8 0 0 0 1.8-1.8v-5.7h-2.4v4.8a.3.3 0 0 1-.3.3h-6.6a.3.3 0 0 1-.3-.3v-15.6a.3.3 0 0 1 .3-.3h6.6a.3.3 0 0 1 .3.3v4.8z"
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
export class KbqArrowRightFromRectangle24 extends KbqSvgIcon {}
