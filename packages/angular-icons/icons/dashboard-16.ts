import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-dashboard-16,[kbqDashboard16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M8.6 13.8A1.2 1.2 0 0 0 9.8 15h4a1.2 1.2 0 0 0 1.2-1.2v-6a1.2 1.2 0 0 0-1.2-1.2h-4a1.2 1.2 0 0 0-1.2 1.2zM8.6 4.2a1.2 1.2 0 0 0 1.2 1.2h4A1.2 1.2 0 0 0 15 4.2v-2A1.2 1.2 0 0 0 13.8 1h-4a1.2 1.2 0 0 0-1.2 1.2zM7.4 2.2A1.2 1.2 0 0 0 6.2 1h-4A1.2 1.2 0 0 0 1 2.2v6a1.2 1.2 0 0 0 1.2 1.2h4a1.2 1.2 0 0 0 1.2-1.2zM7.4 11.8a1.2 1.2 0 0 0-1.2-1.2h-4A1.2 1.2 0 0 0 1 11.8v2A1.2 1.2 0 0 0 2.2 15h4a1.2 1.2 0 0 0 1.2-1.2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqDashboard16 extends KbqSvgIcon {}
