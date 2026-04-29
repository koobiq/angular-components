import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-map-16,[kbqMap16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M11 2.152a.1.1 0 0 1 .142-.09l2.742 1.278a.2.2 0 0 1 .116.182v10.377a.1.1 0 0 1-.142.092l-2.742-1.745a.2.2 0 0 1-.116-.183zM5 13.846a.1.1 0 0 1-.142.09l-2.743-1.278A.2.2 0 0 1 2 12.476V2.101a.1.1 0 0 1 .142-.092l2.742 1.745c.07.033.116.105.116.183zM9.654 2.019a.1.1 0 0 1 .146.09v9.96a.2.2 0 0 1-.109.179L6.346 13.98a.1.1 0 0 1-.146-.09v-9.96c0-.075.042-.144.109-.179z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqMap16 extends KbqSvgIcon {}
