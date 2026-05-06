import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqPlugSlash24]',
    template: `
        <svg:g>
            <svg:path
                d="M2.114.838a.3.3 0 0 1 .425 0l5.008 5.008 2.771-2.771a.3.3 0 0 1 .425 0l1.484 1.485 2.97-2.97a.3.3 0 0 1 .424 0l1.273 1.272a.3.3 0 0 1 0 .425l-2.97 2.97 3.82 3.818 2.969-2.969a.3.3 0 0 1 .425 0l1.273 1.273a.3.3 0 0 1 0 .423l-2.971 2.97 1.485 1.485a.3.3 0 0 1 0 .425l-2.773 2.77 5.01 5.01a.3.3 0 0 1 0 .424l-1.276 1.276a.3.3 0 0 1-.425 0l-.58-.58h.003L1.415 3.112h-.003L.838 2.54a.3.3 0 0 1 0-.425zM14.73 18.979a7.5 7.5 0 0 1-4.838.22l-2.134 2.135-1.698-1.698-2.782 2.782a.3.3 0 0 1-.424 0l-1.272-1.273a.3.3 0 0 1 0-.423l2.782-2.782-1.698-1.698L4.8 14.108a7.52 7.52 0 0 1 .219-4.841z"
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
export class KbqPlugSlash24 extends KbqSvgIcon {}
