import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCalendarXmarkO16]',
    template: `
        <svg:path
            d="M5.8 2h4.4V.2c0-.11.09-.2.2-.2h1.2c.11 0 .2.09.2.2V2h2A1.2 1.2 0 0 1 15 3.2v10.6a1.2 1.2 0 0 1-1.2 1.2H2.2A1.2 1.2 0 0 1 1 13.8V3.2A1.2 1.2 0 0 1 2.2 2h2V.2c0-.11.09-.2.2-.2h1.2c.11 0 .2.09.2.2zM2.6 13.2c0 .11.09.2.2.2h10.4a.2.2 0 0 0 .2-.2v-7a.2.2 0 0 0-.2-.2H2.8a.2.2 0 0 0-.2.2zm2.619-5.293 1.934 1.934-1.934 1.935a.2.2 0 0 0 0 .283l.565.565a.2.2 0 0 0 .283 0l1.934-1.934 1.935 1.934a.2.2 0 0 0 .283 0l.565-.565a.2.2 0 0 0 0-.283L8.85 9.84l1.934-1.934a.2.2 0 0 0 0-.283l-.565-.565a.2.2 0 0 0-.283 0L8 8.993 6.067 7.059a.2.2 0 0 0-.283 0l-.565.565a.2.2 0 0 0 0 .283"
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
export class KbqCalendarXmarkO16 extends KbqSvgIcon {}
