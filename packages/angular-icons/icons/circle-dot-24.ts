import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-circle-dot-24,[kbqCircleDot24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M15.37 2.053A10.5 10.5 0 0 0 12 1.5C6.201 1.5 1.5 6.201 1.5 12S6.201 22.5 12 22.5 22.5 17.799 22.5 12c0-1.179-.194-2.312-.553-3.37a4.8 4.8 0 0 1-6.577-6.577"
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
export class KbqCircleDot24 extends KbqSvgIcon {}
