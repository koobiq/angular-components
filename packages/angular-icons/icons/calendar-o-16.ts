import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCalendarO16]',
    template: `
        <svg:path
            d="M10.2 2H5.8V.2a.2.2 0 0 0-.2-.2H4.4a.2.2 0 0 0-.2.2V2h-2A1.2 1.2 0 0 0 1 3.2v10.6A1.2 1.2 0 0 0 2.2 15h11.6a1.2 1.2 0 0 0 1.2-1.2V3.2A1.2 1.2 0 0 0 13.8 2h-2V.2a.2.2 0 0 0-.2-.2h-1.2a.2.2 0 0 0-.2.2zM2.8 13.4a.2.2 0 0 1-.2-.2v-7c0-.11.09-.2.2-.2h10.4c.11 0 .2.09.2.2v7a.2.2 0 0 1-.2.2z"
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
export class KbqCalendarO16 extends KbqSvgIcon {}
