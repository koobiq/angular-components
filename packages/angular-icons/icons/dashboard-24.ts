import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-dashboard-24,[kbqDashboard24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M12.9 20.7a1.8 1.8 0 0 0 1.8 1.8h6a1.8 1.8 0 0 0 1.8-1.8v-9a1.8 1.8 0 0 0-1.8-1.8h-6a1.8 1.8 0 0 0-1.8 1.8zM12.9 6.3a1.8 1.8 0 0 0 1.8 1.8h6a1.8 1.8 0 0 0 1.8-1.8v-3a1.8 1.8 0 0 0-1.8-1.8h-6a1.8 1.8 0 0 0-1.8 1.8zM11.1 3.3a1.8 1.8 0 0 0-1.8-1.8h-6a1.8 1.8 0 0 0-1.8 1.8v9a1.8 1.8 0 0 0 1.8 1.8h6a1.8 1.8 0 0 0 1.8-1.8zM11.1 17.7a1.8 1.8 0 0 0-1.8-1.8h-6a1.8 1.8 0 0 0-1.8 1.8v3a1.8 1.8 0 0 0 1.8 1.8h6a1.8 1.8 0 0 0 1.8-1.8z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqDashboard24 extends KbqSvgIcon {}
