import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqXmarkS24]',
    template: `
        <svg:path
            d="M18.662 7.04a.3.3 0 0 0 0-.425l-1.277-1.277a.3.3 0 0 0-.426 0L12 10.298l-4.96-4.96a.3.3 0 0 0-.425 0L5.338 6.615a.3.3 0 0 0 0 .426L10.298 12l-4.96 4.96a.3.3 0 0 0 0 .425l1.277 1.277a.3.3 0 0 0 .426 0L12 13.702l4.96 4.96a.3.3 0 0 0 .425 0l1.277-1.277a.3.3 0 0 0 0-.426L13.702 12z"
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
export class KbqXmarkS24 extends KbqSvgIcon {}
