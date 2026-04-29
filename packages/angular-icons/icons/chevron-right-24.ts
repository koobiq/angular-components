import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chevron-right-24,[kbqChevronRight24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M13.995 12 6.838 4.787a.3.3 0 0 1 0-.427L8.097 3.09a.31.31 0 0 1 .438 0l8.627 8.696a.3.3 0 0 1 0 .426L8.535 20.91a.31.31 0 0 1-.438 0L6.838 19.64a.3.3 0 0 1 0-.427z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChevronRight24 extends KbqSvgIcon {}
