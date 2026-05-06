import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowDownXs16]',
    template: `
        <svg:path
            d="M8.786 10.053 10.868 8a.2.2 0 0 1 .284 0l.846.84c.081.08.081.21 0 .291l-3.856 3.81a.2.2 0 0 1-.284 0l-3.856-3.81a.206.206 0 0 1 0-.292L4.848 8a.2.2 0 0 1 .284 0l2.05 2.02V3.201A.2.2 0 0 1 7.38 3h1.206c.11 0 .2.09.2.201z"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 16 16',
        width: '16',
        height: '16'
    }
})
export class KbqArrowDownXs16 extends KbqSvgIcon {}
