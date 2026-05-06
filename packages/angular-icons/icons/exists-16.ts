import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqExists16]',
    template: `
        <svg:path
            d="M3.7 14a.2.2 0 0 1-.2-.2v-1.377c0-.11.09-.2.2-.2h6.43V8.68H4.654a.2.2 0 0 1-.2-.2v-1.35c0-.11.09-.2.2-.2h5.476V3.786H3.747a.2.2 0 0 1-.2-.2V2.2c0-.11.09-.2.2-.2H12.3c.11 0 .2.09.2.2v11.6c0-.39-.09.2-.2.2z"
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
export class KbqExists16 extends KbqSvgIcon {}
