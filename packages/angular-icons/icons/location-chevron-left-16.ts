import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-location-chevron-left-16,[kbqLocationChevronLeft16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M10.99 3.236q.01-.03.008-.06a.204.204 0 0 0-.31-.144L3.095 7.825a.208.208 0 0 0 0 .35l7.591 4.793c.128.08.29 0 .31-.145a.14.14 0 0 0-.006-.06L9.5 8z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqLocationChevronLeft16 extends KbqSvgIcon {}
