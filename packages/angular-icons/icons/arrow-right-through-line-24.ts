import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-right-through-line-24,[kbqArrowRightThroughLine24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M8.1 3a.3.3 0 0 0-.3.3V9h2.4V3.3a.3.3 0 0 0-.3-.3zM7.8 20.7V15h2.4v5.7a.3.3 0 0 1-.3.3H8.1a.3.3 0 0 1-.3-.3"
                />
                <path
                    d="m1.797 13.203 16.42.006-3.063 3.098a.283.283 0 0 0 0 .4l1.19 1.204a.303.303 0 0 0 .428 0l5.645-5.71a.283.283 0 0 0 0-.401l-5.645-5.711a.303.303 0 0 0-.428 0l-1.19 1.204a.283.283 0 0 0 0 .4l3.073 3.11-16.428-.006a.293.293 0 0 0-.298.289L1.5 12.914c0 .16.133.29.297.29"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowRightThroughLine24 extends KbqSvgIcon {}
