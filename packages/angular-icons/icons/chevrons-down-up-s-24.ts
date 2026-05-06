import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChevronsDownUpS24]',
    template: `
        <svg:g>
            <svg:path
                d="M17.714 1.587 12 7.17 6.287 1.587a.305.305 0 0 0-.427 0L4.59 2.833a.304.304 0 0 0 0 .433l7.196 7.04a.305.305 0 0 0 .426 0l7.196-7.04a.304.304 0 0 0 0-.433L18.14 1.587a.305.305 0 0 0-.427 0M6.287 22.41 12 16.827l5.714 5.583a.305.305 0 0 0 .426 0l1.269-1.246a.304.304 0 0 0 0-.433l-7.196-7.039a.305.305 0 0 0-.426 0L4.59 20.731a.304.304 0 0 0 0 .433L5.86 22.41a.305.305 0 0 0 .426 0"
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
export class KbqChevronsDownUpS24 extends KbqSvgIcon {}
