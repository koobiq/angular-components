import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCircleO16]',
    template: `
        <svg:path d="M8 13.4A5.4 5.4 0 1 1 8 2.6a5.4 5.4 0 0 1 0 10.8M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14" />
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
export class KbqCircleO16 extends KbqSvgIcon {}
