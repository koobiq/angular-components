import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-scan-16,[kbqScan16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M2.4 11c.11 0 .2.09.2.2v2.2h2.2a.2.2 0 0 1 .2.2v1.2a.2.2 0 0 1-.2.2H1.2a.2.2 0 0 1-.2-.2v-3.6c0-.11.09-.2.2-.2zM14.8 11c.11 0 .2.09.2.2v3.6a.2.2 0 0 1-.2.2h-3.6a.2.2 0 0 1-.2-.2v-1.2c0-.11.09-.2.2-.2h2.2v-2.2a.2.2 0 0 1 .2-.2zM14.8 7c.11 0 .2.112.2.25v1.5c0 .138-.09.25-.2.25H1.2c-.11 0-.2-.112-.2-.25v-1.5c0-.138.09-.25.2-.25zM4.8 1c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2H2.6v2.2a.2.2 0 0 1-.2.2H1.2a.2.2 0 0 1-.2-.2V1.2c0-.11.09-.2.2-.2zM14.8 1c.11 0 .2.09.2.2v3.6a.2.2 0 0 1-.2.2h-1.2a.2.2 0 0 1-.2-.2V2.6h-2.2a.2.2 0 0 1-.2-.2V1.2c0-.11.09-.2.2-.2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqScan16 extends KbqSvgIcon {}
