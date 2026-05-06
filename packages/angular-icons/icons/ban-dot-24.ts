import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBanDot24]',
    template: `
        <svg:path
            d="M15.371 2.053a4.8 4.8 0 0 0-.668 2.31A8.1 8.1 0 0 0 12 3.9c-1.804 0-3.47.59-4.816 1.587l11.33 11.33A8.06 8.06 0 0 0 20.1 12c0-.948-.163-1.858-.462-2.703a4.8 4.8 0 0 0 2.31-.668c.358 1.058.552 2.192.552 3.371 0 5.799-4.701 10.5-10.5 10.5S1.5 17.799 1.5 12 6.201 1.5 12 1.5c1.18 0 2.313.194 3.371.553m1.445 16.46L5.486 7.183a8.1 8.1 0 0 0 11.33 11.33"
        />
        <svg:g fill="currentColor">
            <svg:path d="M22.5 4.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
            <svg:path d="M22.5 4.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
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
export class KbqBanDot24 extends KbqSvgIcon {}
