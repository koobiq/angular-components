import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-filter-dot-24,[kbqFilterDot24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M24 3a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
            <path
                d="M16.2 3H3.3a.3.3 0 0 0-.3.3v1.8c0 .567.267 1.1.72 1.44L9 10.5v7.888a1.8 1.8 0 0 0 .995 1.61l4.57 2.285a.3.3 0 0 0 .435-.268V10.5l4.113-3.085A4.8 4.8 0 0 1 16.2 3"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFilterDot24 extends KbqSvgIcon {}
