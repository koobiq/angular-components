import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-square-dot-16,[kbqSquareDot16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g fill="currentColor">
                <path d="M16 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0" />
                <path d="M16 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0" />
            </g>
            <path
                d="M15 5.04q-.474.158-1 .16A3.2 3.2 0 0 1 10.96 1H2.2A1.2 1.2 0 0 0 1 2.2v11.6A1.2 1.2 0 0 0 2.2 15h11.6a1.2 1.2 0 0 0 1.2-1.2z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqSquareDot16 extends KbqSvgIcon {}
