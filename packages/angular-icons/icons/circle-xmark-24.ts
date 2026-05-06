import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCircleXmark24]',
    template: `
        <svg:path
            d="M12 22.5c5.799 0 10.5-4.701 10.5-10.5S17.799 1.5 12 1.5 1.5 6.201 1.5 12 6.201 22.5 12 22.5m-5.567-6.206L10.727 12 6.433 7.706a.3.3 0 0 1 0-.425l.848-.848a.3.3 0 0 1 .425 0L12 10.727l4.294-4.294a.3.3 0 0 1 .425 0l.848.848a.3.3 0 0 1 0 .425L13.273 12l4.294 4.294a.3.3 0 0 1 0 .425l-.848.848a.3.3 0 0 1-.425 0L12 13.273l-4.294 4.294a.3.3 0 0 1-.425 0l-.848-.848a.3.3 0 0 1 0-.425"
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
export class KbqCircleXmark24 extends KbqSvgIcon {}
