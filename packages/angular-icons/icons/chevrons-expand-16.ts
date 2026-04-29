import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-chevrons-expand-16,[kbqChevronsExpand16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M2.8 2.6a.2.2 0 0 0-.2.2v3.45H1V2.2A1.2 1.2 0 0 1 2.2 1h3.85c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2zM6.25 13.6a.2.2 0 0 0-.2-.2H2.8a.2.2 0 0 1-.2-.2V9.95a.2.2 0 0 0-.2-.2H1.2a.2.2 0 0 0-.2.2v3.85A1.2 1.2 0 0 0 2.2 15h3.85a.2.2 0 0 0 .2-.2zM9.75 14.8c0 .11.09.2.2.2h3.85a1.2 1.2 0 0 0 1.2-1.2V9.95a.2.2 0 0 0-.2-.2h-1.2a.2.2 0 0 0-.2.2v3.25a.2.2 0 0 1-.2.2H9.95a.2.2 0 0 0-.2.2zM9.95 2.6a.2.2 0 0 1-.2-.2V1.2c0-.11.09-.2.2-.2h3.85A1.2 1.2 0 0 1 15 2.2v3.85a.2.2 0 0 1-.2.2h-1.2a.2.2 0 0 1-.2-.2V2.8a.2.2 0 0 0-.2-.2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqChevronsExpand16 extends KbqSvgIcon {}
