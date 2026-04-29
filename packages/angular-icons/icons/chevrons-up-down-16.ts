import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chevrons-up-down-16,[kbqChevronsUpDown16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M3.191 6.87 8 2.148l4.809 4.722a.203.203 0 0 0 .285 0l.845-.83c.081-.08.081-.21 0-.29L8.142.059a.203.203 0 0 0-.284 0L2.06 5.751c-.081.079-.081.21 0 .289l.846.83a.203.203 0 0 0 .284 0m9.618 2.26L8 13.852 3.191 9.13a.203.203 0 0 0-.284 0l-.846.83c-.081.08-.081.21 0 .29l5.797 5.692a.203.203 0 0 0 .284 0l5.797-5.693c.081-.079.081-.21 0-.289l-.845-.83a.203.203 0 0 0-.285 0"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChevronsUpDown16 extends KbqSvgIcon {}
