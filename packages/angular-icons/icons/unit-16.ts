import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-unit-16,[kbqUnit16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M11.92 7.2h2.88c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2h-2.88a4.001 4.001 0 0 1-7.84 0H1.2a.2.2 0 0 1-.2-.2V7.4c0-.11.09-.2.2-.2h2.88a4.001 4.001 0 0 1 7.84 0"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqUnit16 extends KbqSvgIcon {}
