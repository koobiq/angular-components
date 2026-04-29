import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-calendar-xmark-o-24,[kbqCalendarXmarkO24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M8.7 3h6.6V.3a.3.3 0 0 1 .3-.3h1.8a.3.3 0 0 1 .3.3V3h3a1.8 1.8 0 0 1 1.8 1.8v15.9a1.8 1.8 0 0 1-1.8 1.8H3.3a1.8 1.8 0 0 1-1.8-1.8V4.8A1.8 1.8 0 0 1 3.3 3h3V.3a.3.3 0 0 1 .3-.3h1.8a.3.3 0 0 1 .3.3zM3.9 19.8a.3.3 0 0 0 .3.3h15.6a.3.3 0 0 0 .3-.3V9.3a.3.3 0 0 0-.3-.3H4.2a.3.3 0 0 0-.3.3zm3.928-7.94 2.901 2.902-2.901 2.902a.3.3 0 0 0 0 .424l.848.848a.3.3 0 0 0 .425 0l2.901-2.901 2.902 2.901a.3.3 0 0 0 .424 0l.848-.848a.3.3 0 0 0 0-.424l-2.901-2.902 2.901-2.901a.3.3 0 0 0 0-.425l-.848-.848a.3.3 0 0 0-.424 0l-2.902 2.901-2.901-2.901a.3.3 0 0 0-.425 0l-.848.848a.3.3 0 0 0 0 .425"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCalendarXmarkO24 extends KbqSvgIcon {}
