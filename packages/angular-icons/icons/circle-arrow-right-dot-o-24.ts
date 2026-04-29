import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-circle-arrow-right-dot-o-24,[kbqCircleArrowRightDotO24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g fill="currentColor">
                <path d="M16.64 3.593a3 3 0 0 1 1.627-1.829 3 3 0 1 1-1.627 1.83" />
                <path d="M16.64 3.593a3 3 0 0 1 1.627-1.829 3 3 0 1 1-1.627 1.83" />
            </g>
            <path
                d="M15.37 2.052a4.8 4.8 0 0 0-.668 2.31 8.102 8.102 0 0 0-10.712 6.43l9.555.005-3.107-3.107a.3.3 0 0 1 0-.424l1.201-1.2a.3.3 0 0 1 .425 0l5.72 5.72a.3.3 0 0 1 0 .424l-5.72 5.72a.3.3 0 0 1-.425 0l-1.2-1.2a.3.3 0 0 1 0-.425l3.095-3.095-9.545-.005a8.102 8.102 0 1 0 15.65-3.907 4.8 4.8 0 0 0 2.309-.668c.358 1.058.552 2.191.552 3.37 0 5.799-4.701 10.5-10.5 10.5S1.5 17.799 1.5 12 6.201 1.5 12 1.5c1.179 0 2.312.194 3.37.552"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCircleArrowRightDotO24 extends KbqSvgIcon {}
