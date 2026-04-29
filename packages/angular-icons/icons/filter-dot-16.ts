import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-filter-dot-16,[kbqFilterDot16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path fill="currentColor" d="M16 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0" />
            <path
                d="M10.8 2H2.2a.2.2 0 0 0-.2.2v1.2c0 .378.178.733.48.96L6 7v5.258c0 .455.257.87.663 1.074l3.048 1.523a.2.2 0 0 0 .289-.179V7l2.742-2.057A3.2 3.2 0 0 1 10.8 2"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFilterDot16 extends KbqSvgIcon {}
