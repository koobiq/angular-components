import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-calendar-days-o-16,[kbqCalendarDaysO16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M5.8 2h4.4V.2c0-.11.09-.2.2-.2h1.2c.11 0 .2.09.2.2V2h2A1.2 1.2 0 0 1 15 3.2v10.6a1.2 1.2 0 0 1-1.2 1.2H2.2A1.2 1.2 0 0 1 1 13.8V3.2A1.2 1.2 0 0 1 2.2 2h2V.2c0-.11.09-.2.2-.2h1.2c.11 0 .2.09.2.2zM2.6 13.2c0 .11.09.2.2.2h10.4a.2.2 0 0 0 .2-.2v-7a.2.2 0 0 0-.2-.2H2.8a.2.2 0 0 0-.2.2zm1.12-6.1a.2.2 0 0 0-.2.2v1.733c0 .11.09.2.2.2h1.733a.2.2 0 0 0 .2-.2V7.3a.2.2 0 0 0-.2-.2zm3.413 0a.2.2 0 0 0-.2.2v1.733c0 .11.09.2.2.2h1.734a.2.2 0 0 0 .2-.2V7.3a.2.2 0 0 0-.2-.2zm-1.48 3.4a.2.2 0 0 0-.2-.2H3.72a.2.2 0 0 0-.2.2v1.733c0 .11.09.2.2.2h1.733a.2.2 0 0 0 .2-.2zm1.48-.2a.2.2 0 0 0-.2.2v1.733c0 .11.09.2.2.2h1.734a.2.2 0 0 0 .2-.2V10.5a.2.2 0 0 0-.2-.2zm5.347-3a.2.2 0 0 0-.2-.2h-1.733a.2.2 0 0 0-.2.2v1.733c0 .11.09.2.2.2h1.733a.2.2 0 0 0 .2-.2zm-1.933 3a.2.2 0 0 0-.2.2v1.733c0 .11.09.2.2.2h1.733a.2.2 0 0 0 .2-.2V10.5a.2.2 0 0 0-.2-.2z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCalendarDaysO16 extends KbqSvgIcon {}
