import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChevronDoubleLeftS24]',
    template: `
        <svg:g>
            <svg:path
                d="m14.953 11.999 5.584-5.714a.305.305 0 0 0 0-.427L19.29 4.59a.304.304 0 0 0-.434 0l-7.038 7.195a.305.305 0 0 0 0 .427l7.038 7.196c.12.121.315.121.434 0l1.246-1.27a.305.305 0 0 0 0-.426z"
            />
            <svg:path
                d="m6.598 11.999 5.584-5.714a.305.305 0 0 0 0-.427L10.936 4.59a.304.304 0 0 0-.434 0l-7.038 7.195a.305.305 0 0 0 0 .427l7.038 7.196c.12.121.314.121.434 0l1.245-1.27a.305.305 0 0 0 0-.426z"
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
export class KbqChevronDoubleLeftS24 extends KbqSvgIcon {}
