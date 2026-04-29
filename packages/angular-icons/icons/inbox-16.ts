import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-inbox-16,[kbqInbox16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M2.2 2A1.2 1.2 0 0 0 1 3.2v9.6A1.2 1.2 0 0 0 2.2 14h11.6a1.2 1.2 0 0 0 1.2-1.2V3.2A1.2 1.2 0 0 0 13.8 2zm.4 7.003V3.8c0-.11.09-.2.2-.2h10.4c.11 0 .2.09.2.2v5.203h-3.2c-.11 0-.2.09-.21.2a2 2 0 0 1-3.98 0 .216.216 0 0 0-.21-.2z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqInbox16 extends KbqSvgIcon {}
