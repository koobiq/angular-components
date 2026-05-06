import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChevronDoubleDownS24]',
    template: `
        <svg:g>
            <svg:path
                d="m12 9.045 5.714-5.583a.305.305 0 0 1 .426 0l1.27 1.246a.304.304 0 0 1 0 .433l-7.197 7.04a.305.305 0 0 1-.426 0L4.59 5.14a.304.304 0 0 1 0-.433L5.86 3.462a.305.305 0 0 1 .427 0z"
            />
            <svg:path
                d="m12 17.4 5.714-5.583a.305.305 0 0 1 .426 0l1.27 1.246a.304.304 0 0 1 0 .433l-7.197 7.04a.305.305 0 0 1-.426 0l-7.196-7.04a.304.304 0 0 1 0-.433l1.269-1.246a.305.305 0 0 1 .427 0z"
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
export class KbqChevronDoubleDownS24 extends KbqSvgIcon {}
