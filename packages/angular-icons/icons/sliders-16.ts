import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-sliders-16,[kbqSliders16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M4.1 15a.2.2 0 0 0 .2-.2V13h1.5a.2.2 0 0 0 .2-.2v-2.1a.2.2 0 0 0-.2-.2H4.3V1.2a.2.2 0 0 0-.2-.2H2.9a.2.2 0 0 0-.2.2v9.3H1.2a.2.2 0 0 0-.2.2v2.1c0 .11.09.2.2.2h1.5v1.8c0 .11.09.2.2.2zM8.8 4.2v-3a.2.2 0 0 0-.2-.2H7.4a.2.2 0 0 0-.2.2v3H5.7a.2.2 0 0 0-.2.2v2.1c0 .11.09.2.2.2h1.5v8.1c0 .11.09.2.2.2h1.2a.2.2 0 0 0 .2-.2V6.7h1.5a.2.2 0 0 0 .2-.2V4.4a.2.2 0 0 0-.2-.2zM13.1 15a.2.2 0 0 0 .2-.2v-3.1h1.5a.2.2 0 0 0 .2-.2V9.4a.2.2 0 0 0-.2-.2h-1.5v-8a.2.2 0 0 0-.2-.2h-1.2a.2.2 0 0 0-.2.2v8h-1.5a.2.2 0 0 0-.2.2v2.1c0 .11.09.2.2.2h1.5v3.1c0 .11.09.2.2.2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqSliders16 extends KbqSvgIcon {}
