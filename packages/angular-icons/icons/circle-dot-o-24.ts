import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCircleDotO24]',
    template: `
        <svg:path
            d="M15.371 2.053a4.8 4.8 0 0 0-.668 2.31 8.1 8.1 0 1 0 4.935 4.935 4.8 4.8 0 0 0 2.31-.67c.358 1.059.552 2.193.552 3.372 0 5.799-4.701 10.5-10.5 10.5S1.5 17.799 1.5 12 6.201 1.5 12 1.5c1.18 0 2.313.194 3.371.553"
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
export class KbqCircleDotO24 extends KbqSvgIcon {}
