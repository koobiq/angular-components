import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCalendarO24]',
    template: `
        <svg:path
            d="M15.3 3H8.7V.3a.3.3 0 0 0-.3-.3H6.6a.3.3 0 0 0-.3.3V3h-3a1.8 1.8 0 0 0-1.8 1.8v15.9a1.8 1.8 0 0 0 1.8 1.8h17.4a1.8 1.8 0 0 0 1.8-1.8V4.8A1.8 1.8 0 0 0 20.7 3h-3V.3a.3.3 0 0 0-.3-.3h-1.8a.3.3 0 0 0-.3.3zM4.2 20.1a.3.3 0 0 1-.3-.3V9.3a.3.3 0 0 1 .3-.3h15.6a.3.3 0 0 1 .3.3v10.5a.3.3 0 0 1-.3.3z"
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
export class KbqCalendarO24 extends KbqSvgIcon {}
