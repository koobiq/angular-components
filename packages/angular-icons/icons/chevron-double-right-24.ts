import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChevronDoubleRight24]',
    template: `
        <svg:g>
            <svg:path
                d="M10.17 12 3.087 4.787a.305.305 0 0 1 0-.427L4.333 3.09a.304.304 0 0 1 .434 0l8.538 8.696a.305.305 0 0 1 0 .426L4.767 20.91a.304.304 0 0 1-.434 0L3.087 19.64a.305.305 0 0 1 0-.427z"
            />
            <svg:path
                d="m18.528 12-7.083-7.213a.305.305 0 0 1 0-.427L12.69 3.09a.304.304 0 0 1 .433 0l8.539 8.696a.305.305 0 0 1 0 .426l-8.539 8.696a.304.304 0 0 1-.433 0l-1.246-1.269a.305.305 0 0 1 0-.427z"
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
export class KbqChevronDoubleRight24 extends KbqSvgIcon {}
