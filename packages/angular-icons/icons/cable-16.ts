import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCable16]',
    template: `
        <svg:path
            d="M1 5.8v3.087A1.8 1.8 0 0 0 0 10.5v2.1c0 .11.09.2.2.2H1v1c0 .11.09.2.2.2h1.2a.2.2 0 0 0 .2-.2v-1h.8a.2.2 0 0 0 .2-.2v-2.1a1.8 1.8 0 0 0-1-1.613V5.8a2.2 2.2 0 0 1 2.2-2.2H5a2.2 2.2 0 0 1 2.2 2.2v4.4A3.8 3.8 0 0 0 11 14h.2a3.8 3.8 0 0 0 3.8-3.8V7.113A1.8 1.8 0 0 0 16 5.5V3.4a.2.2 0 0 0-.2-.2H15v-1a.2.2 0 0 0-.2-.2h-1.2a.2.2 0 0 0-.2.2v1h-.8a.2.2 0 0 0-.2.2v2.1a1.8 1.8 0 0 0 1 1.613V10.2a2.2 2.2 0 0 1-2.2 2.2H11a2.2 2.2 0 0 1-2.2-2.2V5.8A3.8 3.8 0 0 0 5 2h-.2A3.8 3.8 0 0 0 1 5.8"
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
export class KbqCable16 extends KbqSvgIcon {}
