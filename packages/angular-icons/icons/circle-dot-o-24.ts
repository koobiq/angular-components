import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-circle-dot-o-24,[kbqCircleDotO24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M15.371 2.053a4.8 4.8 0 0 0-.668 2.31 8.1 8.1 0 1 0 4.935 4.935 4.8 4.8 0 0 0 2.31-.67c.358 1.059.552 2.193.552 3.372 0 5.799-4.701 10.5-10.5 10.5S1.5 17.799 1.5 12 6.201 1.5 12 1.5c1.18 0 2.313.194 3.371.553"
            />
            <g fill="currentColor">
                <path d="M22.5 4.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                <path d="M22.5 4.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCircleDotO24 extends KbqSvgIcon {}
