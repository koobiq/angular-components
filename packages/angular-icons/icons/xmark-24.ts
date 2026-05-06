import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqXmark24]',
    template: `
        <svg:path
            d="M20.162 5.54a.3.3 0 0 0 0-.425l-1.277-1.277a.3.3 0 0 0-.426 0L12 10.298l-6.46-6.46a.3.3 0 0 0-.425 0L3.838 5.115a.3.3 0 0 0 0 .426L10.298 12l-6.46 6.46a.3.3 0 0 0 0 .425l1.277 1.277a.3.3 0 0 0 .426 0L12 13.702l6.46 6.46a.3.3 0 0 0 .425 0l1.277-1.277a.3.3 0 0 0 0-.426L13.702 12z"
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
export class KbqXmark24 extends KbqSvgIcon {}
