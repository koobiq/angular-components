import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqNorthEast24]',
    template: `
        <svg:path fill-rule="evenodd" d="M9 6h9v9h-1.5V8.56L5.03 20.03l-1.06-1.06L15.44 7.5H9z" clip-rule="evenodd" />
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
export class KbqNorthEast24 extends KbqSvgIcon {}
