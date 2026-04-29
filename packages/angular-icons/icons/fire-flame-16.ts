import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-fire-flame-16,[kbqFireFlame16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M13.75 9.308c0-.8-.12-1.474-.487-2.3-.179-.402-.788-1.61-1.014-2.059a.1.1 0 0 0-.177-.002l-.79 1.446c-.344.632-.722 1.519-1.445 1.519-.714 0-1.032-.91-1.267-1.58A232 232 0 0 1 6.806 1.07c-.025-.077-.126-.096-.174-.03-.556.765-2.984 4.133-3.792 5.75a5.7 5.7 0 0 0-.59 2.515c0 .773.152 1.518.452 2.215a5.736 5.736 0 0 0 3.06 3.032C6.473 14.849 7.226 15 8 15c.773 0 1.526-.15 2.239-.446a5.7 5.7 0 0 0 1.826-1.219 5.6 5.6 0 0 0 1.232-1.809 5.6 5.6 0 0 0 .453-2.218"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFireFlame16 extends KbqSvgIcon {}
