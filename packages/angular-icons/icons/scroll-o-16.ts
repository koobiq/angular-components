import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-scroll-o-16,[kbqScrollO16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M3.8 4.2c0-.11.09-.2.2-.2h4.8c.11 0 .2.09.2.2V5a.2.2 0 0 1-.2.2H4a.2.2 0 0 1-.2-.2zM3.805 7.07c0-.11.09-.2.2-.2h5.997c.11 0 .2.09.2.2v.8a.2.2 0 0 1-.2.2H4.005a.2.2 0 0 1-.2-.2z"
                />
                <path
                    d="M1 2.2v10.05a2.75 2.75 0 0 0 3 2.739V15h8a3 3 0 0 0 3-3V9.7a.2.2 0 0 0-.2-.2H13V2.2A1.2 1.2 0 0 0 11.8 1H2.2A1.2 1.2 0 0 0 1 2.2m3.9 7.5v2.55a1.15 1.15 0 1 1-2.3 0V11.1h.002V9.5H2.6V2.8c0-.11.09-.2.2-.2h8.4c.11 0 .2.09.2.2v6.7H5.1a.2.2 0 0 0-.2.2"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqScrollO16 extends KbqSvgIcon {}
