import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCircleMinusS16]',
    template: `
        <svg:path
            d="M3.757 12.243a6 6 0 1 0 8.486-8.485 6 6 0 0 0-8.486 8.485M5.2 7.4h5.6c.11 0 .2.09.2.2v.8a.2.2 0 0 1-.2.2H5.2a.2.2 0 0 1-.2-.2v-.8c0-.11.09-.2.2-.2"
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
export class KbqCircleMinusS16 extends KbqSvgIcon {}
