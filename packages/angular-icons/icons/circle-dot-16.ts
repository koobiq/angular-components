import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-circle-dot-16,[kbqCircleDot16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path d="M10.247 1.368a7 7 0 1 0 4.385 4.385 3.2 3.2 0 0 1-4.385-4.385" />
            <g fill="currentColor">
                <path d="M15 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0" />
                <path d="M15 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0" />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCircleDot16 extends KbqSvgIcon {}
