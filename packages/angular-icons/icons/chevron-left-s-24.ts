import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChevronLeftS24]',
    template: `
        <svg:path
            d="m11.13 12 4.907-4.963a.3.3 0 0 0 0-.427L14.778 5.34a.31.31 0 0 0-.438 0l-6.377 6.446a.3.3 0 0 0 0 .426l6.377 6.446c.12.121.318.121.438 0l1.259-1.269a.3.3 0 0 0 0-.427z"
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
export class KbqChevronLeftS24 extends KbqSvgIcon {}
