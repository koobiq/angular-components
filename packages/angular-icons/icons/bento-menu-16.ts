import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-bento-menu-16,[kbqBentoMenu16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M1 1.2c0-.11.09-.2.2-.2h3.1c.11 0 .2.09.2.2v3.1a.2.2 0 0 1-.2.2H1.2a.2.2 0 0 1-.2-.2zM1 11.7c0-.11.09-.2.2-.2h3.1c.11 0 .2.09.2.2v3.1a.2.2 0 0 1-.2.2H1.2a.2.2 0 0 1-.2-.2zM4.5 6.45a.2.2 0 0 0-.2-.2H1.2a.2.2 0 0 0-.2.2v3.1c0 .11.09.2.2.2h3.1a.2.2 0 0 0 .2-.2zM11.5 1.2c0-.11.09-.2.2-.2h3.1c.11 0 .2.09.2.2v3.1a.2.2 0 0 1-.2.2h-3.1a.2.2 0 0 1-.2-.2zM15 11.7a.2.2 0 0 0-.2-.2h-3.1a.2.2 0 0 0-.2.2v3.1c0 .11.09.2.2.2h3.1a.2.2 0 0 0 .2-.2zM11.5 6.45c0-.11.09-.2.2-.2h3.1c.11 0 .2.09.2.2v3.1a.2.2 0 0 1-.2.2h-3.1a.2.2 0 0 1-.2-.2zM9.75 1.2a.2.2 0 0 0-.2-.2h-3.1a.2.2 0 0 0-.2.2v3.1c0 .11.09.2.2.2h3.1a.2.2 0 0 0 .2-.2zM6.25 11.7c0-.11.09-.2.2-.2h3.1c.11 0 .2.09.2.2v3.1a.2.2 0 0 1-.2.2h-3.1a.2.2 0 0 1-.2-.2zM9.75 6.45a.2.2 0 0 0-.2-.2h-3.1a.2.2 0 0 0-.2.2v3.1c0 .11.09.2.2.2h3.1a.2.2 0 0 0 .2-.2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBentoMenu16 extends KbqSvgIcon {}
