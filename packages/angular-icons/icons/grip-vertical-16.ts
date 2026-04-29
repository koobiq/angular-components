import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-grip-vertical-16,[kbqGripVertical16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M3.8 1.2c0-.11.09-.2.2-.2h2.75c.11 0 .2.09.2.2v2.83a.2.2 0 0 1-.2.2H4a.2.2 0 0 1-.2-.2zM3.8 6.585c0-.11.09-.2.2-.2h2.75c.11 0 .2.09.2.2v2.83a.2.2 0 0 1-.2.2H4a.2.2 0 0 1-.2-.2zM3.8 11.97c0-.111.09-.2.2-.2h2.75c.11 0 .2.089.2.2v2.83a.2.2 0 0 1-.2.2H4a.2.2 0 0 1-.2-.2zM9.05 1.2c0-.11.09-.2.2-.2H12c.11 0 .2.09.2.2v2.83a.2.2 0 0 1-.2.2H9.25a.2.2 0 0 1-.2-.2zM9.05 6.585c0-.11.09-.2.2-.2H12c.11 0 .2.09.2.2v2.83a.2.2 0 0 1-.2.2H9.25a.2.2 0 0 1-.2-.2zM9.05 11.97c0-.111.09-.2.2-.2H12c.11 0 .2.089.2.2v2.83a.2.2 0 0 1-.2.2H9.25a.2.2 0 0 1-.2-.2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqGripVertical16 extends KbqSvgIcon {}
