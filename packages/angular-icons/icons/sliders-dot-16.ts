import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-sliders-dot-16,[kbqSlidersDot16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M13.3 6.186q-.148.014-.3.014c-.463 0-.903-.098-1.3-.275V9.2h-1.5a.2.2 0 0 0-.2.2v2.1c0 .11.09.2.2.2h1.5v3.1c0 .11.09.2.2.2h1.2a.2.2 0 0 0 .2-.2v-3.1h1.5a.2.2 0 0 0 .2-.2V9.4a.2.2 0 0 0-.2-.2h-1.5zM10.033 4.2q.177.436.467.798V6.5a.2.2 0 0 1-.2.2H8.8v8.1a.2.2 0 0 1-.2.2H7.4a.2.2 0 0 1-.2-.2V6.7H5.7a.2.2 0 0 1-.2-.2V4.4c0-.11.09-.2.2-.2h1.5v-3c0-.11.09-.2.2-.2h1.2c.11 0 .2.09.2.2v3zM4.1 15a.2.2 0 0 0 .2-.2V13h1.5a.2.2 0 0 0 .2-.2v-2.1a.2.2 0 0 0-.2-.2H4.3V1.2a.2.2 0 0 0-.2-.2H2.9a.2.2 0 0 0-.2.2v9.3H1.2a.2.2 0 0 0-.2.2v2.1c0 .11.09.2.2.2h1.5v1.8c0 .11.09.2.2.2z"
                />
            </g>
            <g fill="currentColor">
                <path d="M15 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0" />
                <path d="M15 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0" />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqSlidersDot16 extends KbqSvgIcon {}
