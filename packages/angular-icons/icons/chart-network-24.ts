import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChartNetwork24]',
    template: `
        <svg:path
            d="M8.725 7.463a3 3 0 1 1 1.61-.805l.498.995a4.5 4.5 0 0 1 3.649.593l2.358-2.358a3 3 0 1 1 1.273 1.273l-2.359 2.357c.472.712.746 1.565.746 2.482a4.5 4.5 0 0 1-.745 2.482l2.357 2.358a3 3 0 1 1-1.273 1.273l-2.357-2.359a4.507 4.507 0 0 1-3.65.593l-.497.996a3 3 0 1 1-1.61-.805l.498-.997a4.5 4.5 0 0 1-1.692-3.01l-1.753-.147a3.001 3.001 0 1 1 .15-1.793l1.752.146a4.5 4.5 0 0 1 1.543-2.278z"
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
export class KbqChartNetwork24 extends KbqSvgIcon {}
