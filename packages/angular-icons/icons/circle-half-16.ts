import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCircleHalf16]',
    template: `
        <svg:path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0-1.6A5.4 5.4 0 0 0 8 2.6v10.8" />
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
export class KbqCircleHalf16 extends KbqSvgIcon {}
