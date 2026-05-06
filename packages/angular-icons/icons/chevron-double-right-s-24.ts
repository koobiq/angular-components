import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChevronDoubleRightS24]',
    template: `
        <svg:g>
            <svg:path
                d="M9.047 11.999 3.463 6.285a.305.305 0 0 1 0-.427L4.71 4.59a.304.304 0 0 1 .434 0l7.038 7.195a.305.305 0 0 1 0 .427l-7.038 7.196a.304.304 0 0 1-.434 0l-1.246-1.27a.305.305 0 0 1 0-.426z"
            />
            <svg:path
                d="m17.402 11.999-5.584-5.714a.305.305 0 0 1 0-.427l1.246-1.268a.304.304 0 0 1 .434 0l7.039 7.195a.305.305 0 0 1 0 .427l-7.04 7.196a.304.304 0 0 1-.433 0l-1.246-1.27a.305.305 0 0 1 0-.426z"
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
export class KbqChevronDoubleRightS24 extends KbqSvgIcon {}
