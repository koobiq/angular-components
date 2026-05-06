import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqTableLine24]',
    template: `
        <svg:path
            d="M3.3 1.5a1.8 1.8 0 0 0-1.8 1.8v17.4a1.8 1.8 0 0 0 1.8 1.8h17.4a1.8 1.8 0 0 0 1.8-1.8V3.3a1.8 1.8 0 0 0-1.8-1.8zM3.9 9h3.6v11.1H4.2a.3.3 0 0 1-.3-.3zm0-2.4V4.2a.3.3 0 0 1 .3-.3h3.3v2.7zm6 2.4h10.2v10.8a.3.3 0 0 1-.3.3H9.9zm10.2-2.4H9.9V3.9h9.9a.3.3 0 0 1 .3.3z"
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
export class KbqTableLine24 extends KbqSvgIcon {}
