import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqMagnifyingGlass24]',
    template: `
        <svg:path
            d="M15.999 10.136a5.857 5.857 0 1 0-11.715 0 5.857 5.857 0 0 0 11.715 0m-.928 6.628a8.26 8.26 0 1 1 1.7-1.7l5.272 5.274a.3.3 0 0 1 0 .425l-1.274 1.274a.3.3 0 0 1-.425 0z"
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
export class KbqMagnifyingGlass24 extends KbqSvgIcon {}
