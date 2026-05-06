import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqMessageDot24]',
    template: `
        <svg:g fill="currentColor">
            <svg:path d="M18.14 2.093A3 3 0 0 1 19.766.264a3 3 0 1 1-1.627 1.83" />
            <svg:path d="M18.14 2.093A3 3 0 0 1 19.766.264a3 3 0 1 1-1.627 1.83" />
        </svg:g>
        <svg:path
            d="M5.1 3h11.1a4.8 4.8 0 0 0 6.3 4.561V15.9a3.6 3.6 0 0 1-3.6 3.6h-7.275l-5.138 4.11A.3.3 0 0 1 6 23.376V19.5h-.9a3.6 3.6 0 0 1-3.6-3.6V6.6A3.6 3.6 0 0 1 5.1 3m6.9 9.75a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m6-1.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0m-10.5 1.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"
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
export class KbqMessageDot24 extends KbqSvgIcon {}
