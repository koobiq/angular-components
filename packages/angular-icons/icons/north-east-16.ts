import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqNorthEast16]',
    template: `
        <svg:path fill-rule="evenodd" d="M6 4h6v6h-1V5.707l-7.646 7.647-.708-.708L10.293 5H6z" clip-rule="evenodd" />
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
export class KbqNorthEast16 extends KbqSvgIcon {}
