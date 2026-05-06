import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqGridDots16]',
    template: `
        <svg:path
            d="M10.5 3a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0M3 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5M15.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0M8 15.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5m0-3.8a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6"
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
export class KbqGridDots16 extends KbqSvgIcon {}
