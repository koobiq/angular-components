import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-exists-16,[kbqExists16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M3.7 14a.2.2 0 0 1-.2-.2v-1.377c0-.11.09-.2.2-.2h6.43V8.68H4.654a.2.2 0 0 1-.2-.2v-1.35c0-.11.09-.2.2-.2h5.476V3.786H3.747a.2.2 0 0 1-.2-.2V2.2c0-.11.09-.2.2-.2H12.3c.11 0 .2.09.2.2v11.6c0-.39-.09.2-.2.2z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqExists16 extends KbqSvgIcon {}
