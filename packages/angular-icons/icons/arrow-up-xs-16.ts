import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowUpXs16]',
    template: `
        <svg:path
            d="M8.786 5.947 10.868 8a.2.2 0 0 0 .284 0l.846-.84a.206.206 0 0 0 0-.291l-3.856-3.81a.2.2 0 0 0-.284 0l-3.856 3.81a.206.206 0 0 0 0 .292L4.848 8a.2.2 0 0 0 .284 0l2.05-2.02v6.819A.2.2 0 0 0 7.38 13h1.206a.2.2 0 0 0 .2-.201z"
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
export class KbqArrowUpXs16 extends KbqSvgIcon {}
