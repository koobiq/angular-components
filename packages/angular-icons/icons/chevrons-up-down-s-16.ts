import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chevrons-up-down-s-16,[kbqChevronsUpDownS16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M4.191 6.87 8 3.148l3.809 3.722a.203.203 0 0 0 .285 0l.845-.83c.081-.08.081-.21 0-.29L8.142 1.059a.203.203 0 0 0-.284 0L3.06 5.751c-.081.079-.081.21 0 .289l.846.83a.203.203 0 0 0 .284 0m7.618 2.26L8 12.852 4.191 9.13a.203.203 0 0 0-.284 0l-.846.83c-.081.08-.081.21 0 .29l4.797 4.692a.203.203 0 0 0 .284 0l4.797-4.693c.081-.079.081-.21 0-.289l-.845-.83a.203.203 0 0 0-.285 0"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChevronsUpDownS16 extends KbqSvgIcon {}
