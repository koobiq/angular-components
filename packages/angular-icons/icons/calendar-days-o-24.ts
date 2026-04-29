import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-calendar-days-o-24,[kbqCalendarDaysO24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M8.7 3h6.6V.3a.3.3 0 0 1 .3-.3h1.8a.3.3 0 0 1 .3.3V3h3a1.8 1.8 0 0 1 1.8 1.8v15.9a1.8 1.8 0 0 1-1.8 1.8H3.3a1.8 1.8 0 0 1-1.8-1.8V4.8A1.8 1.8 0 0 1 3.3 3h3V.3a.3.3 0 0 1 .3-.3h1.8a.3.3 0 0 1 .3.3zM3.9 19.8a.3.3 0 0 0 .3.3h15.6a.3.3 0 0 0 .3-.3V9.3a.3.3 0 0 0-.3-.3H4.2a.3.3 0 0 0-.3.3zm1.68-9.15a.3.3 0 0 0-.3.3v2.6a.3.3 0 0 0 .3.3h2.6a.3.3 0 0 0 .3-.3v-2.6a.3.3 0 0 0-.3-.3zm5.12 0a.3.3 0 0 0-.3.3v2.6a.3.3 0 0 0 .3.3h2.6a.3.3 0 0 0 .3-.3v-2.6a.3.3 0 0 0-.3-.3zm-2.22 5.1a.3.3 0 0 0-.3-.3h-2.6a.3.3 0 0 0-.3.3v2.6a.3.3 0 0 0 .3.3h2.6a.3.3 0 0 0 .3-.3zm2.22-.3a.3.3 0 0 0-.3.3v2.6a.3.3 0 0 0 .3.3h2.6a.3.3 0 0 0 .3-.3v-2.6a.3.3 0 0 0-.3-.3zm8.02-4.5a.3.3 0 0 0-.3-.3h-2.6a.3.3 0 0 0-.3.3v2.6a.3.3 0 0 0 .3.3h2.6a.3.3 0 0 0 .3-.3zm-2.9 4.5a.3.3 0 0 0-.3.3v2.6a.3.3 0 0 0 .3.3h2.6a.3.3 0 0 0 .3-.3v-2.6a.3.3 0 0 0-.3-.3z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCalendarDaysO24 extends KbqSvgIcon {}
