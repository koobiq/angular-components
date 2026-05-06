import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBarsHorizontal32]',
    template: `
        <svg:g><svg:path d="M27 7H5v3h22zM5 15h22v3H5zM5 23h22v3H5z" /></svg:g>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 32 32',
        width: '32',
        height: '32'
    }
})
export class KbqBarsHorizontal32 extends KbqSvgIcon {}
