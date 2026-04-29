import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-desktop-multiple-o-16,[kbqDesktopMultipleO16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M4 2.6h9.2c.11 0 .2.09.2.2V9h.4A1.2 1.2 0 0 0 15 7.8V2.2A1.2 1.2 0 0 0 13.8 1H5.2A1.2 1.2 0 0 0 4 2.2z"
                />
                <path
                    d="M11 3.8A1.2 1.2 0 0 1 12.2 5v5.6a1.2 1.2 0 0 1-1.2 1.2H7.9v1.6h2.4c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2H2.8a.2.2 0 0 1-.2-.2v-1.2c0-.11.09-.2.2-.2h2.4v-1.6h-3A1.2 1.2 0 0 1 1 10.6V5a1.2 1.2 0 0 1 1.2-1.2zm-.6 1.6H2.8a.2.2 0 0 0-.2.2V10c0 .11.09.2.2.2h7.6a.2.2 0 0 0 .2-.2V5.6a.2.2 0 0 0-.2-.2"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqDesktopMultipleO16 extends KbqSvgIcon {}
