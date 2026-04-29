import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chevrons-down-up-s-16,[kbqChevronsDownUpS16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M11.809 1.058 8 4.78 4.191 1.058a.203.203 0 0 0-.284 0l-.846.83c-.081.08-.081.21 0 .29L7.858 6.87a.203.203 0 0 0 .284 0l4.797-4.692c.081-.08.081-.21 0-.29l-.845-.83a.203.203 0 0 0-.285 0M4.191 14.94 8 11.218l3.809 3.722a.203.203 0 0 0 .285 0l.845-.83c.081-.08.081-.21 0-.29L8.142 9.129a.203.203 0 0 0-.284 0L3.06 13.821c-.081.079-.081.21 0 .289l.845.83a.203.203 0 0 0 .285 0"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChevronsDownUpS16 extends KbqSvgIcon {}
