import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chevrons-compress-16,[kbqChevronsCompress16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M1 6.05c0 .11.09.2.2.2h3.85a1.2 1.2 0 0 0 1.2-1.2V1.2a.2.2 0 0 0-.2-.2h-1.2a.2.2 0 0 0-.2.2v3.25a.2.2 0 0 1-.2.2H1.2a.2.2 0 0 0-.2.2zM1 9.95c0-.11.09-.2.2-.2h3.85a1.2 1.2 0 0 1 1.2 1.2v3.85a.2.2 0 0 1-.2.2h-1.2a.2.2 0 0 1-.2-.2v-3.25a.2.2 0 0 0-.2-.2H1.2a.2.2 0 0 1-.2-.2zM15 6.05a.2.2 0 0 1-.2.2h-3.85a1.2 1.2 0 0 1-1.2-1.2V1.2c0-.11.09-.2.2-.2h1.2c.11 0 .2.09.2.2v3.25c0 .11.09.2.2.2h3.25c.11 0 .2.09.2.2zM15 9.95a.2.2 0 0 0-.2-.2h-3.85a1.2 1.2 0 0 0-1.2 1.2v3.85c0 .11.09.2.2.2h1.2a.2.2 0 0 0 .2-.2v-3.25c0-.11.09-.2.2-.2h3.25a.2.2 0 0 0 .2-.2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChevronsCompress16 extends KbqSvgIcon {}
