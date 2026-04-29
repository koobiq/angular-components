import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-table-badge-clock-16,[kbqTableBadgeClock16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M8.044 14a4.7 4.7 0 0 1-.244-1.5c0-.974.296-1.879.804-2.63V9.5c0-.11.09-.2.2-.2h.254c.49-.527 1.1-.942 1.786-1.2h-2.04a.2.2 0 0 1-.2-.2V5.204c0-.11.09-.2.2-.2H14.2c.11 0 .2.09.2.2V7.9a.2.2 0 0 1-.2.2h-.044A4.7 4.7 0 0 1 16 9.363v-6.1C15.985 2.562 15.453 2 14.8 2H1.2C.547 2 .015 2.562 0 3.262v9.446C0 13.42.537 14 1.2 14zM1.8 5.004h5.396c.11 0 .2.09.2.2V7.9a.2.2 0 0 1-.2.2H1.8a.2.2 0 0 1-.2-.2V5.204c0-.11.09-.2.2-.2m0 4.296h5.396c.11 0 .2.09.2.2v2.7a.2.2 0 0 1-.2.2H1.8a.2.2 0 0 1-.2-.2V9.5c0-.11.09-.2.2-.2"
                />
                <path
                    d="M13.1 12.9a.2.2 0 0 1-.2.2h-1.4a.2.2 0 0 1-.2-.2v-.6c0-.11.09-.2.2-.2h.6v-1.3c0-.11.09-.2.2-.2h.6c.11 0 .2.09.2.2z"
                />
                <path
                    d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m-1.05 0a2.45 2.45 0 1 0-4.9 0 2.45 2.45 0 0 0 4.9 0"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTableBadgeClock16 extends KbqSvgIcon {}
